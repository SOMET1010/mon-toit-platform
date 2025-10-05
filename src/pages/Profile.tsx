import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        city,
        bio,
      })
      .eq('id', user!.id);

    setLoading(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées.',
      });
      refreshProfile();
    }
  };

  if (!profile) {
    return null;
  }

  const userTypeLabels = {
    locataire: '🏠 Locataire',
    proprietaire: '🏢 Propriétaire',
    agence: '🏪 Agence',
    admin_ansut: '👔 Admin ANSUT',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-3xl bg-gradient-primary text-primary-foreground">
                {fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">{fullName}</h1>
              <p className="text-muted-foreground">{userTypeLabels[profile.user_type]}</p>
            </div>
          </div>

          {/* Verification Status */}
          <Card className="border-2 shadow-lg rounded-xl">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Statut de vérification
              </CardTitle>
              <CardDescription>
                Vérifiez votre identité pour accéder à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Vérification ONECI (Identité)</span>
                {profile.oneci_verified ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Vérifié</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Non vérifié</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vérification CNAM (Emploi)</span>
                {profile.cnam_verified ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Vérifié</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Non vérifié</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="border-2 shadow-lg rounded-xl">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl">Informations personnelles</CardTitle>
              <CardDescription className="text-base">Mettez à jour vos informations</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nom complet</Label>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+225 07 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Abidjan, Yamoussoukro"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-14 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
