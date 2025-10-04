import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  fullName: z.string().min(2, { message: "Le nom complet doit contenir au moins 2 caractères" }),
  userType: z.enum(['locataire', 'proprietaire', 'agence']),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

const Auth = () => {
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  // Sign Up form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'locataire' | 'proprietaire' | 'agence'>('locataire');
  const [signUpErrors, setSignUpErrors] = useState<any>({});

  // Sign In form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<any>({});

  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    navigate('/');
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors({});
    
    const validation = signUpSchema.safeParse({
      email: signUpEmail,
      password: signUpPassword,
      fullName,
      userType,
    });

    if (!validation.success) {
      const errors: any = {};
      validation.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setSignUpErrors(errors);
      return;
    }

    setLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, fullName, userType);
    setLoading(false);

    if (!error) {
      navigate('/');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrors({});

    const validation = signInSchema.safeParse({
      email: signInEmail,
      password: signInPassword,
    });

    if (!validation.success) {
      const errors: any = {};
      validation.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setSignInErrors(errors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setLoading(false);

    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Home className="h-8 w-8" />
            Mon Toit
          </Link>
          <p className="text-muted-foreground">Propulsé par ANSUT</p>
        </div>

        {/* Auth Card */}
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Connectez-vous à votre compte Mon Toit</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                    {signInErrors.email && (
                      <p className="text-sm text-destructive">{signInErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                    {signInErrors.password && (
                      <p className="text-sm text-destructive">{signInErrors.password}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>Créez votre compte Mon Toit</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Nom complet</Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="Jean Kouamé"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    {signUpErrors.fullName && (
                      <p className="text-sm text-destructive">{signUpErrors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                    {signUpErrors.email && (
                      <p className="text-sm text-destructive">{signUpErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                    />
                    {signUpErrors.password && (
                      <p className="text-sm text-destructive">{signUpErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usertype">Type de compte</Label>
                    <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                      <SelectTrigger id="usertype">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="locataire">🏠 Locataire - Je cherche un logement</SelectItem>
                        <SelectItem value="proprietaire">🏢 Propriétaire - Je loue mes biens</SelectItem>
                        <SelectItem value="agence">🏪 Agence - Je gère un portfolio</SelectItem>
                      </SelectContent>
                    </Select>
                    {signUpErrors.userType && (
                      <p className="text-sm text-destructive">{signUpErrors.userType}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Création...' : 'Créer mon compte'}
                  </Button>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Plateforme certifiée ANSUT</span>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          En créant un compte, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
};

export default Auth;
