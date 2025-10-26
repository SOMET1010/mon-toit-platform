import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://haffcubwactwjpngcpdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxNTcsImV4cCI6MjA3NjE3OTE1N30.ltKdC_1MsDoHPOgdEtirrEuDofjnqyFTF2D4kpJGX28';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateBucket() {
  console.log('🔍 Vérification des buckets existants...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Erreur liste buckets:', listError);
    return;
  }
  
  console.log('📦 Buckets existants:', buckets.map(b => b.name).join(', '));
  
  const illustrationsBucket = buckets.find(b => b.name === 'illustrations');
  
  if (illustrationsBucket) {
    console.log('✅ Le bucket "illustrations" existe déjà !');
  } else {
    console.log('📝 Création du bucket "illustrations"...');
    const { data, error } = await supabase.storage.createBucket('illustrations', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      console.error('❌ Erreur création bucket:', error);
    } else {
      console.log('✅ Bucket "illustrations" créé avec succès !');
    }
  }
}

checkAndCreateBucket().catch(console.error);
