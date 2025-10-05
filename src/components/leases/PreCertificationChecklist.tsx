import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationCheck {
  check_name: string;
  label: string;
  passed: boolean;
  message: string;
}

interface ValidationResult {
  lease_id: string;
  checks: ValidationCheck[];
  all_passed: boolean;
  validated_at: string;
}

interface PreCertificationChecklistProps {
  leaseId: string;
}

const PreCertificationChecklist = ({ leaseId }: PreCertificationChecklistProps) => {
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateLease = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase
          .rpc('pre_validate_lease_for_certification', { p_lease_id: leaseId });

        if (rpcError) throw rpcError;
        if (data) {
          setValidation(data as unknown as ValidationResult);
        }
      } catch (err: any) {
        console.error('Validation error:', err);
        setError(err.message || 'Erreur lors de la validation');
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      validateLease();
    }
  }, [leaseId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Validation en cours...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!validation) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Critères de certification ANSUT</h3>
      
      <div className="space-y-3">
        {validation.checks.map((check, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card"
          >
            {check.passed ? (
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{check.label}</p>
              <p className={`text-sm ${check.passed ? 'text-muted-foreground' : 'text-destructive'}`}>
                {check.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        {validation.all_passed ? (
          <Alert className="bg-success/10 border-success text-success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Tous les critères sont remplis. Ce bail peut être soumis pour certification ANSUT.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Certains critères ne sont pas remplis. Complétez les éléments manquants avant de demander la certification.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default PreCertificationChecklist;