import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import ApplicationDetail from '@/components/application/ApplicationDetail';

type Application = {
  id: string;
  property_id: string;
  applicant_id: string;
  status: string;
  cover_letter: string;
  documents: any[];
  application_score: number;
  created_at: string;
  reviewed_at: string | null;
  properties: {
    title: string;
    monthly_rent: number;
    city: string;
  };
  profiles: {
    full_name: string;
    phone: string;
    oneci_verified: boolean;
    cnam_verified: boolean;
  };
};

const Applications = () => {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('rental_applications')
        .select(`
          id,
          property_id,
          applicant_id,
          status,
          cover_letter,
          documents,
          application_score,
          created_at,
          reviewed_at,
          properties:property_id (title, monthly_rent, city),
          profiles:applicant_id (full_name, phone, oneci_verified, cnam_verified)
        `)
        .order('created_at', { ascending: false });

      // Si propriétaire, voir les candidatures sur ses biens
      if (profile?.user_type === 'proprietaire' || profile?.user_type === 'agence') {
        const { data: myProperties } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id);

        const propertyIds = myProperties?.map(p => p.id) || [];
        query = query.in('property_id', propertyIds);
      } else {
        // Si locataire, voir ses propres candidatures
        query = query.eq('applicant_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data as any || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les candidatures',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rental_applications')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Statut mis à jour',
        description: `Candidature ${newStatus === 'approved' ? 'approuvée' : 'rejetée'}`,
      });

      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la candidature',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'pending': 'secondary',
      'approved': 'default',
      'rejected': 'destructive',
      'withdrawn': 'outline',
    };

    const labels: Record<string, string> = {
      'pending': 'En attente',
      'approved': 'Approuvée',
      'rejected': 'Rejetée',
      'withdrawn': 'Retirée',
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const isOwner = profile?.user_type === 'proprietaire' || profile?.user_type === 'agence';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedApplication) {
    return (
      <ApplicationDetail
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onStatusUpdate={updateApplicationStatus}
        isOwner={isOwner}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            {isOwner ? 'Candidatures reçues' : 'Mes candidatures'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isOwner 
              ? 'Gérez les candidatures pour vos biens immobiliers' 
              : 'Suivez l\'état de vos candidatures locatives'}
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Toutes ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({applications.filter(a => a.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvées ({applications.filter(a => a.status === 'approved').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ApplicationsList 
              applications={applications}
              onSelect={setSelectedApplication}
              getStatusBadge={getStatusBadge}
              isOwner={isOwner}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <ApplicationsList 
              applications={applications.filter(a => a.status === 'pending')}
              onSelect={setSelectedApplication}
              getStatusBadge={getStatusBadge}
              isOwner={isOwner}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <ApplicationsList 
              applications={applications.filter(a => a.status === 'approved')}
              onSelect={setSelectedApplication}
              getStatusBadge={getStatusBadge}
              isOwner={isOwner}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

const ApplicationsList = ({ 
  applications, 
  onSelect, 
  getStatusBadge,
  isOwner 
}: { 
  applications: Application[];
  onSelect: (app: Application) => void;
  getStatusBadge: (status: string) => JSX.Element;
  isOwner: boolean;
}) => {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune candidature
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {(application.properties as any)?.title}
                </CardTitle>
                <CardDescription>
                  {isOwner 
                    ? `Candidat: ${(application.profiles as any)?.full_name}`
                    : (application.properties as any)?.city
                  }
                </CardDescription>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Loyer: {(application.properties as any)?.monthly_rent.toLocaleString()} FCFA
                  </span>
                  {isOwner && (
                    <div className="flex gap-2">
                      {(application.profiles as any)?.oneci_verified && (
                        <Badge variant="outline" className="text-xs">ONECI ✓</Badge>
                      )}
                      {(application.profiles as any)?.cnam_verified && (
                        <Badge variant="outline" className="text-xs">CNAM ✓</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-muted-foreground">
                  Déposée le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                </div>
                {application.application_score > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Score:</span>
                    <Badge variant="default">{application.application_score}/100</Badge>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(application)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir détails
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Applications;
