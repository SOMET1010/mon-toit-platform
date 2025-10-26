import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSwitchV2 } from '@/hooks/useRoleSwitchV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, Shield, FileText, Phone, Mail } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Requirement {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action: () => void;
  actionLabel: string;
}

/**
 * Page pour devenir propriétaire
 * - Affichage des prérequis
 * - Vérification Smile ID
 * - Activation du rôle
 */
export const BecomeProprietaire = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addRole, isAddingRole, availableRoles } = useRoleSwitchV2();

  // Vérifier si l'utilisateur a déjà le rôle propriétaire
  const hasProprietaireRole = availableRoles.includes('proprietaire');

  // Définir les prérequis
  const requirements: Requirement[] = [
    {
      id: 'oneci',
      label: 'Vérification Smile ID (CNI)',
      description: 'Vérifiez votre identité avec votre Carte Nationale d\'Identité ivoirienne',
      icon: <Shield className="h-5 w-5" />,
      completed: profile?.smile_id_verified || false,
      action: () => navigate('/verification/oneci'),
      actionLabel: 'Vérifier mon identité'
    },
    {
      id: 'phone',
      label: 'Téléphone vérifié',
      description: 'Confirmez votre numéro de téléphone avec un code OTP',
      icon: <Phone className="h-5 w-5" />,
      completed: profile?.phone_verified || false,
      action: () => navigate('/verification/phone'),
      actionLabel: 'Vérifier mon téléphone'
    },
    {
      id: 'email',
      label: 'Email vérifié',
      description: 'Confirmez votre adresse email pour recevoir les notifications',
      icon: <Mail className="h-5 w-5" />,
      completed: user?.email_confirmed_at !== null,
      action: () => navigate('/verification/email'),
      actionLabel: 'Vérifier mon email'
    },
    {
      id: 'profile',
      label: 'Profil complété (80%)',
      description: 'Complétez votre profil avec vos informations personnelles',
      icon: <FileText className="h-5 w-5" />,
      completed: (profile?.profile_completion || 0) >= 80,
      action: () => navigate('/profile/edit'),
      actionLabel: 'Compléter mon profil'
    }
  ];

  const completedCount = requirements.filter(r => r.completed).length;
  const totalCount = requirements.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const allCompleted = completedCount === totalCount;

  const handleActivateRole = () => {
    addRole({ role: 'proprietaire', verificationMethod: 'oneci' });
  };

  // Si l'utilisateur a déjà le rôle
  if (hasProprietaireRole) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Vous êtes déjà propriétaire !
            </CardTitle>
            <CardDescription>
              Vous avez accès à toutes les fonctionnalités de publication et gestion de biens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={() => navigate('/mes-biens')}>
                Voir mes biens
              </Button>
              <Button variant="outline" onClick={() => navigate('/publier')}>
                Publier un bien
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          🔑 Devenir Propriétaire
        </h1>
        <p className="text-muted-foreground">
          Pour publier des biens sur Mon Toit, vous devez compléter les étapes de vérification suivantes.
        </p>
      </div>

      {/* Progression globale */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progression</span>
              <span className="text-muted-foreground">
                {completedCount}/{totalCount} étapes complétées
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Liste des prérequis */}
      <div className="space-y-4 mb-8">
        {requirements.map((req, index) => (
          <Card key={req.id} className={req.completed ? 'border-green-200 bg-green-50/50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icône de statut */}
                <div className="flex-shrink-0 mt-1">
                  {req.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {req.icon}
                    <h3 className={`font-semibold ${req.completed ? 'text-green-800' : ''}`}>
                      {req.label}
                    </h3>
                    {req.completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Complété
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {req.description}
                  </p>

                  {!req.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={req.action}
                      className="mt-2"
                    >
                      {req.actionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bouton d'activation */}
      {allCompleted && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">Félicitations ! 🎉</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous avez complété toutes les étapes requises.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleActivateRole}
                disabled={isAddingRole}
              >
                {isAddingRole ? (
                  <>
                    <Circle className="mr-2 h-4 w-4 animate-spin" />
                    Activation en cours...
                  </>
                ) : (
                  <>
                    ✅ Activer le rôle Propriétaire
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En activant ce rôle, vous acceptez les{' '}
                <a href="/conditions-proprietaire" className="underline">
                  conditions d'utilisation pour les propriétaires
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avantages */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Avantages du compte Propriétaire</CardTitle>
          <CardDescription>
            Ce que vous pourrez faire une fois votre compte activé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Publier des annonces de location',
              'Gérer vos biens immobiliers',
              'Recevoir des candidatures de locataires',
              'Signer des baux électroniques certifiés ANSUT',
              'Recevoir des paiements sécurisés via InTouch',
              'Accéder aux statistiques de vos biens'
            ].map((advantage, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{advantage}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

