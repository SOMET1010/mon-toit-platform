import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, MapPin, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lease {
  id: string;
  property_id: string;
  monthly_rent: number;
  deposit_amount: number;
  charges_amount: number;
  status: string;
  lease_type: string;
  start_date: string;
  end_date: string;
  tenant_signed_at: string | null;
  landlord_signed_at: string | null;
  ansut_certified_at: string | null;
  properties: {
    title: string;
    address: string;
    city: string;
    main_image: string;
  };
}

export default function Leases() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeases();
    }
  }, [user]);

  const fetchLeases = async () => {
    try {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          properties (title, address, city, main_image)
        `)
        .or(`landlord_id.eq.${user?.id},tenant_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeases(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (leaseId: string, userType: "landlord" | "tenant") => {
    try {
      const updateField = userType === "landlord" ? "landlord_signed_at" : "tenant_signed_at";
      
      const { error } = await supabase
        .from("leases")
        .update({ [updateField]: new Date().toISOString() })
        .eq("id", leaseId);

      if (error) throw error;

      toast({
        title: "Signature enregistrée",
        description: "Votre signature électronique a été enregistrée avec succès",
      });

      fetchLeases();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (lease: Lease) => {
    if (lease.ansut_certified_at) {
      return <Badge className="bg-green-500">Certifié ANSUT</Badge>;
    }
    if (lease.tenant_signed_at && lease.landlord_signed_at) {
      return <Badge className="bg-blue-500">Signé</Badge>;
    }
    if (lease.tenant_signed_at || lease.landlord_signed_at) {
      return <Badge className="bg-yellow-500">Signature partielle</Badge>;
    }
    return <Badge variant="outline">En attente</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes Baux</h1>
          <p className="text-muted-foreground">
            Gérez vos contrats de location et effectuez les paiements
          </p>
        </div>

        <div className="grid gap-6">
          {leases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun bail trouvé</p>
              </CardContent>
            </Card>
          ) : (
            leases.map((lease) => (
              <Card key={lease.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{lease.properties.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        {lease.properties.address}, {lease.properties.city}
                      </div>
                      <div className="flex gap-2 mb-4">
                        {getStatusBadge(lease)}
                        <Badge variant="outline">{lease.lease_type}</Badge>
                      </div>
                    </div>
                    {lease.properties.main_image && (
                      <img
                        src={lease.properties.main_image}
                        alt={lease.properties.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {lease.monthly_rent.toLocaleString()} FCFA/mois
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dépôt: {lease.deposit_amount?.toLocaleString() || 0} FCFA
                      </div>
                      {lease.charges_amount && (
                        <div className="text-sm text-muted-foreground">
                          Charges: {lease.charges_amount.toLocaleString()} FCFA
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Du {new Date(lease.start_date).toLocaleDateString()} au{" "}
                          {new Date(lease.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      {lease.landlord_signed_at ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span>
                        Signature propriétaire:{" "}
                        {lease.landlord_signed_at
                          ? new Date(lease.landlord_signed_at).toLocaleDateString()
                          : "En attente"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {lease.tenant_signed_at ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span>
                        Signature locataire:{" "}
                        {lease.tenant_signed_at
                          ? new Date(lease.tenant_signed_at).toLocaleDateString()
                          : "En attente"}
                      </span>
                    </div>
                    {lease.ansut_certified_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>
                          Certifié ANSUT le{" "}
                          {new Date(lease.ansut_certified_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {profile?.user_type === "proprietaire" && !lease.landlord_signed_at && (
                      <Button onClick={() => handleSign(lease.id, "landlord")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Signer le bail
                      </Button>
                    )}
                    {profile?.user_type === "locataire" && !lease.tenant_signed_at && (
                      <Button onClick={() => handleSign(lease.id, "tenant")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Signer le bail
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/payments?lease=${lease.id}`)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Paiements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
