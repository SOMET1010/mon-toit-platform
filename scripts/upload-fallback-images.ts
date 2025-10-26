/**
 * Script pour uploader les images fallback sur Supabase Storage
 * 
 * Usage: npx tsx scripts/upload-fallback-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://haffcubwactwjpngcpdf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmZjdWJ3YWN0d2pwbmdjcGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxNTcsImV4cCI6MjA3NjE3OTE1N30.ltKdC_1MsDoHPOgdEtirrEuDofjnqyFTF2D4kpJGX28';

const supabase = createClient(supabaseUrl, supabaseKey);

// Nom du bucket Supabase Storage
const BUCKET_NAME = 'property-fallback-images';

// Dossier contenant les images
const IMAGES_DIR = join(process.cwd(), 'public', 'property-images');

// Liste des images à uploader
const FALLBACK_IMAGES = [
  'appartement-moderne-abidjan.jpg',
  'villa-luxe-cocody.jpg',
  'studio-plateau.jpg',
  'duplex-riviera.jpg',
  'maison-yopougon.jpg',
  'immeuble-residentiel.jpg',
  'building-moderne.jpg',
  'residence-standing.jpg'
];

async function createBucketIfNotExists() {
  console.log('🔍 Vérification du bucket...');
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log('📦 Création du bucket...');
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });
    
    if (error) {
      console.error('❌ Erreur création bucket:', error);
      return false;
    }
    console.log('✅ Bucket créé avec succès');
  } else {
    console.log('✅ Bucket existe déjà');
  }
  
  return true;
}

async function uploadImage(filename: string) {
  const filePath = join(IMAGES_DIR, filename);
  
  try {
    console.log(`📤 Upload de ${filename}...`);
    
    // Lire le fichier
    const fileBuffer = readFileSync(filePath);
    
    // Upload sur Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 an
        upsert: true // Remplacer si existe déjà
      });
    
    if (error) {
      console.error(`❌ Erreur upload ${filename}:`, error);
      return null;
    }
    
    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    console.log(`✅ ${filename} → ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error(`❌ Erreur lecture ${filename}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Début de l\'upload des images fallback sur Supabase Storage\n');
  
  // Créer le bucket si nécessaire
  const bucketReady = await createBucketIfNotExists();
  if (!bucketReady) {
    console.error('❌ Impossible de créer le bucket');
    process.exit(1);
  }
  
  console.log('\n📤 Upload des images...\n');
  
  // Upload de chaque image
  const results: Record<string, string | null> = {};
  
  for (const filename of FALLBACK_IMAGES) {
    const url = await uploadImage(filename);
    results[filename] = url;
  }
  
  // Résumé
  console.log('\n📊 Résumé de l\'upload:\n');
  
  const successful = Object.values(results).filter(url => url !== null).length;
  const failed = FALLBACK_IMAGES.length - successful;
  
  console.log(`✅ Succès: ${successful}/${FALLBACK_IMAGES.length}`);
  console.log(`❌ Échecs: ${failed}/${FALLBACK_IMAGES.length}`);
  
  if (successful > 0) {
    console.log('\n🔗 URLs générées:\n');
    Object.entries(results).forEach(([filename, url]) => {
      if (url) {
        console.log(`${filename}: ${url}`);
      }
    });
    
    console.log('\n✅ Upload terminé avec succès !');
    console.log('\n📝 Prochaine étape: Mettre à jour SimpleImageEnhanced.tsx avec ces URLs');
  } else {
    console.error('\n❌ Aucune image n\'a pu être uploadée');
    process.exit(1);
  }
}

main().catch(console.error);

