import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyMandates } from '@/hooks/useAgencyMandates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Users } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { InviteAgencyDialog } from '@/components/mandates/InviteAgencyDialog';
import { MandateCard } from '@/components/mandates/MandateCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyMandates() {
  const { profile } = useAuth();
  const { asOwner, isLoading } = useAgencyMandates();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Redirection si pas propriétaire
  if (profile && profile.user_type !== 'proprietaire' && profile.user_type !== 'agence') {
    return <Navigate to="/dashboard" replace />;
  }

  const activeMandates = asOwner.filter(m => m.status === 'active');
  const pendingMandates = asOwner.filter(m => m.status === 'pending');
  const terminatedMandates = asOwner.filter(m => 
    m.status === 'terminated' || m.status === 'expired'
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes mandats de gestion</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les agences qui ont accès à vos biens
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Inviter une agence
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mandats actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMandates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {asOwner.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMandates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Invitations envoyées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{terminatedMandates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Historique
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des mandats */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Actifs ({activeMandates.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente ({pendingMandates.length})
          </TabsTrigger>
          <TabsTrigger value="terminated">
            Terminés ({terminatedMandates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeMandates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun mandat actif</h3>
                  <p className="text-muted-foreground mb-4">
                    Invitez une agence pour commencer à déléguer la gestion de vos biens
                  </p>
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Inviter une agence
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeMandates.map(mandate => (
                <MandateCard key={mandate.id} mandate={mandate} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingMandates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Aucune invitation en attente
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingMandates.map(mandate => (
                <MandateCard key={mandate.id} mandate={mandate} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="terminated" className="space-y-4">
          {terminatedMandates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Aucun mandat terminé
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {terminatedMandates.map(mandate => (
                <MandateCard key={mandate.id} mandate={mandate} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InviteAgencyDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
