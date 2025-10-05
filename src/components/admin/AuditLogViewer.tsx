import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTable, Column } from './DataTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  };
}

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
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Fetch admin profiles separately
      const adminIds = Array.from(new Set(data?.map(log => log.admin_id) || []));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', adminIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const logsWithProfiles = data?.map(log => ({
        ...log,
        admin: profilesMap.get(log.admin_id),
      })) || [];

      setLogs(logsWithProfiles as AuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
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
        (log) =>
          log.target_id.includes(searchTerm) ||
          log.admin?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action_type.includes(actionFilter));
    }

    if (targetFilter !== 'all') {
      filtered = filtered.filter((log) => log.target_type === targetFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Admin', 'Action', 'Type', 'Target ID', 'Notes'];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr }),
      log.admin?.full_name || 'Système',
      log.action_type,
      log.target_type,
      log.target_id,
      log.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: `${filteredLogs.length} logs exportés`,
    });
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getActionBadgeVariant = (action: string): 'default' | 'destructive' | 'secondary' => {
    if (action.includes('certified')) return 'default';
    if (action.includes('rejected') || action.includes('revoked')) return 'destructive';
    return 'secondary';
  };

  const columns: Column<AuditLog>[] = [
    {
      header: '',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(row.id)}
        >
          {expandedRows.has(row.id) ? (
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
      accessor: (row) => format(new Date(row.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
      className: 'font-medium',
    },
    {
      header: 'Admin',
      accessor: (row) => row.admin?.full_name || 'Système',
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Badge variant={getActionBadgeVariant(row.action_type)}>
          {row.action_type.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Type',
      accessor: 'target_type',
    },
    {
      header: 'Target ID',
      accessor: (row) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.target_id.slice(0, 8)}...
        </code>
      ),
    },
  ];

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action_type)));
  const uniqueTargets = Array.from(new Set(logs.map((log) => log.target_type)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Journal d'Audit</CardTitle>
            <CardDescription>
              Traçabilité complète des actions administratives
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par admin, target ID, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de cible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {uniqueTargets.map((target) => (
                  <SelectItem key={target} value={target}>
                    {target}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg">
                <DataTable
                  data={[log]}
                  columns={columns}
                  loading={loading}
                />
                {expandedRows.has(log.id) && (
                  <div className="p-4 bg-muted/50 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {log.old_values && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Anciennes valeurs</h4>
                          <pre className="text-xs bg-background p-3 rounded border overflow-auto">
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Nouvelles valeurs</h4>
                          <pre className="text-xs bg-background p-3 rounded border overflow-auto">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    {log.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{log.notes}</p>
                      </div>
                    )}
                    {(log.ip_address || log.user_agent) && (
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        {log.ip_address && (
                          <div>
                            <span className="font-medium">IP:</span> {log.ip_address}
                          </div>
                        )}
                        {log.user_agent && (
                          <div>
                            <span className="font-medium">User Agent:</span> {log.user_agent}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log d'audit trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
