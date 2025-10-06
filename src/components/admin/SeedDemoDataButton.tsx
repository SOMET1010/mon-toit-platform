import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type SeedStatus = 'idle' | 'creating_users' | 'creating_properties' | 'creating_applications' | 'creating_leases' | 'creating_additional' | 'success' | 'error';

export const SeedDemoDataButton = () => {
  const [status, setStatus] = useState<SeedStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    applications: 0,
    leases: 0,
    additional: 0
  });
  const [error, setError] = useState<string | null>(null);

  const createDemoUsers = async () => {
    setStatus('creating_users');
    setProgress(10);
    
    const users = [
      // Propriétaires individuels
      { email: 'proprietaire1@demo.com', password: 'Demo123!', full_name: 'Jean Kouassi', user_type: 'proprietaire', city: 'Cocody', oneci_verified: true },
      { email: 'proprietaire2@demo.com', password: 'Demo123!', full_name: 'Marie Diabaté', user_type: 'proprietaire', city: 'Plateau', oneci_verified: true },
      { email: 'proprietaire3@demo.com', password: 'Demo123!', full_name: 'Ibrahim Touré', user_type: 'proprietaire', city: 'Marcory', oneci_verified: false },
      
      // Agences
      { email: 'agence1@demo.com', password: 'Demo123!', full_name: 'Agence Immobilière Premium CI', user_type: 'agent', city: 'Plateau', oneci_verified: true },
      { email: 'agence2@demo.com', password: 'Demo123!', full_name: 'Côte d\'Ivoire Habitat', user_type: 'agent', city: 'Cocody', oneci_verified: true },
      
      // Locataires
      { email: 'locataire1@demo.com', password: 'Demo123!', full_name: 'Alice Koné', user_type: 'locataire', city: 'Yopougon', oneci_verified: true, cnam_verified: true },
      { email: 'locataire2@demo.com', password: 'Demo123!', full_name: 'David Bamba', user_type: 'locataire', city: 'Abobo', oneci_verified: true, cnam_verified: false },
      { email: 'locataire3@demo.com', password: 'Demo123!', full_name: 'Sophie N\'Guessan', user_type: 'locataire', city: 'Cocody', oneci_verified: false, cnam_verified: false },
      { email: 'locataire4@demo.com', password: 'Demo123!', full_name: 'Marc Traoré', user_type: 'locataire', city: 'Plateau', oneci_verified: true, cnam_verified: true },
      { email: 'locataire5@demo.com', password: 'Demo123!', full_name: 'Fatou Soro', user_type: 'locataire', city: 'Marcory', oneci_verified: true, cnam_verified: true },
      { email: 'locataire6@demo.com', password: 'Demo123!', full_name: 'Paul Kouamé', user_type: 'locataire', city: 'Treichville', oneci_verified: false, cnam_verified: false },
      { email: 'locataire7@demo.com', password: 'Demo123!', full_name: 'Aminata Diallo', user_type: 'locataire', city: 'Cocody', oneci_verified: true, cnam_verified: false },
      { email: 'locataire8@demo.com', password: 'Demo123!', full_name: 'Christian Yao', user_type: 'locataire', city: 'Yopougon', oneci_verified: false, cnam_verified: false },
      { email: 'locataire9@demo.com', password: 'Demo123!', full_name: 'Rachelle Kouadio', user_type: 'locataire', city: 'Abobo', oneci_verified: true, cnam_verified: true },
      { email: 'locataire10@demo.com', password: 'Demo123!', full_name: 'Eric Gbagbo', user_type: 'locataire', city: 'Port-Bouët', oneci_verified: true, cnam_verified: false },
      
      // Admins
      { email: 'admin1@demo.com', password: 'Admin123!', full_name: 'Admin ANSUT 1', user_type: 'locataire', city: 'Abidjan' },
      { email: 'admin2@demo.com', password: 'Admin123!', full_name: 'Admin ANSUT 2', user_type: 'locataire', city: 'Abidjan' }
    ];

    const createdUserIds: Record<string, string> = {};
    
    for (const userData of users) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            user_type: userData.user_type
          }
        });

        if (authError) throw authError;
        if (!authData.user) continue;

        createdUserIds[userData.email] = authData.user.id;

        // Update profile
        await supabase
          .from('profiles')
          .update({
            city: userData.city,
            oneci_verified: userData.oneci_verified || false,
            cnam_verified: userData.cnam_verified || false,
            phone: `+225 ${Math.floor(Math.random() * 90000000) + 10000000}`
          })
          .eq('id', authData.user.id);

        // Add admin roles if needed
        if (userData.email.startsWith('admin')) {
          await supabase.from('user_roles').insert([
            { user_id: authData.user.id, role: 'admin' }
          ]);
        }

        setStats(prev => ({ ...prev, users: prev.users + 1 }));
      } catch (err) {
        console.error('Error creating user:', userData.email, err);
      }
    }

    setProgress(25);
    return createdUserIds;
  };

  const createDemoProperties = async (userIds: Record<string, string>) => {
    setStatus('creating_properties');
    setProgress(30);

    const properties = [
      { owner: 'proprietaire1@demo.com', title: 'Villa Moderne 4 Pièces Cocody Riviera', type: 'villa', bedrooms: 4, bathrooms: 3, rent: 450000, city: 'Cocody', lat: 5.3599, lng: -4.0082, status: 'disponible', moderation_status: 'approved' },
      { owner: 'proprietaire1@demo.com', title: 'Appartement Standing 3 Pièces Cocody II Plateaux', type: 'appartement', bedrooms: 3, bathrooms: 2, rent: 350000, city: 'Cocody', lat: 5.3675, lng: -3.9844, status: 'disponible', moderation_status: 'approved' },
      { owner: 'proprietaire2@demo.com', title: 'Duplex Luxe 5 Pièces Plateau Dokui', type: 'duplex', bedrooms: 5, bathrooms: 4, rent: 700000, city: 'Plateau', lat: 5.3248, lng: -4.0122, status: 'loue', moderation_status: 'approved' },
      { owner: 'proprietaire2@demo.com', title: 'Studio Meublé Plateau Centre', type: 'studio', bedrooms: 1, bathrooms: 1, rent: 180000, city: 'Plateau', lat: 5.3205, lng: -4.0180, status: 'disponible', moderation_status: 'approved' },
      { owner: 'proprietaire3@demo.com', title: 'Maison 6 Pièces Marcory Zone 4', type: 'maison', bedrooms: 6, bathrooms: 3, rent: 400000, city: 'Marcory', lat: 5.2875, lng: -3.9920, status: 'disponible', moderation_status: 'pending' },
      { owner: 'agence1@demo.com', title: 'Résidence Standing 4 Pièces Riviera Palmeraie', type: 'appartement', bedrooms: 4, bathrooms: 3, rent: 550000, city: 'Cocody', lat: 5.3720, lng: -4.0010, status: 'disponible', moderation_status: 'approved' },
      { owner: 'agence1@demo.com', title: 'Villa Piscine 7 Pièces Riviera Golf', type: 'villa', bedrooms: 7, bathrooms: 5, rent: 1200000, city: 'Cocody', lat: 5.3840, lng: -3.9890, status: 'loue', moderation_status: 'approved' },
      { owner: 'agence1@demo.com', title: 'Appartement Neuf 3 Pièces Angré 8ème Tranche', type: 'appartement', bedrooms: 3, bathrooms: 2, rent: 400000, city: 'Cocody', lat: 5.4050, lng: -4.0150, status: 'disponible', moderation_status: 'approved' },
      { owner: 'agence2@demo.com', title: 'Villa Moderne 5 Pièces Cocody Danga', type: 'villa', bedrooms: 5, bathrooms: 4, rent: 650000, city: 'Cocody', lat: 5.3490, lng: -4.0320, status: 'disponible', moderation_status: 'approved' },
      { owner: 'agence2@demo.com', title: 'Duplex 4 Pièces Vallon Cocody', type: 'duplex', bedrooms: 4, bathrooms: 3, rent: 500000, city: 'Cocody', lat: 5.3580, lng: -4.0210, status: 'disponible', moderation_status: 'approved' },
      { owner: 'agence2@demo.com', title: 'Appartement 2 Pièces Marcory Résidentiel', type: 'appartement', bedrooms: 2, bathrooms: 1, rent: 220000, city: 'Marcory', lat: 5.2920, lng: -3.9850, status: 'loue', moderation_status: 'approved' },
      { owner: 'proprietaire1@demo.com', title: 'Studio Cocody Angré', type: 'studio', bedrooms: 1, bathrooms: 1, rent: 150000, city: 'Cocody', lat: 5.4020, lng: -4.0100, status: 'disponible', moderation_status: 'approved' },
      { owner: 'proprietaire2@demo.com', title: 'Appartement 3 Pièces Yopougon Niangon', type: 'appartement', bedrooms: 3, bathrooms: 2, rent: 180000, city: 'Yopougon', lat: 5.3420, lng: -4.0920, status: 'disponible', moderation_status: 'approved' },
      { owner: 'proprietaire3@demo.com', title: 'Villa 5 Pièces Abobo Anyama', type: 'villa', bedrooms: 5, bathrooms: 3, rent: 300000, city: 'Abobo', lat: 5.4280, lng: -4.0210, status: 'maintenance', moderation_status: 'approved' },
      { owner: 'agence1@demo.com', title: 'Maison 4 Pièces Treichville Arras', type: 'maison', bedrooms: 4, bathrooms: 2, rent: 250000, city: 'Treichville', lat: 5.3050, lng: -4.0050, status: 'disponible', moderation_status: 'approved' },
      { owner: 'agence2@demo.com', title: 'Duplex 6 Pièces Port-Bouët Zone 4', type: 'duplex', bedrooms: 6, bathrooms: 4, rent: 480000, city: 'Port-Bouët', lat: 5.2620, lng: -3.9180, status: 'disponible', moderation_status: 'approved' },
      { owner: 'proprietaire1@demo.com', title: 'Appartement 2 Pièces Cocody Ambassades', type: 'appartement', bedrooms: 2, bathrooms: 1, rent: 280000, city: 'Cocody', lat: 5.3440, lng: -3.9950, status: 'loue', moderation_status: 'approved' },
      { owner: 'proprietaire2@demo.com', title: 'Villa 4 Pièces Bingerville', type: 'villa', bedrooms: 4, bathrooms: 3, rent: 350000, city: 'Bingerville', lat: 5.3550, lng: -3.8950, status: 'disponible', moderation_status: 'approved' }
    ];

    const createdPropertyIds: string[] = [];

    for (const prop of properties) {
      try {
        const ownerId = userIds[prop.owner];
        if (!ownerId) continue;

        const { data, error } = await supabase
          .from('properties')
          .insert({
            owner_id: ownerId,
            title: prop.title,
            property_type: prop.type,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            monthly_rent: prop.rent,
            city: prop.city,
            address: `${prop.city}, Abidjan`,
            latitude: prop.lat,
            longitude: prop.lng,
            status: prop.status,
            moderation_status: prop.moderation_status,
            surface_area: Math.floor(Math.random() * 100) + 50,
            description: `Superbe ${prop.type} situé à ${prop.city}. Bien entretenu et dans un quartier calme.`,
            is_furnished: Math.random() > 0.5,
            has_parking: Math.random() > 0.3,
            has_ac: Math.random() > 0.6
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          createdPropertyIds.push(data.id);
          setStats(prev => ({ ...prev, properties: prev.properties + 1 }));
        }
      } catch (err) {
        console.error('Error creating property:', prop.title, err);
      }
    }

    setProgress(50);
    return createdPropertyIds;
  };

  const createDemoApplications = async (userIds: Record<string, string>, propertyIds: string[]) => {
    setStatus('creating_applications');
    setProgress(55);

    const tenantEmails = Object.keys(userIds).filter(email => email.startsWith('locataire'));
    const applications = [];

    // Create 25 applications
    for (let i = 0; i < 25; i++) {
      const tenantEmail = tenantEmails[i % tenantEmails.length];
      const propertyId = propertyIds[i % propertyIds.length];
      const statuses = ['pending', 'approved', 'rejected'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Make 3 applications older than 48 hours for overdue testing
      const createdAt = i < 3 
        ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() 
        : new Date().toISOString();

      applications.push({
        applicant_id: userIds[tenantEmail],
        property_id: propertyId,
        status: i < 3 ? 'pending' : status,
        is_overdue: i < 3,
        cover_letter: `Je suis très intéressé(e) par ce bien et souhaite y habiter.`,
        application_score: Math.floor(Math.random() * 100),
        created_at: createdAt
      });
    }

    try {
      const { error } = await supabase
        .from('rental_applications')
        .insert(applications);

      if (error) throw error;
      setStats(prev => ({ ...prev, applications: applications.length }));
    } catch (err) {
      console.error('Error creating applications:', err);
    }

    setProgress(70);
  };

  const createDemoLeases = async (userIds: Record<string, string>, propertyIds: string[]) => {
    setStatus('creating_leases');
    setProgress(75);

    const leases = [
      {
        landlord_id: userIds['proprietaire1@demo.com'],
        tenant_id: userIds['locataire1@demo.com'],
        property_id: propertyIds[2],
        monthly_rent: 700000,
        deposit_amount: 1400000,
        start_date: '2024-01-01',
        end_date: '2025-01-01',
        lease_type: 'residential',
        status: 'active',
        landlord_signed_at: new Date().toISOString(),
        tenant_signed_at: new Date().toISOString(),
        certification_status: 'certified',
        ansut_certified_at: new Date().toISOString()
      },
      {
        landlord_id: userIds['agence1@demo.com'],
        tenant_id: userIds['locataire4@demo.com'],
        property_id: propertyIds[6],
        monthly_rent: 1200000,
        deposit_amount: 2400000,
        start_date: '2024-02-01',
        end_date: '2025-02-01',
        lease_type: 'residential',
        status: 'active',
        landlord_signed_at: new Date().toISOString(),
        tenant_signed_at: new Date().toISOString(),
        certification_status: 'certified',
        ansut_certified_at: new Date().toISOString()
      },
      {
        landlord_id: userIds['agence2@demo.com'],
        tenant_id: userIds['locataire5@demo.com'],
        property_id: propertyIds[10],
        monthly_rent: 220000,
        deposit_amount: 440000,
        start_date: '2024-03-01',
        end_date: '2025-03-01',
        lease_type: 'residential',
        status: 'active',
        landlord_signed_at: new Date().toISOString(),
        tenant_signed_at: new Date().toISOString()
      },
      {
        landlord_id: userIds['proprietaire1@demo.com'],
        tenant_id: userIds['locataire9@demo.com'],
        property_id: propertyIds[16],
        monthly_rent: 280000,
        deposit_amount: 560000,
        start_date: '2024-04-01',
        end_date: '2025-04-01',
        lease_type: 'residential',
        status: 'active',
        landlord_signed_at: new Date().toISOString(),
        tenant_signed_at: new Date().toISOString()
      }
    ];

    try {
      const { error } = await supabase
        .from('leases')
        .insert(leases);

      if (error) throw error;
      setStats(prev => ({ ...prev, leases: leases.length }));
    } catch (err) {
      console.error('Error creating leases:', err);
    }

    setProgress(85);
  };

  const createAdditionalData = async (userIds: Record<string, string>, propertyIds: string[]) => {
    setStatus('creating_additional');
    setProgress(90);

    try {
      // Favorites
      const favorites = [
        { user_id: userIds['locataire1@demo.com'], property_id: propertyIds[0] },
        { user_id: userIds['locataire2@demo.com'], property_id: propertyIds[1] },
        { user_id: userIds['locataire3@demo.com'], property_id: propertyIds[5] }
      ];
      await supabase.from('user_favorites').insert(favorites);

      // Messages
      const messages = [
        {
          sender_id: userIds['locataire1@demo.com'],
          receiver_id: userIds['proprietaire1@demo.com'],
          content: 'Bonjour, je suis intéressé par votre bien. Est-il toujours disponible?'
        },
        {
          sender_id: userIds['proprietaire1@demo.com'],
          receiver_id: userIds['locataire1@demo.com'],
          content: 'Oui, le bien est toujours disponible. Quand souhaitez-vous le visiter?'
        }
      ];
      await supabase.from('messages').insert(messages);

      // Reviews
      const reviews = [
        {
          reviewer_id: userIds['locataire1@demo.com'],
          reviewee_id: userIds['proprietaire1@demo.com'],
          rating: 5,
          comment: 'Excellent propriétaire, très professionnel',
          review_type: 'tenant_to_landlord',
          moderation_status: 'approved'
        },
        {
          reviewer_id: userIds['proprietaire1@demo.com'],
          reviewee_id: userIds['locataire1@demo.com'],
          rating: 5,
          comment: 'Locataire exemplaire, recommandé!',
          review_type: 'landlord_to_tenant',
          moderation_status: 'approved'
        }
      ];
      await supabase.from('reviews').insert(reviews);

      setStats(prev => ({ ...prev, additional: favorites.length + messages.length + reviews.length }));
    } catch (err) {
      console.error('Error creating additional data:', err);
    }

    setProgress(100);
  };

  const handleSeedData = async () => {
    try {
      setError(null);
      
      const userIds = await createDemoUsers();
      const propertyIds = await createDemoProperties(userIds);
      await createDemoApplications(userIds, propertyIds);
      await createDemoLeases(userIds, propertyIds);
      await createAdditionalData(userIds, propertyIds);

      setStatus('success');
      toast.success('Données de démo créées avec succès!', {
        description: `${stats.users} utilisateurs, ${stats.properties} propriétés, ${stats.applications} candidatures, ${stats.leases} baux créés.`
      });
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Une erreur est survenue');
      toast.error('Erreur lors de la création des données de démo', {
        description: err.message
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'idle':
        return <Database className="h-5 w-5" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'creating_users':
        return `Création des utilisateurs... (${stats.users}/17)`;
      case 'creating_properties':
        return `Création des propriétés... (${stats.properties}/18)`;
      case 'creating_applications':
        return `Création des candidatures... (${stats.applications}/25)`;
      case 'creating_leases':
        return `Création des baux... (${stats.leases}/6)`;
      case 'creating_additional':
        return 'Création des données additionnelles...';
      case 'success':
        return 'Données créées avec succès!';
      case 'error':
        return 'Erreur lors de la création';
      default:
        return 'Prêt à générer';
    }
  };

  const isLoading = status !== 'idle' && status !== 'success' && status !== 'error';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Données de Démonstration
        </CardTitle>
        <CardDescription>
          Générer un jeu complet de données de test pour la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>Cette action créera 17 utilisateurs, 18 propriétés, 25 candidatures et 6 baux</span>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{getStatusText()}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Données créées avec succès
                </p>
                <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                  <li>• {stats.users} utilisateurs (3 propriétaires, 2 agences, 10 locataires, 2 admins)</li>
                  <li>• {stats.properties} propriétés</li>
                  <li>• {stats.applications} candidatures (dont 3 en retard)</li>
                  <li>• {stats.leases} baux (dont 2 certifiés ANSUT)</li>
                  <li>• {stats.additional} données additionnelles</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="rounded-lg bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Erreur</p>
                <p className="text-xs text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={isLoading}
            >
              {getStatusIcon()}
              {isLoading ? 'Génération en cours...' : 'Générer les Données de Démo'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la génération</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va créer un jeu complet de données de test incluant utilisateurs, propriétés, candidatures et baux.
                Les emails et mots de passe de démo seront disponibles dans la console.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSeedData}>
                Continuer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
