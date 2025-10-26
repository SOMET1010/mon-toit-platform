#!/usr/bin/env tsx

/**
 * Script de test de connexion Supabase
 * Vérifie que la base de données est accessible
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://haffcubwactwjpngcpdf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxNTcsImV4cCI6MjA3NjE3OTE1N30.ltKdC_1MsDoHPOgdEtirrEuDofjnqyFTF2D4kpJGX28';

console.log('🧪 Test de connexion Supabase...\n');
console.log(`📍 URL: ${SUPABASE_URL}`);
console.log(`🔑 Key: ${SUPABASE_KEY.substring(0, 20)}...\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabase() {
  const results = {
    connection: false,
    properties: false,
    users: false,
    auth: false
  };

  // Test 1: Connexion basique
  console.log('1️⃣  Test de connexion basique...');
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log('   ✅ Connexion réussie');
      results.connection = true;
    }
  } catch (error: any) {
    console.log(`   ❌ Exception: ${error.message}`);
  }

  // Test 2: Lecture de propriétés
  console.log('\n2️⃣  Test de lecture des propriétés...');
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, price, property_type')
      .limit(3);
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log(`   ✅ ${data?.length || 0} propriétés trouvées`);
      if (data && data.length > 0) {
        console.log(`   📄 Exemple: ${data[0].title} - ${data[0].price} FCFA`);
        results.properties = true;
      }
    }
  } catch (error: any) {
    console.log(`   ❌ Exception: ${error.message}`);
  }

  // Test 3: Vérification table users
  console.log('\n3️⃣  Test de la table users...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`   ⚠️  Table profiles: ${error.message}`);
    } else {
      console.log('   ✅ Table profiles accessible');
      results.users = true;
    }
  } catch (error: any) {
    console.log(`   ❌ Exception: ${error.message}`);
  }

  // Test 4: Test auth
  console.log('\n4️⃣  Test du système d\'authentification...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`   ⚠️  ${error.message}`);
    } else {
      console.log('   ✅ Système d\'auth opérationnel');
      results.auth = true;
    }
  } catch (error: any) {
    console.log(`   ❌ Exception: ${error.message}`);
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(50));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const score = (passedTests / totalTests * 100).toFixed(0);

  console.log(`\n✅ Tests réussis: ${passedTests}/${totalTests} (${score}%)`);
  console.log(`\nDétails:`);
  console.log(`  ${results.connection ? '✅' : '❌'} Connexion basique`);
  console.log(`  ${results.properties ? '✅' : '❌'} Lecture propriétés`);
  console.log(`  ${results.users ? '✅' : '❌'} Table users/profiles`);
  console.log(`  ${results.auth ? '✅' : '❌'} Système d'authentification`);

  if (passedTests === totalTests) {
    console.log('\n🎉 SUPABASE FONCTIONNE PARFAITEMENT !');
    return 0;
  } else if (passedTests >= totalTests / 2) {
    console.log('\n⚠️  SUPABASE FONCTIONNE PARTIELLEMENT');
    return 1;
  } else {
    console.log('\n❌ SUPABASE NE FONCTIONNE PAS CORRECTEMENT');
    return 2;
  }
}

testSupabase()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(3);
  });

