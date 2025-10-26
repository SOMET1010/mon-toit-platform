/**
 * Script pour créer des annonces immobilières réelles pour Mon Toit Platform
 * 
 * Usage: npx tsx scripts/seed-real-properties.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://haffcubwactwjpngcpdf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxNTcsImV4cCI6MjA3NjE3OTE1N30.ltKdC_1MsDoHPOgdEtirrEuDofjnqyFTF2D4kpJGX28';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données réelles d'annonces immobilières à Abidjan
const REAL_PROPERTIES = [
  {
    title: "Appartement Moderne 3 Pièces - Cocody Riviera",
    description: "Magnifique appartement de 85m² situé dans une résidence sécurisée à Cocody Riviera. Comprend 2 chambres spacieuses, un salon lumineux, une cuisine équipée et une salle de bain moderne. Parking privé et gardiennage 24/7.",
    property_type: "appartement",
    transaction_type: "location",
    price: 350000,
    bedrooms: 2,
    bathrooms: 1,
    surface_area: 85,
    city: "Abidjan",
    neighborhood: "Cocody Riviera",
    address: "Riviera Golf, près du carrefour Solibra",
    amenities: ["Climatisation", "Parking", "Sécurité 24/7", "Cuisine équipée", "Balcon"],
    status: "available"
  },
  {
    title: "Villa de Luxe 5 Pièces - Cocody Angré",
    description: "Superbe villa contemporaine de 250m² sur un terrain de 400m². 4 chambres dont une suite parentale, grand salon, salle à manger, cuisine américaine équipée, piscine, jardin paysager. Quartier résidentiel calme et sécurisé.",
    property_type: "villa",
    transaction_type: "vente",
    price: 85000000,
    bedrooms: 4,
    bathrooms: 3,
    surface_area: 250,
    city: "Abidjan",
    neighborhood: "Cocody Angré",
    address: "Angré 8ème Tranche, près de l'école internationale",
    amenities: ["Piscine", "Jardin", "Garage 2 voitures", "Climatisation", "Cuisine équipée", "Sécurité"],
    status: "available"
  },
  {
    title: "Studio Meublé - Plateau Dokui",
    description: "Studio moderne de 35m² entièrement meublé et équipé, idéal pour jeune professionnel. Proche des commerces et transports. Immeuble récent avec ascenseur et gardien.",
    property_type: "studio",
    transaction_type: "location",
    price: 150000,
    bedrooms: 1,
    bathrooms: 1,
    surface_area: 35,
    city: "Abidjan",
    neighborhood: "Plateau Dokui",
    address: "Boulevard Carde, près de la Pyramide",
    amenities: ["Meublé", "Climatisation", "WiFi", "Ascenseur", "Sécurité"],
    status: "available"
  },
  {
    title: "Duplex Standing 4 Pièces - Riviera Palmeraie",
    description: "Duplex haut standing de 140m² dans résidence moderne. 3 chambres, 2 salles de bain, double salon, terrasse. Vue dégagée, calme absolu. Piscine commune, salle de sport.",
    property_type: "duplex",
    transaction_type: "location",
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    surface_area: 140,
    city: "Abidjan",
    neighborhood: "Riviera Palmeraie",
    address: "Riviera Palmeraie, résidence Les Palmiers",
    amenities: ["Piscine commune", "Salle de sport", "Parking", "Climatisation", "Terrasse", "Ascenseur"],
    status: "available"
  },
  {
    title: "Maison Familiale 4 Pièces - Yopougon Niangon",
    description: "Maison spacieuse de 120m² dans quartier familial. 3 chambres, salon, salle à manger, cuisine, cour intérieure. Idéale pour famille. Proche écoles et marchés.",
    property_type: "maison",
    transaction_type: "location",
    price: 200000,
    bedrooms: 3,
    bathrooms: 2,
    surface_area: 120,
    city: "Abidjan",
    neighborhood: "Yopougon Niangon",
    address: "Niangon Nord, près du CHU",
    amenities: ["Cour", "Parking", "Eau courante", "Électricité"],
    status: "available"
  },
  {
    title: "Appartement 2 Pièces - Marcory Zone 4",
    description: "Appartement confortable de 65m² au 3ème étage. 1 chambre, salon spacieux, cuisine, balcon. Résidence calme avec gardiennage. Proche commerces et transports.",
    property_type: "appartement",
    transaction_type: "location",
    price: 180000,
    bedrooms: 1,
    bathrooms: 1,
    surface_area: 65,
    city: "Abidjan",
    neighborhood: "Marcory Zone 4",
    address: "Zone 4C, près de la pharmacie centrale",
    amenities: ["Balcon", "Parking", "Sécurité", "Climatisation"],
    status: "available"
  },
  {
    title: "Villa Moderne 6 Pièces - Cocody II Plateaux",
    description: "Villa d'exception de 300m² sur 500m² de terrain. 5 chambres climatisées, 4 salles de bain, double salon, bureau, piscine, jardin tropical. Standing premium.",
    property_type: "villa",
    transaction_type: "vente",
    price: 120000000,
    bedrooms: 5,
    bathrooms: 4,
    surface_area: 300,
    city: "Abidjan",
    neighborhood: "Cocody II Plateaux",
    address: "II Plateaux Vallon, voie principale",
    amenities: ["Piscine", "Jardin", "Bureau", "Garage 3 voitures", "Climatisation", "Cuisine équipée", "Sécurité 24/7"],
    status: "available"
  },
  {
    title: "Studio Étudiant - Abobo Gare",
    description: "Studio simple de 25m² pour étudiant ou jeune travailleur. Cuisine intégrée, salle d'eau. Quartier animé, proche université et gare routière.",
    property_type: "studio",
    transaction_type: "location",
    price: 80000,
    bedrooms: 1,
    bathrooms: 1,
    surface_area: 25,
    city: "Abidjan",
    neighborhood: "Abobo Gare",
    address: "Abobo Gare, près de la station Total",
    amenities: ["Cuisine intégrée", "Eau courante", "Électricité"],
    status: "available"
  }
];

async function seedProperties() {
  console.log('🌱 Début du seeding des annonces réelles...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const property of REAL_PROPERTIES) {
    try {
      console.log(`📝 Création: ${property.title}...`);
      
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select();
      
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Créé avec succès (ID: ${data[0]?.id})`);
        successCount++;
      }
      
    } catch (error) {
      console.error(`❌ Exception:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📊 Résumé du seeding:');
  console.log(`✅ Succès: ${successCount}/${REAL_PROPERTIES.length}`);
  console.log(`❌ Échecs: ${errorCount}/${REAL_PROPERTIES.length}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Annonces créées avec succès !');
    console.log('📝 Vous pouvez maintenant les voir sur la plateforme');
  }
}

seedProperties().catch(console.error);

