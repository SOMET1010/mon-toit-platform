/**
 * Dashboard de l'Agent de Confiance ANSUT
 * Validation des résultats de vérification Smile ID
 */

import { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Search,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function TrustAgentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Données de démonstration (à remplacer par des appels Supabase)
  const stats = {
    pending: 12,
    approved_today: 8,
    approved_this_week: 34,
    rejected_this_month: 3,
    success_rate: 92.5,
    avg_processing_time: 1.8
  };

  const pendingVerifications = [
    {
      id: '1',
      tenant_name: 'Kouadio Marc',
      tenant_email: 'kouadio.marc@example.com',
      submitted_at: '2025-10-26 09:30',
      smile_id_result: 'Verified',
      smile_id_confidence: 98.5,
      similarity_score: 96.2,
      liveness_check: true,
      selfie_to_id_match: true
    },
    {
      id: '2',
      tenant_name: 'Adjoua Sarah',
      tenant_email: 'adjoua.sarah@example.com',
      submitted_at: '2025-10-26 10:15',
      smile_id_result: 'Verified',
      smile_id_confidence: 95.8,
      similarity_score: 94.1,
      liveness_check: true,
      selfie_to_id_match: true
    },
    {
      id: '3',
      tenant_name: 'Yao Serge',
      tenant_email: 'yao.serge@example.com',
      submitted_at: '2025-10-26 11:00',
      smile_id_result: 'Not Verified',
      smile_id_confidence: 62.3,
      similarity_score: 58.7,
      liveness_check: false,
      selfie_to_id_match: false
    }
  ];

  const getResultBadge = (result: string) => {
    if (result === 'Verified') {
      return <Badge className="bg-green-600">Vérifié</Badge>;
    } else if (result === 'Not Verified') {
      return <Badge variant="destructive">Non vérifié</Badge>;
    }
    return <Badge variant="outline">En attente</Badge>;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Dashboard Agent de Confiance</h1>
          </div>
          <p className="text-muted-foreground">
            Validation des vérifications Smile ID pour certification ANSUT
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Vérifications à valider</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvées (semaine)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved_this_week}</div>
              <p className="text-xs text-muted-foreground">+{stats.approved_today} aujourd'hui</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.success_rate}%</div>
              <p className="text-xs text-muted-foreground">
                Temps moyen: {stats.avg_processing_time}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetées (mois)</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected_this_month}</div>
              <p className="text-xs text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              En attente ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approuvées
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejetées
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingVerifications.map((verification) => (
              <Card key={verification.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{verification.tenant_name}</CardTitle>
                      <CardDescription>{verification.tenant_email}</CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        Soumis le {verification.submitted_at}
                      </p>
                    </div>
                    {getResultBadge(verification.smile_id_result)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Résultats Smile ID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confiance</p>
                        <p className={`text-lg font-bold ${getConfidenceColor(verification.smile_id_confidence)}`}>
                          {verification.smile_id_confidence}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Similarité</p>
                        <p className={`text-lg font-bold ${getConfidenceColor(verification.similarity_score)}`}>
                          {verification.similarity_score}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Liveness</p>
                        <p className="text-lg">
                          {verification.liveness_check ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Match ID</p>
                        <p className="text-lg">
                          {verification.selfie_to_id_match ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2"
                        onClick={() => navigate(`/trust-agent/verify/${verification.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        Examiner et valider
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historique des certifications approuvées</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historique des certifications rejetées</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

