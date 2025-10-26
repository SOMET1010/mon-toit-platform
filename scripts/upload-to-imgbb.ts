import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const IMGBB_API_KEY = '46c5d8c5c3e8b8c0e5e8b8c0e5e8b8c0'; // Clé publique de test
const IMAGES_DIR = join(process.cwd(), 'public', 'property-images');

async function uploadToImgBB(imagePath: string, filename: string) {
  const imageBuffer = readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const formData = new URLSearchParams();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', base64Image);
  formData.append('name', filename.replace(/\.[^/.]+$/, ''));

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || 'Upload failed');
  }
}

async function uploadAllImages() {
  console.log('🚀 Upload des images vers ImgBB...\n');

  const files = readdirSync(IMAGES_DIR).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  console.log(`📸 ${files.length} images trouvées\n`);

  const urls: Record<string, string> = {};

  for (const filename of files) {
    const filePath = join(IMAGES_DIR, filename);
    
    try {
      console.log(`   Uploading: ${filename}...`);
      const url = await uploadToImgBB(filePath, filename);
      urls[filename] = url;
      console.log(`   ✅ ${url}`);
    } catch (error: any) {
      console.error(`   ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n✨ URLs générées:\n');
  console.log(JSON.stringify(urls, null, 2));
}

uploadAllImages().catch(console.error);
