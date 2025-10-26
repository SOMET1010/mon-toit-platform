import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://haffcubwactwjpngcpdf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const ILLUSTRATIONS_DIR = '/home/ubuntu/mon-toit-illustrations';
const BUCKET_NAME = 'illustrations';

async function uploadFile(filePath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error(`❌ Erreur upload ${storagePath}:`, error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    console.log(`✅ ${storagePath} → ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`❌ Erreur lecture ${filePath}:`, err.message);
    return null;
  }
}

async function uploadAllIllustrations() {
  console.log('🚀 Upload des illustrations sur Supabase Storage...\n');

  const categories = [
    { dir: 'empty-states', files: ['no-properties.png', 'no-favorites.png', 'no-messages.png', 'no-applications.png', 'no-search-results.png'] },
    { dir: 'features', files: ['ansut-certification.png', 'electronic-signature.png', 'identity-verification.png', 'secure-payment.png', 'virtual-visit.png'] },
    { dir: 'sections', files: ['hero-happy-family.png', 'how-it-works.png', 'testimonials.png', 'security-trust.png', 'customer-support.png'] },
    { dir: 'realistic', files: ['hero-family-real.jpg', 'agent-professional.jpg', 'happy-tenant-couple.jpg', 'customer-support-agent.jpg', 'abidjan-modern-building.jpg'] }
  ];

  const urls = {};

  for (const category of categories) {
    console.log(`\n📁 Catégorie: ${category.dir}`);
    urls[category.dir] = {};

    for (const file of category.files) {
      const filePath = path.join(ILLUSTRATIONS_DIR, category.dir, file);
      const storagePath = `${category.dir}/${file}`;
      
      if (fs.existsSync(filePath)) {
        const url = await uploadFile(filePath, storagePath);
        if (url) {
          urls[category.dir][file] = url;
        }
      } else {
        console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      }
    }
  }

  // Sauvegarder les URLs dans un fichier JSON
  const urlsFilePath = path.join(__dirname, 'illustration-urls.json');
  fs.writeFileSync(urlsFilePath, JSON.stringify(urls, null, 2));
  console.log(`\n✅ URLs sauvegardées dans: ${urlsFilePath}`);

  console.log('\n🎉 Upload terminé !');
}

uploadAllIllustrations().catch(console.error);
