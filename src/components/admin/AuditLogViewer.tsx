import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from './DataTable';
import { Badge } from '@/components/ui/badge';
import { Download, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  notes: string | null;
  created_at: string;
  admin?: {
    full_name: string;
    email: string;
  };
}

const actionTypeLabels: Record<string, string> = {
  lease_certified: 'Bail certifié',
  lease_rejected: 'Bail rejeté',
  lease_pending: 'Bail en attente',
  role_assigned: 'Rôle attribué',
  role_revoked: 'Rôle révoqué',
  dispute_open: 'Litige ouvert',
  dispute_resolved: 'Litige résolu',
  dispute_in_progress: 'Litige en cours',
};

const getActionBadgeVariant = (actionType: string) => {
  if (actionType.includes('certified') || actionType.includes('resolved')) return 'default';
  if (actionType.includes('rejected')) return 'destructive';
  if (actionType.includes('assigned')) return 'secondary';
  return 'outline';
};

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter, targetFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les logs d\'audit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        log =>
          log.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action_type === actionFilter);
    }

    if (targetFilter !== 'all') {
      filtered = filtered.filter(log => log.target_type === targetFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Admin ID', 'Action', 'Type Cible', 'ID Cible', 'Notes'];
    const csvData = filteredLogs.map(log => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
      log.admin_id,
      actionTypeLabels[log.action_type] || log.action_type,
      log.target_type,
      log.target_id,
      log.notes || '',
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const columns: Column<AuditLog>[] = [
    {
      header: '',
      accessor: (log) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(log.id)}
        >
          {expandedRows.has(log.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
      className: 'w-12',
    },
    {
      header: 'Date',
      accessor: (log) => format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
      className: 'font-medium',
    },
    {
      header: 'Admin ID',
      accessor: (log) => (
        <span className="font-mono text-xs">{log.admin_id.slice(0, 8)}...</span>
      ),
    },
    {
      header: 'Action',
      accessor: (log) => (
        <Badge variant={getActionBadgeVariant(log.action_type) as any}>
          {actionTypeLabels[log.action_type] || log.action_type}
        </Badge>
      ),
    },
    {
      header: 'Type',
      accessor: 'target_type',
    },
    {
      header: 'Notes',
      accessor: (log) => (
        <span className="text-sm text-muted-foreground truncate max-w-xs block">
          {log.notes || '-'}
        </span>
      ),
    },
  ];

  const uniqueActions = Array.from(new Set(logs.map(l => l.action_type)));
  const uniqueTargets = Array.from(new Set(logs.map(l => l.target_type)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal d'Audit</CardTitle>
        <CardDescription>
          Historique de toutes les actions administratives sensibles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>
                  {actionTypeLabels[action] || action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={targetFilter} onValueChange={setTargetFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type de cible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les cibles</SelectItem>
              {uniqueTargets.map(target => (
                <SelectItem key={target} value={target}>
                  {target}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="space-y-2">
          <DataTable
            data={filteredLogs}
            columns={columns}
            loading={loading}
            emptyMessage="Aucun log d'audit trouvé"
          />
          
          {filteredLogs.map(log => (
            expandedRows.has(log.id) && (
              <Card key={`detail-${log.id}`} className="ml-12 bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">ID Cible</p>
                      <p className="font-mono text-xs">{log.target_id}</p>
                    </div>
                    <div>
                      <p className="font-semibold">ID Admin</p>
                      <p className="font-mono text-xs">{log.admin_id}</p>
                    </div>
                    {log.ip_address && (
                      <div>
                        <p className="font-semibold">Adresse IP</p>
                        <p className="font-mono text-xs">{log.ip_address}</p>
                      </div>
                    )}
                    {log.user_agent && (
                      <div className="col-span-2">
                        <p className="font-semibold">User Agent</p>
                        <p className="text-xs text-muted-foreground truncate">{log.user_agent}</p>
                      </div>
                    )}
                    {log.old_values && (
                      <div className="col-span-2">
                        <p className="font-semibold mb-2">Anciennes valeurs</p>
                        <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_values && (
                      <div className="col-span-2">
                        <p className="font-semibold mb-2">Nouvelles valeurs</p>
                        <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredLogs.length} log(s) affiché(s) sur {logs.length} au total
        </div>
      </CardContent>
    </Card>
  );
}