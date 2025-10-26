import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://haffcubwactwjpngcpdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYwMzE1NywiZXhwIjoyMDc2MTc5MTU3fQ.nfGsqtz7Vdh6cALpBVtBcMYmmalCBIb_ch6Mwjz9Hvk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateBucket() {
  console.log('🔍 Vérification des buckets existants...\n');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Erreur liste buckets:', listError);
    return;
  }
  
  console.log('📦 Buckets existants:', buckets.map(b => b.name).join(', '));
  console.log('');
  
  const illustrationsBucket = buckets.find(b => b.name === 'illustrations');
  
  if (illustrationsBucket) {
    console.log('✅ Le bucket "illustrations" existe déjà !');
  } else {
    console.log('📝 Création du bucket "illustrations"...');
    const { data, error } = await supabase.storage.createBucket('illustrations', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
    });
    
    if (error) {
      console.error('❌ Erreur création bucket:', error);
    } else {
      console.log('✅ Bucket "illustrations" créé avec succès !');
      console.log('📊 Détails:', data);
    }
  }
}

checkAndCreateBucket().catch(console.error);
