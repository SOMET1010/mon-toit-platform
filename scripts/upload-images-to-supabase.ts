import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://btxhuqtirylvkgvoutoc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eGh1cXRpcnlsdmtndm91dG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODA0MDcsImV4cCI6MjA3NTE1NjQwN30.yjG6Xp3y6ZiJLRM1AInfP84U1AAL333u80iRXGnSnc4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = 'property-images';
const IMAGES_DIR = join(process.cwd(), 'public', 'property-images');

async function uploadImages() {
  console.log('🚀 Upload des images vers Supabase Storage...\n');

  // 1. Créer le bucket s'il n'existe pas
  console.log('📦 Vérification du bucket...');
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log('   Création du bucket "property-images"...');
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5 MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });

    if (error) {
      console.error('   ❌ Erreur création bucket:', error.message);
      return;
    }
    console.log('   ✅ Bucket créé avec succès');
  } else {
    console.log('   ✅ Bucket existe déjà');
  }

  // 2. Lister les images à uploader
  const files = readdirSync(IMAGES_DIR).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );

  console.log(`\n📸 ${files.length} images trouvées\n`);

  // 3. Uploader chaque image
  for (const filename of files) {
    const filePath = join(IMAGES_DIR, filename);
    const fileBuffer = readFileSync(filePath);

    console.log(`   Uploading: ${filename}...`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true // Remplacer si existe déjà
      });

    if (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
    } else {
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename);

      console.log(`   ✅ Uploadé: ${publicUrl}`);
    }
  }

  console.log('\n✨ Upload terminé !');
}

uploadImages().catch(console.error);
