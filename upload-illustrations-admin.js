import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://haffcubwactwjpngcpdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYwMzE1NywiZXhwIjoyMDc2MTc5MTU3fQ.nfGsqtz7Vdh6cALpBVtBcMYmmalCBIb_ch6Mwjz9Hvk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error(`❌ ${storagePath}: ${error.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    console.log(`✅ ${storagePath}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`❌ Erreur lecture ${filePath}:`, err.message);
    return null;
  }
}

async function uploadAllIllustrations() {
  console.log('🚀 Upload des illustrations sur Supabase Storage\n');

  const categories = [
    { 
      dir: 'empty-states', 
      files: [
        'no-properties.png', 
        'no-favorites.png', 
        'no-messages.png', 
        'no-applications.png', 
        'no-search-results.png'
      ] 
    },
    { 
      dir: 'features', 
      files: [
        'ansut-certification.png', 
        'electronic-signature.png', 
        'identity-verification.png', 
        'secure-payment.png', 
        'virtual-visit.png'
      ] 
    },
    { 
      dir: 'sections', 
      files: [
        'hero-happy-family.png', 
        'how-it-works.png', 
        'testimonials.png', 
        'security-trust.png', 
        'customer-support.png'
      ] 
    },
    { 
      dir: 'realistic', 
      files: [
        'hero-family-real.jpg', 
        'agent-professional.jpg', 
        'happy-tenant-couple.jpg', 
        'customer-support-agent.jpg', 
        'abidjan-modern-building.jpg'
      ] 
    }
  ];

  const urls = {};
  let totalUploaded = 0;

  for (const category of categories) {
    console.log(`\n📁 ${category.dir.toUpperCase()}`);
    urls[category.dir] = {};

    for (const file of category.files) {
      const filePath = path.join(ILLUSTRATIONS_DIR, category.dir, file);
      const storagePath = `${category.dir}/${file}`;
      
      if (fs.existsSync(filePath)) {
        const url = await uploadFile(filePath, storagePath);
        if (url) {
          urls[category.dir][file] = url;
          totalUploaded++;
        }
      } else {
        console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      }
    }
  }

  // Sauvegarder les URLs dans un fichier JSON
  const urlsFilePath = path.join(__dirname, 'illustration-urls.json');
  fs.writeFileSync(urlsFilePath, JSON.stringify(urls, null, 2));
  
  console.log(`\n\n✅ ${totalUploaded}/20 illustrations uploadées avec succès !`);
  console.log(`📄 URLs sauvegardées: illustration-urls.json\n`);
}

uploadAllIllustrations().catch(console.error);
