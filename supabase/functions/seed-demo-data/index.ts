import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeedResult {
  users: number;
  properties: number;
  applications: number;
  leases: number;
  favorites: number;
  messages: number;
  searches: number;
  reviews: number;
  overdueApplications: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Vérifier que l'utilisateur est super_admin
    const { data: isSuperAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'super_admin'
    });

    if (!isSuperAdmin) {
      throw new Error('Only super admins can seed demo data');
    }

    console.log('Starting demo data seeding...');

    const result: SeedResult = {
      users: 0,
      properties: 0,
      applications: 0,
      leases: 0,
      favorites: 0,
      messages: 0,
      searches: 0,
      reviews: 0,
      overdueApplications: 0,
    };

    // 1. CRÉER LES UTILISATEURS
    const users = [
      // Propriétaires individuels
      { email: 'jean-paul.kouassi@example.com', name: 'Jean-Paul Kouassi', type: 'proprietaire', roles: ['user'], verifications: {} },
      { email: 'marie.diabate@example.com', name: 'Marie Diabaté', type: 'proprietaire', roles: ['user'], verifications: {} },
      { email: 'ismael.traore@example.com', name: 'Ismaël Traoré', type: 'proprietaire', roles: ['user'], verifications: {} },
      
      // Agences
      { email: 'contact@immobilier-ci.com', name: 'Immobilier CI', type: 'agence', roles: ['user'], verifications: {} },
      { email: 'contact@abidjan-prestige.com', name: 'Abidjan Prestige Homes', type: 'agence', roles: ['user'], verifications: {} },
      
      // Locataires
      { email: 'koffi.mensah@example.com', name: 'Koffi Mensah', type: 'locataire', roles: ['user'], verifications: { oneci: true } },
      { email: 'aminata.toure@example.com', name: 'Aminata Touré', type: 'locataire', roles: ['user'], verifications: { oneci: true } },
      { email: 'yao.kouadio@example.com', name: 'Yao Kouadio', type: 'locataire', roles: ['user'], verifications: { oneci: true, cnam: true } },
      { email: 'fanta.diarra@example.com', name: 'Fanta Diarra', type: 'locataire', roles: ['user'], verifications: { oneci: true, cnam: true } },
      { email: 'moussa.kone@example.com', name: 'Moussa Koné', type: 'locataire', roles: ['user'], verifications: { oneci: true, cnam: true, face: true } },
      { email: 'adjoua.assi@example.com', name: 'Adjoua Assi', type: 'locataire', roles: ['user'], verifications: { oneci: true, cnam: true, face: true } },
      { email: 'awa.bamba@example.com', name: 'Awa Bamba', type: 'locataire', roles: ['user'], verifications: {} },
      { email: 'ibrahim.sanogo@example.com', name: 'Ibrahim Sanogo', type: 'locataire', roles: ['user'], verifications: {} },
      { email: 'nguessan.kouame@example.com', name: "N'Guessan Kouamé", type: 'locataire', roles: ['user'], verifications: { oneci: 'pending' } },
      { email: 'mariam.ouattara@example.com', name: 'Mariam Ouattara', type: 'locataire', roles: ['user'], verifications: { cnam: 'pending' } },
      
      // Admins
      { email: 'admin@ansut.ci', name: 'Admin ANSUT', type: 'admin_ansut', roles: ['user', 'admin', 'super_admin'], verifications: { oneci: true, cnam: true } },
      { email: 'moderateur@ansut.ci', name: 'Modérateur ANSUT', type: 'admin_ansut', roles: ['user', 'admin'], verifications: { oneci: true } },
    ];

    const userMap = new Map<string, string>();
    const defaultPassword = 'Demo2025!';

    for (const userData of users) {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users.find(u => u.email === userData.email);

      let userId: string;

      if (userExists) {
        console.log(`User ${userData.email} already exists, skipping creation`);
        userId = userExists.id;
      } else {
        // Créer l'utilisateur via Auth API
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: userData.name,
            user_type: userData.type,
          },
        });

        if (createError || !newUser.user) {
          console.error(`Error creating user ${userData.email}:`, createError);
          continue;
        }

        userId = newUser.user.id;
        result.users++;

        // Attribuer les rôles
        for (const role of userData.roles) {
          await supabase.from('user_roles').insert({
            user_id: userId,
            role: role,
          });
        }

        // Créer/mettre à jour le profil
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: userData.name,
          user_type: userData.type,
          oneci_verified: userData.verifications.oneci === true,
          cnam_verified: userData.verifications.cnam === true,
          face_verified: userData.verifications.face === true,
        });

        // Créer l'entrée de vérification si nécessaire
        if (userData.verifications.oneci || userData.verifications.cnam) {
          await supabase.from('user_verifications').upsert({
            user_id: userId,
            oneci_status: userData.verifications.oneci === 'pending' ? 'pending_review' : (userData.verifications.oneci ? 'verified' : 'pending'),
            cnam_status: userData.verifications.cnam === 'pending' ? 'pending_review' : (userData.verifications.cnam ? 'verified' : 'pending'),
            face_verification_status: userData.verifications.face ? 'verified' : 'pending',
          });
        }
      }

      userMap.set(userData.email, userId);
    }

    // 2. CRÉER LES PROPRIÉTÉS
    const properties = [
      // Jean-Paul Kouassi
      { owner: 'jean-paul.kouassi@example.com', title: 'Villa Moderne 4 Chambres', city: 'Abidjan', neighborhood: 'Cocody Angré', type: 'villa', rent: 450000, bedrooms: 4, bathrooms: 3, surface: 250, status: 'disponible', moderation: 'approved' },
      { owner: 'jean-paul.kouassi@example.com', title: 'Appartement 3 Pièces', city: 'Abidjan', neighborhood: 'Marcory Zone 4', type: 'appartement', rent: 180000, bedrooms: 2, bathrooms: 1, surface: 85, status: 'disponible', moderation: 'approved' },
      { owner: 'jean-paul.kouassi@example.com', title: 'Studio Meublé', city: 'Abidjan', neighborhood: 'Plateau Centre Ville', type: 'studio', rent: 120000, bedrooms: 0, bathrooms: 1, surface: 35, status: 'loue', moderation: 'approved' },
      
      // Marie Diabaté
      { owner: 'marie.diabate@example.com', title: 'Duplex Luxueux 5 Chambres', city: 'Abidjan', neighborhood: 'Riviera Palmeraie', type: 'duplex', rent: 550000, bedrooms: 5, bathrooms: 4, surface: 320, status: 'disponible', moderation: 'approved' },
      { owner: 'marie.diabate@example.com', title: 'Villa Familiale', city: 'Bingerville', neighborhood: 'Centre', type: 'villa', rent: 280000, bedrooms: 3, bathrooms: 2, surface: 180, status: 'disponible', moderation: 'approved' },
      { owner: 'marie.diabate@example.com', title: 'Villa 4 Chambres avec Piscine', city: 'Bingerville', neighborhood: 'Résidentiel', type: 'villa', rent: 350000, bedrooms: 4, bathrooms: 3, surface: 220, status: 'loue', moderation: 'approved', hasPool: true },
      { owner: 'marie.diabate@example.com', title: 'Appartement 2 Pièces', city: 'Abidjan', neighborhood: 'Yopougon Niangon', type: 'appartement', rent: 95000, bedrooms: 1, bathrooms: 1, surface: 55, status: 'disponible', moderation: 'approved' },
      
      // Ismaël Traoré
      { owner: 'ismael.traore@example.com', title: 'Villa Contemporaine', city: 'Abidjan', neighborhood: 'Angré 8ème Tranche', type: 'villa', rent: 380000, bedrooms: 4, bathrooms: 2, surface: 200, status: 'disponible', moderation: 'approved' },
      { owner: 'ismael.traore@example.com', title: 'Appartement Économique', city: 'Abidjan', neighborhood: 'Abobo Gare', type: 'appartement', rent: 75000, bedrooms: 2, bathrooms: 1, surface: 60, status: 'disponible', moderation: 'approved' },
      
      // Immobilier CI
      { owner: 'contact@immobilier-ci.com', title: 'Penthouse Premium Vue Lagune', city: 'Abidjan', neighborhood: 'Cocody II Plateaux', type: 'penthouse', rent: 850000, bedrooms: 4, bathrooms: 4, surface: 280, status: 'disponible', moderation: 'approved' },
      { owner: 'contact@immobilier-ci.com', title: 'Villa de Prestige', city: 'Abidjan', neighborhood: 'Deux Plateaux Vallon', type: 'villa', rent: 720000, bedrooms: 5, bathrooms: 4, surface: 350, status: 'disponible', moderation: 'approved' },
      { owner: 'contact@immobilier-ci.com', title: 'Appartement Standing', city: 'Abidjan', neighborhood: 'Riviera 3', type: 'appartement', rent: 320000, bedrooms: 3, bathrooms: 2, surface: 120, status: 'disponible', moderation: 'approved' },
      { owner: 'contact@immobilier-ci.com', title: 'Duplex Moderne', city: 'Abidjan', neighborhood: 'Cocody Danga', type: 'duplex', rent: 480000, bedrooms: 4, bathrooms: 3, surface: 230, status: 'loue', moderation: 'approved' },
      { owner: 'contact@immobilier-ci.com', title: 'Villa Rénovation Complète', city: 'Abidjan', neighborhood: 'Cocody', type: 'villa', rent: 400000, bedrooms: 4, bathrooms: 3, surface: 210, status: 'maintenance', moderation: 'approved' },
      
      // Abidjan Prestige Homes
      { owner: 'contact@abidjan-prestige.com', title: 'Maison Moderne', city: 'Abidjan', neighborhood: 'Marcory Résidentiel', type: 'maison', rent: 250000, bedrooms: 3, bathrooms: 2, surface: 150, status: 'disponible', moderation: 'approved' },
      { owner: 'contact@abidjan-prestige.com', title: 'Appartement Familial', city: 'Abidjan', neighborhood: 'Koumassi', type: 'appartement', rent: 160000, bedrooms: 3, bathrooms: 2, surface: 90, status: 'disponible', moderation: 'approved' },
      { owner: 'contact@abidjan-prestige.com', title: 'Villa Neuve', city: 'Bingerville', neighborhood: 'Zone Résidentielle', type: 'villa', rent: 420000, bedrooms: 4, bathrooms: 3, surface: 240, status: 'disponible', moderation: 'approved' },
      { owner: 'contact@abidjan-prestige.com', title: 'Appartement En Attente Modération', city: 'Abidjan', neighborhood: 'Cocody', type: 'appartement', rent: 200000, bedrooms: 2, bathrooms: 1, surface: 75, status: 'disponible', moderation: 'pending' },
    ];

    const propertyMap = new Map<string, string>();

    for (const propData of properties) {
      const ownerId = userMap.get(propData.owner);
      if (!ownerId) continue;

      const { data: property, error } = await supabase.from('properties').insert({
        owner_id: ownerId,
        title: propData.title,
        city: propData.city,
        neighborhood: propData.neighborhood,
        address: `${propData.neighborhood}, ${propData.city}`,
        property_type: propData.type,
        monthly_rent: propData.rent,
        deposit_amount: propData.rent * 2,
        bedrooms: propData.bedrooms,
        bathrooms: propData.bathrooms,
        surface_area: propData.surface,
        status: propData.status,
        moderation_status: propData.moderation,
        is_furnished: Math.random() > 0.5,
        has_parking: Math.random() > 0.3,
        has_garden: propData.type === 'villa' && Math.random() > 0.5,
        has_ac: Math.random() > 0.6,
        description: `Belle ${propData.type} située à ${propData.neighborhood}. Idéale pour ${propData.bedrooms > 2 ? 'famille' : 'couple ou célibataire'}.`,
      }).select().single();

      if (error) {
        console.error('Error creating property:', error);
        continue;
      }

      result.properties++;
      propertyMap.set(propData.title, property.id);
    }

    // 3. CRÉER LES CANDIDATURES
    const applications = [
      // OVERDUE (> 48h)
      { property: 'Villa Moderne 4 Chambres', applicant: 'koffi.mensah@example.com', status: 'pending', score: 92, daysAgo: 3 },
      { property: 'Penthouse Premium Vue Lagune', applicant: 'aminata.toure@example.com', status: 'pending', score: 88, daysAgo: 4 },
      { property: 'Duplex Luxueux 5 Chambres', applicant: 'yao.kouadio@example.com', status: 'pending', score: 90, daysAgo: 5 },
      
      // URGENT (< 48h)
      { property: 'Appartement 3 Pièces', applicant: 'fanta.diarra@example.com', status: 'pending', score: 65, daysAgo: 1 },
      { property: 'Appartement Standing', applicant: 'moussa.kone@example.com', status: 'pending', score: 58, daysAgo: 2 },
      
      // NORMALES
      { property: 'Villa Familiale', applicant: 'adjoua.assi@example.com', status: 'pending', score: 75, daysAgo: 0.5 },
      { property: 'Villa Contemporaine', applicant: 'awa.bamba@example.com', status: 'pending', score: 45, daysAgo: 0.3 },
      { property: 'Appartement Économique', applicant: 'ibrahim.sanogo@example.com', status: 'pending', score: 42, daysAgo: 0.2 },
      { property: 'Maison Moderne', applicant: 'nguessan.kouame@example.com', status: 'pending', score: 68, daysAgo: 0.8 },
      { property: 'Villa Neuve', applicant: 'mariam.ouattara@example.com', status: 'pending', score: 55, daysAgo: 1.2 },
      
      // APPROVED
      { property: 'Villa de Prestige', applicant: 'koffi.mensah@example.com', status: 'approved', score: 95, daysAgo: 10 },
      { property: 'Appartement 2 Pièces', applicant: 'aminata.toure@example.com', status: 'approved', score: 82, daysAgo: 8 },
      { property: 'Appartement Familial', applicant: 'yao.kouadio@example.com', status: 'approved', score: 88, daysAgo: 7 },
      { property: 'Villa Contemporaine', applicant: 'fanta.diarra@example.com', status: 'approved', score: 70, daysAgo: 12 },
      { property: 'Penthouse Premium Vue Lagune', applicant: 'moussa.kone@example.com', status: 'approved', score: 85, daysAgo: 9 },
      { property: 'Maison Moderne', applicant: 'adjoua.assi@example.com', status: 'approved', score: 78, daysAgo: 6 },
      { property: 'Duplex Luxueux 5 Chambres', applicant: 'koffi.mensah@example.com', status: 'approved', score: 92, daysAgo: 11 },
      { property: 'Villa Familiale', applicant: 'aminata.toure@example.com', status: 'approved', score: 80, daysAgo: 14 },
      
      // REJECTED
      { property: 'Appartement Standing', applicant: 'awa.bamba@example.com', status: 'rejected', score: 35, daysAgo: 15 },
      { property: 'Villa Neuve', applicant: 'ibrahim.sanogo@example.com', status: 'rejected', score: 30, daysAgo: 13 },
      { property: 'Appartement Économique', applicant: 'nguessan.kouame@example.com', status: 'rejected', score: 40, daysAgo: 16 },
      { property: 'Duplex Moderne', applicant: 'mariam.ouattara@example.com', status: 'rejected', score: 38, daysAgo: 17 },
      { property: 'Villa Rénovation Complète', applicant: 'awa.bamba@example.com', status: 'rejected', score: 32, daysAgo: 18 },
      { property: 'Appartement 3 Pièces', applicant: 'ibrahim.sanogo@example.com', status: 'rejected', score: 28, daysAgo: 20 },
      { property: 'Villa de Prestige', applicant: 'nguessan.kouame@example.com', status: 'rejected', score: 25, daysAgo: 19 },
    ];

    for (const appData of applications) {
      const propertyId = propertyMap.get(appData.property);
      const applicantId = userMap.get(appData.applicant);
      if (!propertyId || !applicantId) continue;

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(appData.daysAgo));

      const { error } = await supabase.from('rental_applications').insert({
        property_id: propertyId,
        applicant_id: applicantId,
        status: appData.status,
        application_score: appData.score,
        cover_letter: `Candidature pour ${appData.property}`,
        created_at: createdAt.toISOString(),
        reviewed_at: appData.status !== 'pending' ? new Date().toISOString() : null,
      });

      if (error) {
        console.error('Error creating application:', error);
        continue;
      }

      result.applications++;
      if (appData.daysAgo >= 3 && appData.status === 'pending') {
        result.overdueApplications++;
      }
    }

    // Marquer les candidatures en retard
    await supabase.rpc('mark_overdue_applications');

    // 4. CRÉER LES BAUX
    const leases = [
      // Actifs
      { property: 'Studio Meublé', landlord: 'jean-paul.kouassi@example.com', tenant: 'koffi.mensah@example.com', daysAgo: 90, certified: false },
      { property: 'Villa 4 Chambres avec Piscine', landlord: 'marie.diabate@example.com', tenant: 'aminata.toure@example.com', daysAgo: 60, certified: false },
      { property: 'Villa Moderne 4 Chambres', landlord: 'jean-paul.kouassi@example.com', tenant: 'yao.kouadio@example.com', daysAgo: 45, certified: false },
      { property: 'Appartement Familial', landlord: 'contact@abidjan-prestige.com', tenant: 'fanta.diarra@example.com', daysAgo: 30, certified: false },
      
      // Certifiés ANSUT
      { property: 'Villa 4 Chambres avec Piscine', landlord: 'marie.diabate@example.com', tenant: 'yao.kouadio@example.com', daysAgo: 120, certified: true, certifiedDaysAgo: 30 },
      { property: 'Duplex Moderne', landlord: 'contact@immobilier-ci.com', tenant: 'koffi.mensah@example.com', daysAgo: 90, certified: true, certifiedDaysAgo: 20 },
    ];

    for (const leaseData of leases) {
      const propertyId = propertyMap.get(leaseData.property);
      const landlordId = userMap.get(leaseData.landlord);
      const tenantId = userMap.get(leaseData.tenant);
      if (!propertyId || !landlordId || !tenantId) continue;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - leaseData.daysAgo);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const signedDate = new Date(startDate);
      signedDate.setDate(signedDate.getDate() - 5);

      const certifiedAt = leaseData.certified ? new Date(startDate) : null;
      if (certifiedAt && leaseData.certifiedDaysAgo) {
        certifiedAt.setDate(certifiedAt.getDate() + leaseData.certifiedDaysAgo);
      }

      const { error } = await supabase.from('leases').insert({
        property_id: propertyId,
        landlord_id: landlordId,
        tenant_id: tenantId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly_rent: 250000,
        deposit_amount: 500000,
        lease_type: 'residential',
        status: 'active',
        landlord_signed_at: signedDate.toISOString(),
        tenant_signed_at: signedDate.toISOString(),
        certification_status: leaseData.certified ? 'certified' : 'not_requested',
        ansut_certified_at: certifiedAt?.toISOString(),
        certified_by: leaseData.certified ? userMap.get('admin@ansut.ci') : null,
      });

      if (error) {
        console.error('Error creating lease:', error);
        continue;
      }

      result.leases++;
    }

    // 5. CRÉER DES FAVORIS
    const favorites = [
      { user: 'koffi.mensah@example.com', property: 'Penthouse Premium Vue Lagune' },
      { user: 'koffi.mensah@example.com', property: 'Villa de Prestige' },
      { user: 'aminata.toure@example.com', property: 'Duplex Luxueux 5 Chambres' },
      { user: 'yao.kouadio@example.com', property: 'Villa Contemporaine' },
      { user: 'fanta.diarra@example.com', property: 'Appartement Standing' },
    ];

    for (const fav of favorites) {
      const userId = userMap.get(fav.user);
      const propertyId = propertyMap.get(fav.property);
      if (!userId || !propertyId) continue;

      await supabase.from('user_favorites').insert({
        user_id: userId,
        property_id: propertyId,
      });

      result.favorites++;
    }

    // Logger l'action dans les audit logs
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action_type: 'seed_demo_data',
      target_type: 'database',
      target_id: user.id,
      notes: 'Base de données peuplée avec des données de démonstration',
      action_metadata: result,
    });

    console.log('Demo data seeding completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in seed-demo-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
