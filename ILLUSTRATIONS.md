# Documentation des Illustrations Ivoiriennes

Ce document décrit l'utilisation et la gestion des 10 illustrations ivoiriennes générées par l'IA pour enrichir l'expérience visuelle de Mon Toit.

## 📁 Structure des fichiers

```
src/assets/illustrations/ivorian/
├── ivorian-family-house.png
├── apartment-visit.png
├── real-estate-agent.png
├── abidjan-neighborhood.png
├── modern-living-room.png
├── abidjan-skyline.png
├── key-handover.png
├── family-moving.png
├── co-ownership-meeting.png
├── certification-ansut-illustration.png
└── illustrationPaths.ts
```

## 🎨 Mapping des illustrations

| Fichier | Utilisation | Composants | Pages |
|---------|-------------|------------|-------|
| `ivorian-family-house.png` | Famille heureuse devant une maison | Hero, Features | Index |
| `apartment-visit.png` | Visite guidée d'appartement | Features, PropertyCard | Index, Explorer |
| `real-estate-agent.png` | Agent immobilier professionnel | Features, HowItWorks | Index, Certification |
| `abidjan-neighborhood.png` | Vue du quartier d'Abidjan | ExploreMap banner | Explorer, HowItWorks |
| `modern-living-room.png` | Intérieur moderne et lumineux | PropertyCard, FeaturedProperties | Explorer, Search |
| `abidjan-skyline.png` | Skyline moderne d'Abidjan | Hero alternatif, Footer | Index |
| `key-handover.png` | Remise de clés symbolique | Testimonials, Success | Index, Applications |
| `family-moving.png` | Famille en déménagement | HowItWorks, Onboarding | Index |
| `co-ownership-meeting.png` | Réunion de copropriété | Admin Dashboard | Admin |
| `certification-ansut-illustration.png` | Certification officielle ANSUT | CertificationBanner | Certification, Index |

## 🚀 Utilisation dans le code

### Import avec helper

```typescript
import { getIllustrationPath } from "@/lib/utils";
import { LazyIllustration } from "@/components/illustrations/LazyIllustration";

// Dans votre composant
const illustrationSrc = getIllustrationPath('ivorian-family-house');

<LazyIllustration 
  src={illustrationSrc} 
  alt="Famille ivoirienne heureuse devant sa maison"
  className="w-full h-64 rounded-lg"
  animate={true}
/>
```

### Import direct

```typescript
import familyHouseImg from "@/assets/illustrations/ivorian/ivorian-family-house.png";

<img src={familyHouseImg} alt="Famille ivoirienne" className="w-full" />
```

### Avec fallback

```typescript
import { LazyIllustration } from "@/components/illustrations/LazyIllustration";
import { Home } from "lucide-react";

<LazyIllustration 
  src={illustrationSrc}
  alt="Description"
  fallback={
    <div className="flex items-center justify-center h-64 bg-primary/10">
      <Home className="h-12 w-12 text-primary" />
    </div>
  }
/>
```

## 🎬 Animations disponibles

Les illustrations supportent plusieurs animations CSS :

- `animate-fade-in-up` : Apparition depuis le bas avec fade
- `animate-float` : Animation de flottement continue
- `animate-fade-in` : Simple fade-in

```typescript
<LazyIllustration 
  src={src}
  alt="Description"
  className="animate-float" // ou animate-fade-in-up
/>
```

## 🔄 Régénération d'une illustration

### Via le Dashboard Admin

1. Aller sur `/admin`
2. Cliquer sur l'onglet "Illustrations"
3. Cliquer sur "Générer les 10 illustrations"
4. Télécharger les nouvelles images
5. Remplacer les fichiers dans `src/assets/illustrations/ivorian/`

### Via l'API directement

```typescript
const { data } = await supabase.functions.invoke('generate-illustration', {
  body: {
    prompt: "Votre nouveau prompt détaillé ici",
    filename: "nouvelle-illustration.png"
  }
});
```

## 📊 Spécifications techniques

- **Format** : PNG avec transparence
- **Ratio** : 16:9 (recommandé pour la plupart des usages)
- **Style** : Flat design, couleurs Mon Toit (primaires : orange/terracotta, secondaires : bleu)
- **Thème** : Ivoirien (architecture, personnages, contexte local)
- **Optimisation** : Lazy loading automatique via `LazyIllustration`

## 🛠️ Composants disponibles

### LazyIllustration

Composant optimisé avec :
- Lazy loading (IntersectionObserver)
- Shimmer placeholder pendant le chargement
- Animation d'apparition
- Gestion d'erreur avec fallback
- Performance optimisée

### IllustrationManager

Composant admin pour :
- Télécharger toutes les illustrations générées
- Voir le statut de téléchargement
- Téléchargement individuel ou en masse

## 📝 Best Practices

1. **Toujours utiliser LazyIllustration** pour les images grandes ou hors viewport initial
2. **Fournir un alt text descriptif** pour l'accessibilité
3. **Utiliser les helpers** (`getIllustrationPath`) pour éviter les erreurs de path
4. **Prévoir des fallbacks** avec icônes Lucide pour les cas d'erreur
5. **Optimiser le chargement** : lazy load + shimmer pour une UX fluide

## 🐛 Troubleshooting

### L'illustration ne s'affiche pas

1. Vérifier que le fichier existe dans `src/assets/illustrations/ivorian/`
2. Vérifier le mapping dans `illustrationPaths.ts`
3. Vérifier la console pour les erreurs de chargement
4. Vérifier que le fallback s'affiche correctement

### L'animation ne fonctionne pas

1. Vérifier que les classes CSS sont présentes dans `src/index.css`
2. Vérifier que `animate={true}` est passé au composant
3. Vérifier la configuration Tailwind pour les animations

### Performance dégradée

1. S'assurer d'utiliser `LazyIllustration` et non `<img>` direct
2. Vérifier que les illustrations ne sont pas trop lourdes (< 500KB)
3. Utiliser le bon ratio d'aspect pour éviter le layout shift

## 📞 Support

Pour toute question sur les illustrations :
- Consulter ce document
- Vérifier les composants dans `src/components/illustrations/`
- Consulter le code du générateur dans `src/components/admin/IllustrationGenerator.tsx`
