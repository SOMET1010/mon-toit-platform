import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Dispute {
  id: string;
  lease_id: string | null;
  reporter_id: string;
  reported_id: string;
  dispute_type: string;
  description: string;
  status: string;
  resolution_notes: string | null;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  reporter: { full_name: string } | null;
  reported: { full_name: string } | null;
}

const DisputeManager = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      let query = supabase
        .from('disputes')
        .select(`
          *,
          reporter:reporter_id(full_name),
          reported:reported_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDisputes((data || []) as unknown as Dispute[]);
    } catch (error) {
      logger.error('Error fetching disputes', { error, filter });
    } finally {
      setLoading(false);
    }
  };

  const updateDispute = async (disputeId: string, updates: Partial<Dispute>) => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update(updates)
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: "Litige mis à jour",
        description: "Le litige a été mis à jour avec succès",
      });

      fetchDisputes();
      setSelectedDispute(null);
    } catch (error) {
      logger.error('Error updating dispute', { error, disputeId, updates });
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le litige",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: 'destructive',
      in_review: 'secondary',
      resolved: 'default',
      closed: 'outline'
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des litiges</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="open">Ouverts</SelectItem>
            <SelectItem value="in_review">En révision</SelectItem>
            <SelectItem value="resolved">Résolus</SelectItem>
            <SelectItem value="closed">Fermés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {disputes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Aucun litige trouvé</p>
            </CardContent>
          </Card>
        ) : (
          disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(dispute.priority)}
                  <CardTitle className="text-base">
                    {dispute.dispute_type}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(dispute.status)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedDispute(dispute)}>
                        Gérer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Détails du litige</DialogTitle>
                      </DialogHeader>
                      {selectedDispute && (
                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Rapporteur</Label>
                              <p className="text-sm">{selectedDispute.reporter?.full_name || 'N/A'}</p>
                            </div>
                            <div>
                              <Label>Signalé</Label>
                              <p className="text-sm">{selectedDispute.reported?.full_name || 'N/A'}</p>
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedDispute.description}
                            </p>
                          </div>

                          <div>
                            <Label>Date de création</Label>
                            <p className="text-sm">
                              {format(new Date(selectedDispute.created_at), 'PPP à HH:mm', { locale: fr })}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Statut</Label>
                            <Select
                              defaultValue={selectedDispute.status}
                              onValueChange={(value) => {
                                updateDispute(selectedDispute.id, {
                                  status: value,
                                  resolved_at: value === 'resolved' ? new Date().toISOString() : null
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Ouvert</SelectItem>
                                <SelectItem value="in_review">En révision</SelectItem>
                                <SelectItem value="resolved">Résolu</SelectItem>
                                <SelectItem value="closed">Fermé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Priorité</Label>
                            <Select
                              defaultValue={selectedDispute.priority}
                              onValueChange={(value) => {
                                updateDispute(selectedDispute.id, { priority: value });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Basse</SelectItem>
                                <SelectItem value="medium">Moyenne</SelectItem>
                                <SelectItem value="high">Haute</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes de résolution</Label>
                            <Textarea
                              defaultValue={selectedDispute.resolution_notes || ''}
                              placeholder="Ajouter des notes..."
                              onBlur={(e) => {
                                if (e.target.value !== selectedDispute.resolution_notes) {
                                  updateDispute(selectedDispute.id, { resolution_notes: e.target.value });
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dispute.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>De: {dispute.reporter?.full_name || 'N/A'}</span>
                    <span>Contre: {dispute.reported?.full_name || 'N/A'}</span>
                    <span>{format(new Date(dispute.created_at), 'PPP', { locale: fr })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DisputeManager;