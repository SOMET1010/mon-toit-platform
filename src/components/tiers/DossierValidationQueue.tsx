import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TenantScoreBreakdown } from '@/components/application/TenantScoreBreakdown';

interface Application {
  id: string;
  applicant_id: string;
  property_id: string;
  status: string;
  application_score: number;
  created_at: string;
  cover_letter: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  properties: {
    title: string;
    address: string;
    city: string;
  };
}

interface DossierValidationQueueProps {
  onUpdate?: () => void;
}

const DossierValidationQueue = ({ onUpdate }: DossierValidationQueueProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rental_applications')
      .select(`
        *,
        profiles!rental_applications_applicant_id_fkey (full_name, avatar_url),
        properties (title, address, city)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les dossiers',
        variant: 'destructive'
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (applicationId: string, newStatus: 'approved' | 'rejected' | 'pending', reason?: string) => {
    const { error } = await supabase
      .from('rental_applications')
      .update({ 
        status: newStatus,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le dossier',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Succès',
      description: `Dossier ${newStatus === 'approved' ? 'validé' : 'rejeté'} avec succès`
    });

    fetchApplications();
    onUpdate?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Aucun dossier en attente de validation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{app.profiles.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {app.properties.title} - {app.properties.city}
                </p>
              </div>
              <Badge variant="outline">
                {new Date(app.created_at).toLocaleDateString('fr-FR')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Application Score */}
            {app.application_score > 0 && (
              <TenantScoreBreakdown 
                score={app.application_score}
                breakdown={{
                  identity_verification: 15,
                  employment_verification: 15,
                  payment_history: 15,
                  income_ratio: 20,
                  documents: 15,
                  profile_completeness: 10
                }}
                recommendation={
                  app.application_score >= 70 ? 'approved' :
                  app.application_score >= 50 ? 'conditional' : 'rejected'
                }
              />
            )}

            {/* Cover Letter */}
            {app.cover_letter && (
              <div>
                <h4 className="font-semibold mb-2">Lettre de motivation</h4>
                <p className="text-sm text-muted-foreground">{app.cover_letter}</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Notes de validation</label>
              <Textarea
                placeholder="Ajoutez des notes concernant ce dossier..."
                value={notes[app.id] || ''}
                onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleAction(app.id, 'approved')}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Valider
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction(app.id, 'pending', notes[app.id])}
                className="flex-1"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Demander compléments
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction(app.id, 'rejected', notes[app.id])}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DossierValidationQueue;
