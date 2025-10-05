import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { logger } from '@/services/logger';
import type { Property as PropertyType, STATUS_VARIANTS } from '@/types';
import { STATUS_VARIANTS as statusVariants, STATUS_LABELS as statusLabels } from '@/types';

type Property = Pick<PropertyType, 
  'id' | 'title' | 'city' | 'monthly_rent' | 'status' | 'created_at' | 'owner_id'
> & {
  profiles: {
    full_name: string;
  };
};

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          city,
          monthly_rent,
          status,
          created_at,
          owner_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const ownerIds = [...new Set(data.map(p => p.owner_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ownerIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const propertiesWithProfiles = data.map(property => ({
          ...property,
          profiles: profilesMap.get(property.owner_id) || { full_name: 'Inconnu' }
        }));

        setProperties(propertiesWithProfiles);
      } else {
        setProperties([]);
      }
    } catch (error) {
      logger.error('Failed to fetch properties for admin', { error });
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les biens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Bien ${newStatus === 'disponible' ? 'approuvé' : 'rejeté'}`,
      });

      fetchProperties();
    } catch (error) {
      logger.error('Failed to update property status', { error, propertyId, newStatus });
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le bien',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return <Badge variant={statusVariants[status] || 'outline'}>{statusLabels[status] || status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des biens immobiliers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Loyer</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucun bien trouvé
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{(property.profiles as any)?.full_name}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>{property.monthly_rent.toLocaleString()} FCFA</TableCell>
                  <TableCell>{getStatusBadge(property.status)}</TableCell>
                  <TableCell>{new Date(property.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/property/${property.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {property.status === 'en_attente' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updatePropertyStatus(property.id, 'disponible')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updatePropertyStatus(property.id, 'refuse')}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminProperties;
