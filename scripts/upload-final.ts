import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://btxhuqtirylvkgvoutoc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYwMzE1NywiZXhwIjoyMDc2MTc5MTU3fQ.nfGsqtz7Vdh6cALpBVtBcMYmmalCBIb_ch6Mwjz9Hvk';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BUCKET_NAME = 'property-images';
const IMAGES_DIR = join(process.cwd(), 'public', 'property-images');

async function uploadImages() {
  console.log('🚀 Upload des images vers Supabase Storage...\n');

  const files = readdirSync(IMAGES_DIR).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );

  console.log(`📸 ${files.length} images trouvées\n`);

  for (const filename of files) {
    const filePath = join(IMAGES_DIR, filename);
    const fileBuffer = readFileSync(filePath);

    console.log(`   📤 ${filename}...`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error(`   ❌ ${error.message}`);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename);
      console.log(`   ✅ ${publicUrl}`);
    }
  }

  console.log('\n✨ Terminé !');
}

uploadImages().catch(console.error);
