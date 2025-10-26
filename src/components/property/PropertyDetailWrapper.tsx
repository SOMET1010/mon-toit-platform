import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyDetail from '@/pages/PropertyDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Search, AlertCircle } from 'lucide-react';

/**
 * Wrapper pour PropertyDetail avec validation d'ID et gestion d'erreur
 * Empêche les erreurs dues à des IDs invalides
 */
export function PropertyDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Validation UUID
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Si l'ID est invalide, afficher une erreur propre
  if (!id || !isValidUUID(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              Bien introuvable
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Le bien que vous recherchez n'existe pas ou a été supprimé.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/recherche')}
                className="flex-1 gap-2"
              >
                <Search className="w-4 h-4" />
                Rechercher un bien
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si l'ID est valide, afficher PropertyDetail normalement
  return <PropertyDetail />;
}

