import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ONECIForm from '@/components/verification/ONECIForm';
import CNAMForm from '@/components/verification/CNAMForm';
import VerificationStatus from '@/components/verification/VerificationStatus';
import { Shield } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useEffect } from 'react';

const Verification = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-4">Page de Vérification</h1>
      <p className="text-xl">Utilisateur: {user.email}</p>
      <p className="text-xl">Profil: {profile?.full_name || 'Pas de profil'}</p>
    </div>
  );
};

export default Verification;
