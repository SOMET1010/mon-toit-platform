import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProfileScoreCard = () => {
  const { profile } = useAuth();

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return 0;
    
    const checks = [
      profile.full_name,
      profile.phone,
      profile.city,
      profile.bio,
      profile.avatar_url,
      profile.oneci_verified,
      profile.cnam_verified,
      profile.face_verified,
    ];
    
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  };

  const getVerificationStatus = () => {
    if (!profile) return { count: 0, total: 3 };
    
    const verifications = [
      profile.oneci_verified,
      profile.cnam_verified,
      profile.face_verified,
    ];
    
    return {
      count: verifications.filter(Boolean).length,
      total: verifications.length,
    };
  };

  const completionPercentage = calculateCompletion();
  const verificationStatus = getVerificationStatus();
  const isFullyVerified = verificationStatus.count === verificationStatus.total;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Votre Profil
          </CardTitle>
          {isFullyVerified ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Vérifié
            </Badge>
          ) : (
            <Badge variant="outline" className="border-yellow-600 text-yellow-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              En cours
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profil complété</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Verification Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Vérifications</span>
            <span className="font-semibold">
              {verificationStatus.count}/{verificationStatus.total}
            </span>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${profile?.oneci_verified ? 'bg-green-600' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-full ${profile?.cnam_verified ? 'bg-green-600' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-full ${profile?.face_verified ? 'bg-green-600' : 'bg-muted'}`} />
          </div>
        </div>

        {/* Action Button */}
        {!isFullyVerified && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/verification">
              Compléter ma vérification
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
