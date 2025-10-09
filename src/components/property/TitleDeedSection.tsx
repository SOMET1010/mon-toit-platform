import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TitleDeedSectionProps {
  propertyId: string;
  titleDeedUrl?: string | null;
  ownerId: string;
}

export const TitleDeedSection = ({ propertyId, titleDeedUrl, ownerId }: TitleDeedSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur peut accéder au titre
  const isOwner = user?.id === ownerId;
  const [canAccess, setCanAccess] = useState(false);
  const [isActiveTenant, setIsActiveTenant] = useState(false);

  // Vérifier l'accès au chargement
  useState(() => {
    const checkAccess = async () => {
      if (!user || !titleDeedUrl) return;

      // Vérifier si locataire actif
      const { data: lease } = await supabase
        .from("leases")
        .select("*")
        .eq("property_id", propertyId)
        .eq("tenant_id", user.id)
        .eq("status", "active")
        .single();

      if (lease) {
        setIsActiveTenant(true);
        setCanAccess(true);
      } else if (isOwner) {
        setCanAccess(true);
      }
    };

    checkAccess();
  });

  const handleDownload = async () => {
    if (!titleDeedUrl) return;

    setLoading(true);
    try {
      // Logger l'accès
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action_type: "title_deed_downloaded",
        target_type: "property",
        target_id: propertyId,
        notes: "Téléchargement du titre de propriété",
      });

      // Ouvrir le document
      window.open(titleDeedUrl, "_blank");
      
      toast({
        title: "Téléchargement du titre de propriété",
        description: "Le document s'ouvrira dans un nouvel onglet",
      });
    } catch (error) {
      console.error("Error downloading title deed:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le titre de propriété",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!titleDeedUrl) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Titre de propriété
        </CardTitle>
        <CardDescription>
          Document officiel attestant de la propriété du bien
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canAccess ? (
          <div className="space-y-4">
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription>
                {isActiveTenant 
                  ? "En tant que locataire actif, vous avez accès au titre de propriété"
                  : "En tant que propriétaire, vous avez accès au titre de propriété"}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleDownload}
              disabled={loading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Chargement..." : "Télécharger le titre de propriété"}
            </Button>
          </div>
        ) : (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Le titre de propriété est accessible uniquement :
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Au propriétaire du bien</li>
                <li>Aux locataires ayant un bail actif</li>
                <li>Aux administrateurs de la plateforme</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
