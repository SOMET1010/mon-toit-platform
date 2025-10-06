import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type SeedStatus = 'idle' | 'seeding' | 'success' | 'error';

interface SeedResult {
  users: number;
  properties: number;
  applications: number;
  leases: number;
  favorites: number;
  messages: number;
  searches: number;
  reviews: number;
  overdueApplications: number;
}

export const SeedDemoDataButton = () => {
  const [status, setStatus] = useState<SeedStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<SeedResult>({
    users: 0,
    properties: 0,
    applications: 0,
    leases: 0,
    favorites: 0,
    messages: 0,
    searches: 0,
    reviews: 0,
    overdueApplications: 0
  });
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    try {
      setError(null);
      setStatus('seeding');
      setProgress(10);
      
      // Appeler la fonction Edge seed-demo-data
      const { data, error: functionError } = await supabase.functions.invoke('seed-demo-data', {
        body: {}
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Mettre à jour les statistiques avec les résultats
      if (data?.result) {
        setStats({
          users: data.result.users || 0,
          properties: data.result.properties || 0,
          applications: data.result.applications || 0,
          leases: data.result.leases || 0,
          favorites: data.result.favorites || 0,
          messages: data.result.messages || 0,
          searches: data.result.searches || 0,
          reviews: data.result.reviews || 0,
          overdueApplications: data.result.overdueApplications || 0
        });
      }

      setProgress(100);
      setStatus('success');
      
      const totalUsers = data?.result?.users || 0;
      const totalProperties = data?.result?.properties || 0;
      const totalApplications = data?.result?.applications || 0;
      const totalLeases = data?.result?.leases || 0;
      
      toast.success('Données de démo créées avec succès!', {
        description: `${totalUsers} utilisateurs, ${totalProperties} propriétés, ${totalApplications} candidatures, ${totalLeases} baux créés.`
      });
    } catch (err: any) {
      console.error('Error seeding data:', err);
      setStatus('error');
      setError(err.message || 'Erreur lors de la création des données');
      toast.error('Erreur lors de la création des données', {
        description: err.message || 'Une erreur est survenue'
      });
      setProgress(0);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'seeding':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'seeding':
        return 'Génération en cours...';
      case 'success':
        return 'Données créées avec succès!';
      case 'error':
        return 'Erreur lors de la génération';
      default:
        return 'Prêt à générer les données';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Générer des données de démonstration
        </CardTitle>
        <CardDescription>
          Créer un jeu de données complet pour tester la plateforme : utilisateurs, propriétés, candidatures, baux, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              disabled={status === 'seeding'}
              className="w-full"
            >
              {status === 'seeding' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Générer les données
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Générer les données de démonstration ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va créer un ensemble complet de données de test incluant :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>17 utilisateurs (propriétaires, agences, locataires, admins)</li>
                  <li>18 propriétés dans différents quartiers d'Abidjan</li>
                  <li>25 candidatures (dont 3 en retard)</li>
                  <li>4 baux (dont 2 certifiés ANSUT)</li>
                  <li>Favoris, messages et avis</li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Note :</strong> Cette opération peut prendre quelques instants.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSeedData}>
                Générer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-lg bg-green-500/10 p-4 space-y-2">
            <h4 className="font-semibold text-green-700 dark:text-green-400">
              Données créées avec succès
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {stats.users} utilisateurs</li>
              <li>• {stats.properties} propriétés</li>
              <li>• {stats.applications} candidatures</li>
              <li>• {stats.leases} baux</li>
              <li>• {stats.favorites} favoris</li>
              <li>• {stats.messages} messages</li>
              <li>• {stats.searches} recherches</li>
              <li>• {stats.reviews} avis</li>
              {stats.overdueApplications > 0 && (
                <li>• {stats.overdueApplications} candidatures en retard traitées</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
