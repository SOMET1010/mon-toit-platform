import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('locataire' | 'proprietaire' | 'agence' | 'admin_ansut')[];
  requiredRoles?: string[];
  requireAll?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedUserTypes,
  requiredRoles,
  requireAll = false 
}: ProtectedRouteProps) => {
  const { user, profile, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Vérification des user_types
  if (allowedUserTypes && profile && !allowedUserTypes.includes(profile.user_type)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Votre type de compte ne permet pas d'accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Vérification des rôles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAll
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role));

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
