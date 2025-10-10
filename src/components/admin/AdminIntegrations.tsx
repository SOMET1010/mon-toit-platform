import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, CreditCard, Save, CheckCircle, XCircle, Scan, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationConfig {
  name: string;
  status: "configured" | "not_configured";
  icon: typeof Shield;
  description: string;
}

const AdminIntegrations = () => {
  const { toast } = useToast();
  
  // CinetPay Configuration
  const [cinetpayApiKey, setCinetpayApiKey] = useState("");
  const [cinetpaySiteId, setCinetpaySiteId] = useState("");
  const [cinetpaySecretKey, setCinetpaySecretKey] = useState("");
  
  // Brevo Configuration
  const [brevoApiKey, setBrevoApiKey] = useState("");
  
  // Azure Face API Configuration
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureApiKey, setAzureApiKey] = useState("");
  
  // Loading states
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  
  const integrations: IntegrationConfig[] = [
    {
      name: "CinetPay",
      status: cinetpayApiKey ? "configured" : "not_configured",
      icon: CreditCard,
      description: "Paiements Mobile Money (Orange, MTN, Wave, Moov)"
    },
    {
      name: "Brevo",
      status: brevoApiKey ? "configured" : "not_configured",
      icon: Mail,
      description: "Emails transactionnels et notifications"
    },
    {
      name: "Azure Face API",
      status: azureApiKey ? "configured" : "not_configured",
      icon: Scan,
      description: "Vérification faciale biométrique"
    }
  ];

  // Vérifier les rôles au chargement
  useEffect(() => {
    checkSuperAdminRole();
  }, []);

  const checkSuperAdminRole = async () => {
    setIsCheckingRole(true);
    try {
      const { data, error } = await supabase.rpc('verify_user_role', {
        _role: 'super_admin'
      });
      
      if (error) throw error;
      setIsSuperAdmin(data === true);
      
      // Si super admin, charger les secrets
      if (data === true) {
        loadIntegrationSecrets();
      }
    } catch (error) {
      console.error('Error checking role:', error);
      setIsSuperAdmin(false);
    } finally {
      setIsCheckingRole(false);
    }
  };

  const loadIntegrationSecrets = async () => {
    try {
      // CinetPay
      const { data: cinetpayData } = await supabase.rpc('get_integration_secret', {
        p_integration_name: 'cinetpay'
      });
      
      if (cinetpayData) {
        setCinetpayApiKey(cinetpayData.apiKey || '');
        setCinetpaySiteId(cinetpayData.siteId || '');
        setCinetpaySecretKey(cinetpayData.apiSecret || '');
      }

      // Brevo
      const { data: brevoData } = await supabase.rpc('get_integration_secret', {
        p_integration_name: 'brevo'
      });
      
      if (brevoData) {
        setBrevoApiKey(brevoData.apiKey || '');
      }

      // Azure Face API
      const { data: azureData } = await supabase.rpc('get_integration_secret', {
        p_integration_name: 'azure_face'
      });
      
      if (azureData) {
        setAzureEndpoint(azureData.endpoint || '');
        setAzureApiKey(azureData.apiKey || '');
      }
    } catch (error) {
      // Silently fail - secrets may not exist yet
      console.log('No existing secrets found');
    }
  };

  const saveCinetPayConfig = async () => {
    if (!cinetpayApiKey || !cinetpaySiteId || !cinetpaySecretKey) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs CinetPay",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, cinetpay: true }));

    try {
      const { error } = await supabase.rpc('save_integration_secret', {
        p_integration_name: 'cinetpay',
        p_encrypted_config: {
          apiKey: cinetpayApiKey,
          siteId: cinetpaySiteId,
          apiSecret: cinetpaySecretKey
        }
      });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Les clés CinetPay ont été enregistrées de manière sécurisée"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, cinetpay: false }));
    }
  };

  const saveBrevoConfig = async () => {
    if (!brevoApiKey) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir la clé API Brevo",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, brevo: true }));

    try {
      const { error } = await supabase.rpc('save_integration_secret', {
        p_integration_name: 'brevo',
        p_encrypted_config: {
          apiKey: brevoApiKey
        }
      });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "La clé API Brevo a été enregistrée de manière sécurisée"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, brevo: false }));
    }
  };

  const saveAzureConfig = async () => {
    if (!azureEndpoint || !azureApiKey) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs Azure Face API",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, azure: true }));

    try {
      const { error } = await supabase.rpc('save_integration_secret', {
        p_integration_name: 'azure_face',
        p_encrypted_config: {
          endpoint: azureEndpoint,
          apiKey: azureApiKey
        }
      });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Les clés Azure Face API ont été enregistrées de manière sécurisée"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, azure: false }));
    }
  };

  // Loading state
  if (isCheckingRole) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Access denied
  if (!isSuperAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Seuls les super-administrateurs peuvent accéder à la configuration des intégrations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Intégrations</h2>
        <p className="text-muted-foreground">
          Gérez les intégrations et services externes de la plateforme
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sécurité renforcée :</strong> Les clés API sont stockées de manière chiffrée dans la base de données. 
          Tous les accès sont audités dans les logs d'administration.
        </AlertDescription>
      </Alert>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {integration.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                  <Badge 
                    variant={integration.status === "configured" ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {integration.status === "configured" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {integration.status === "configured" ? "Configuré" : "Non configuré"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Forms */}
      <Tabs defaultValue="cinetpay" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cinetpay">
            <CreditCard className="mr-2 h-4 w-4" />
            CinetPay
          </TabsTrigger>
          <TabsTrigger value="brevo">
            <Mail className="mr-2 h-4 w-4" />
            Brevo
          </TabsTrigger>
          <TabsTrigger value="azure">
            <Scan className="mr-2 h-4 w-4" />
            Azure Face API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cinetpay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration CinetPay</CardTitle>
              <CardDescription>
                Configurez vos clés API CinetPay pour activer les paiements Mobile Money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cinetpay-api-key">Clé API</Label>
                <Input
                  id="cinetpay-api-key"
                  type="password"
                  placeholder="Votre clé API CinetPay"
                  value={cinetpayApiKey}
                  onChange={(e) => setCinetpayApiKey(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cinetpay-site-id">Site ID</Label>
                <Input
                  id="cinetpay-site-id"
                  placeholder="Votre Site ID CinetPay"
                  value={cinetpaySiteId}
                  onChange={(e) => setCinetpaySiteId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cinetpay-secret">Clé secrète</Label>
                <Input
                  id="cinetpay-secret"
                  type="password"
                  placeholder="Votre clé secrète CinetPay"
                  value={cinetpaySecretKey}
                  onChange={(e) => setCinetpaySecretKey(e.target.value)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Comment obtenir vos clés CinetPay ?</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Connectez-vous à votre compte CinetPay</li>
                  <li>Accédez à Paramètres → API</li>
                  <li>Copiez votre API Key, Site ID et Secret Key</li>
                  <li>Collez-les dans les champs ci-dessus</li>
                </ol>
              </div>

              <Button 
                onClick={saveCinetPayConfig} 
                className="w-full"
                disabled={loading.cinetpay}
              >
                {loading.cinetpay ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder la configuration CinetPay
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brevo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Brevo</CardTitle>
              <CardDescription>
                Configurez votre clé API Brevo pour activer l'envoi d'emails transactionnels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brevo-api-key">Clé API Brevo</Label>
                <Input
                  id="brevo-api-key"
                  type="password"
                  placeholder="Votre clé API Brevo"
                  value={brevoApiKey}
                  onChange={(e) => setBrevoApiKey(e.target.value)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Comment obtenir votre clé API Brevo ?</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Connectez-vous à votre compte Brevo</li>
                  <li>Accédez à Paramètres → Clés API SMTP & API</li>
                  <li>Créez une nouvelle clé API ou copiez une clé existante</li>
                  <li>Collez-la dans le champ ci-dessus</li>
                </ol>
              </div>

              <Button 
                onClick={saveBrevoConfig} 
                className="w-full"
                disabled={loading.brevo}
              >
                {loading.brevo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder la configuration Brevo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="azure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Azure Face API</CardTitle>
              <CardDescription>
                Configurez votre endpoint et clé API Azure pour activer la vérification faciale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="azure-endpoint">Endpoint Azure</Label>
                <Input
                  id="azure-endpoint"
                  placeholder="https://westeurope.api.cognitive.microsoft.com/"
                  value={azureEndpoint}
                  onChange={(e) => setAzureEndpoint(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="azure-api-key">Clé API Azure</Label>
                <Input
                  id="azure-api-key"
                  type="password"
                  placeholder="Votre clé API Azure Face"
                  value={azureApiKey}
                  onChange={(e) => setAzureApiKey(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Fonctionnalités activées</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Vérification faciale optionnelle après ONECI</li>
                  <li>Seuil de similarité: 70%</li>
                  <li>Maximum 3 tentatives par jour par utilisateur</li>
                  <li>Badge "Face ID vérifié" sur les profils</li>
                </ul>
              </div>

              <Button 
                onClick={saveAzureConfig} 
                className="w-full"
                disabled={loading.azure}
              >
                {loading.azure ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder la configuration Azure
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminIntegrations;
