# Guide de Build Mobile - Mon Toit

## Vue d'ensemble

Ce guide détaille le processus de compilation et de déploiement des applications mobiles Mon Toit utilisant Capacitor.

## Prérequis

### Logiciels requis
- Node.js 18+ et npm/yarn
- Android Studio (pour Android)
- Xcode 14+ (pour iOS)
- Java Development Kit (JDK) 11+
- Git

### Variables d'environnement
```bash
# .env
VITE_SUPABASE_URL=https://btxhuqtirylvkgvoutoc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token
```

## Configuration du Projet

### 1. Vérification des versions Capacitor

Les versions de tous les plugins Capacitor sont alignées sur la version 7.4.3 :

```json
{
  "dependencies": {
    "@capacitor/android": "^7.4.3",
    "@capacitor/app": "^7.4.3",
    "@capacitor/browser": "^7.4.3",
    "@capacitor/camera": "^7.4.3",
    "@capacitor/core": "^7.4.3",
    "@capacitor/device": "^7.4.3",
    "@capacitor/filesystem": "^7.4.3",
    "@capacitor/geolocation": "^7.4.3",
    "@capacitor/haptics": "^7.4.3",
    "@capacitor/ios": "^7.4.3",
    "@capacitor/keyboard": "^7.4.3",
    "@capacitor/network": "^7.4.3",
    "@capacitor/preferences": "^7.4.3",
    "@capacitor/push-notifications": "^7.4.3",
    "@capacitor/share": "^7.4.3",
    "@capacitor/splash-screen": "^7.4.3",
    "@capacitor/status-bar": "^7.4.3"
  }
}
```

### 2. Configuration Capacitor

Le fichier `capacitor.config.ts` contient la configuration standardisée :

```typescript
const config: CapacitorConfig = {
  appId: 'ci.montoit.app',
  appName: 'Mon Toit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'https://montoit.ci',
      'https://*.supabase.co',
      'https://api.mapbox.com',
      'https://tiles.mapbox.com',
      'https://*.mapbox.com'
    ],
    cleartext: false, // Sécurité renforcée
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#667eea',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FF8F00',
    }
  }
};
```

## Build et Déploiement

### 1. Build Web

```bash
# Build de développement
npm run build:dev

# Build de production
npm run build

# Build avec analyse du bundle
npm run build:analyze

# Build avec synchronisation mobile
npm run build:mobile
```

### 2. Build Android

#### Génération du projet Android
```bash
# Première fois - création du projet Android
npx cap add android

# Synchroniser les assets web
npx cap sync android

# Ouvrir dans Android Studio
npm run mobile:open:android
```

#### Build APK
```bash
# Build debug (pour tests)
npm run mobile:build:debug

# Build release (pour distribution)
npm run mobile:build:release
```

#### Génération de l'APK signé
```bash
cd android
./gradlew assembleRelease

# APK généré dans : android/app/build/outputs/apk/release/app-release.apk
```

### 3. Build iOS

#### Génération du projet iOS
```bash
# Première fois - création du projet iOS
npx cap add ios

# Synchroniser les assets web
npx cap sync ios

# Ouvrir dans Xcode
npm run mobile:open:ios
```

#### Build IPA
```bash
# Dans Xcode, configurer :
# 1. Code Signing (Developer Account requis)
# 2. Bundle Identifier : ci.montoit.app
# 3. Version : 2.1.0
# 4. Build Number : increment

# Build via Xcode
# Product > Archive > Distribute App
```

## Optimisation du Build

### 1. Bundle Size
```bash
# Analyser la taille du bundle
npm run bundle:analyze

# Visualiser les statistiques
npm run bundle:stats
```

### 2. Optimisations Vite
- Code splitting automatique
- Tree shaking des dépendances
- Compression des assets
- Lazy loading des composants lourds

### 3. Images
- WebP pour les navigateurs modernes
- Compression automatique des images
- Lazy loading des images

## Tests Mobile

### 1. Tests sur устройстве
```bash
# Android (émulateur ou device)
npx cap run android

# iOS (simulateur ou device)
npx cap run ios
```

### 2. Tests E2E Mobile
```bash
# Configuration Playwright pour mobile
npm run test:e2e
```

## Dépannage

### Problèmes courants

#### 1. Erreur de versioning
```bash
# Aligner toutes les versions Capacitor
npm install @capacitor/core@^7.4.3 @capacitor/android@^7.4.3 @capacitor/ios@^7.4.3

# Nettoyer et resynchroniser
npx cap clean
npx cap sync
```

#### 2. Conflits de dépendances
```bash
# Supprimer node_modules et package-lock
rm -rf node_modules package-lock.json

# Réinstaller
npm install

# Resynchroniser
npx cap sync
```

#### 3. Erreurs de build Android
```bash
# Vérifier les versions SDK
./android/gradlew wrapper --gradle-version 8.0.1

# Build avec logs détaillés
cd android
./gradlew assembleRelease --stacktrace --info
```

#### 4. Erreurs de build iOS
```bash
# Nettoyer Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData

# Resynchroniser les pods
cd ios/App
pod deintegrate
pod install
```

## Sécurité

### 1. Configuration de production
```typescript
// Capacitor Security
server: {
  cleartext: false, // HTTPS obligatoire
  allowNavigation: [
    'https://montoit.ci', // Restreindre aux domaines autorisés
    'https://*.supabase.co'
  ]
}
```

### 2. Permissions Android
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 3. Configuration iOS
```xml
<!-- ios/App/App/Info.plist -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Cette application nécessite l'accès à votre position</string>
```

## Distribution

### 1. Google Play Store
```bash
# Générer l'APK release signé
./android/gradlew bundleRelease

# Upload sur Google Play Console
# Utiliser .aab (Android App Bundle) de préférence
```

### 2. Apple App Store
```bash
# Archive via Xcode
# Upload via Application Loader ou Xcode Organizer
# Validation App Store Connect
```

## Monitoring et Logging

### 1. Sentry Integration
```typescript
// Configuration Sentry dans vite.config.ts
if (mode === "production") {
  plugins.push(sentryVitePlugin({
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }));
}
```

### 2. Performance Monitoring
```bash
# Bundle analysis en CI
npm run ci:build

# Tests de performance
npm run test:performance
```

## Maintenance

### 1. Mise à jour des versions
```bash
# Vérifier les mises à jour Capacitor
npm outdated @capacitor/*

# Mettre à jour avec soins
npm update @capacitor/core @capacitor/android @capacitor/ios

# Tester après chaque mise à jour
npm run build:mobile
```

### 2. Nettoyage périodique
```bash
# Nettoyer les caches
npx cap clean
rm -rf node_modules
npm install
npx cap sync
```

## Commandes Utililes

```bash
# Commands rapides
npm run build:mobile     # Build + sync
npm run mobile:open:android  # Ouvrir Android Studio
npm run mobile:open:ios     # Ouvrir Xcode
npm run mobile:build:debug  # Build debug
npm run mobile:build:release # Build release
npm run bundle:analyze      # Analyser le bundle
npm run test:all           # Tous les tests
```

## Support

En cas de problème, vérifier :
1. Versions des outils (Node.js, Android Studio, Xcode)
2. Variables d'environnement
3. Permissions et certificats
4. Logs détaillés avec `--stacktrace --info`