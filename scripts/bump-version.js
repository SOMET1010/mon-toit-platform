#!/usr/bin/env node

/**
 * Script pour incrémenter automatiquement la version de Mon Toit
 * Usage: node scripts/bump-version.js [major|minor|patch|build|revision]
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '../VERSION');
const PACKAGE_JSON = path.join(__dirname, '../package.json');

// Lire la version actuelle
const currentVersion = fs.readFileSync(VERSION_FILE, 'utf8').trim();
const [major, minor, patch, build, revision] = currentVersion.split('.').map(Number);

// Déterminer le type d'incrémentation
const type = process.argv[2] || 'revision';

let newVersion;

switch (type) {
  case 'major':
    newVersion = `${major + 1}.0.0.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0.0.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}.0.0`;
    break;
  case 'build':
    newVersion = `${major}.${minor}.${patch}.${build + 1}.0`;
    break;
  case 'revision':
  default:
    newVersion = `${major}.${minor}.${patch}.${build}.${revision + 1}`;
    break;
}

// Mettre à jour VERSION
fs.writeFileSync(VERSION_FILE, newVersion + '\n');
console.log(`✅ VERSION: ${currentVersion} → ${newVersion}`);

// Mettre à jour package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`✅ package.json: version mise à jour`);

// Afficher la nouvelle version
console.log(`\n🎉 Nouvelle version: v${newVersion}`);
console.log(`\nN'oubliez pas de :`);
console.log(`  1. Mettre à jour CHANGELOG.md`);
console.log(`  2. Commit: git add -A && git commit -m "🔖 Version ${newVersion}"`);
console.log(`  3. Tag: git tag v${newVersion}`);
console.log(`  4. Push: git push origin main --tags`);

