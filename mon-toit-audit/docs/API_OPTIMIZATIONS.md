# 📚 DOCUMENTATION API - OPTIMISATIONS MON TOIT

**Version:** 2.0.0  
**Date:** 25 octobre 2025  

---

## 🎯 Vue d'ensemble

Cette documentation couvre les nouvelles API et optimisations implémentées pour améliorer les performances de la plateforme Mon Toit.

---

## 🔄 HOOK DE PAGINATION INTELLIGENTE

### `useSmartPagination<T>`

Hook React personnalisé pour une pagination intelligente avec recherche et tri.

#### Usage

```typescript
import { useSmartPagination } from '@/hooks/use-smart-pagination';

interface Property {
  id: string;
  name: string;
  city: string;
  price: number;
}

const PropertyList = () => {
  const properties = [/* données des propriétés */];
  
  const {
    currentItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setSearchValue,
    nextPage,
    previousPage,
    goToPage,
    totalItems,
    startIndex,
    endIndex
  } = useSmartPagination<Property>({
    data: properties,
    pageSize: 20,
    enableInfiniteScroll: true,
    prefetchThreshold: 3,
    searchKeys: ['name', 'city'],
    sortBy: 'price',
    sortOrder: 'asc'
  });

  return (
    <div>
      <input 
        placeholder="Rechercher..."
        onChange={(e) => setSearchValue(e.target.value)}
      />
      
      <div>
        {currentItems.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={nextPage}
        onPrevious={previousPage}
        onPageChange={goToPage}
      />
      
      <p>
        Affichage {startIndex}-{endIndex} sur {totalItems} éléments
      </p>
    </div>
  );
};
```

#### Options

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `data` | `T[]` | - | Données à paginer |
| `pageSize` | `number` | `20` | Nombre d'éléments par page |
| `maxPages` | `number` | `50` | Nombre maximum de pages |
| `enableInfiniteScroll` | `boolean` | `true` | Activer le scroll infini |
| `prefetchThreshold` | `number` | `3` | Seuil de préchargement |
| `searchKeys` | `(keyof T)[]` | `[]` | Clés pour la recherche |
| `searchValue` | `string` | - | Valeur de recherche externe |
| `sortBy` | `keyof T` | - | Propriété pour le tri |
| `sortOrder` | `'asc' \| 'desc'` | `'asc'` | Ordre de tri |

#### Retour

| Propriété | Type | Description |
|-----------|------|-------------|
| `currentItems` | `T[]` | Éléments de la page actuelle |
| `currentPage` | `number` | Page actuelle (1-indexée) |
| `totalPages` | `number` | Nombre total de pages |
| `pageSize` | `number` | Taille de page actuelle |
| `hasNextPage` | `boolean` | A une page suivante |
| `hasPreviousPage` | `boolean` | A une page précédente |
| `filteredData` | `T[]` | Données filtrées et triées |
| `searchValue` | `string` | Valeur de recherche actuelle |
| `isLoading` | `boolean` | État de chargement |
| `nextPage` | `() => void` | Aller à la page suivante |
| `previousPage` | `() => void` | Aller à la page précédente |
| `goToPage` | `(page: number) => void` | Aller à une page spécifique |
| `setPageSize` | `(size: number) => void` | Changer la taille de page |
| `setSearchValue` | `(value: string) => void` | Définir la recherche |
| `resetPagination` | `() => void` | Réinitialiser la pagination |
| `totalItems` | `number` | Nombre total d'éléments |
| `startIndex` | `number` | Index de début (1-indexé) |
| `endIndex` | `number` | Index de fin (inclusif) |

---

## 💾 SYSTÈME DE CACHE ADAPTATIF

### `AdaptiveCache<T>`

Système de cache LRU (Least Recently Used) avec TTL automatique.

#### Usage

```typescript
import { AdaptiveCache } from '@/lib/adaptive-cache';

// Cache personnalisé
const userCache = new AdaptiveCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  autoCleanup: true,
  cleanupInterval: 60 * 1000, // 1 minute
});

// Stocker des données
userCache.set('user_123', { id: 123, name: 'John Doe' });

// Récupérer des données
const user = userCache.get('user_123');

// Vérifier l'existence
if (userCache.has('user_123')) {
  console.log('Utilisateur en cache');
}

// Statistiques
const stats = userCache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);

// Nettoyer
userCache.clear();
```

#### Options

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `maxSize` | `number` | `100` | Taille maximum du cache |
| `defaultTTL` | `number` | `5*60*1000` | Durée de vie par défaut |
| `autoCleanup` | `boolean` | `true` | Nettoyage automatique |
| `cleanupInterval` | `number` | `60*1000` | Intervalle de nettoyage |

#### Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `set` | `(key: string, data: T, ttl?: number) => void` | Stocker des données |
| `get` | `(key: string) => T \| null` | Récupérer des données |
| `has` | `(key: string) => boolean` | Vérifier l'existence |
| `delete` | `(key: string) => boolean` | Supprimer une entrée |
| `clear` | `() => void` | Vider le cache |
| `getStats` | `() => CacheStats` | Obtenir les statistiques |

### `globalCache`

Instance globale partagée pour toute l'application.

```typescript
import { globalCache } from '@/lib/adaptive-cache';

// Utilisation directe
globalCache.set('api_data', fetchData());
const data = globalCache.get('api_data');
```

### `useAdaptiveCache<T>`

Hook React pour utiliser le cache dans les composants.

```typescript
import { useAdaptiveCache } from '@/lib/adaptive-cache';

const UserProfile = ({ userId }: { userId: string }) => {
  const { data, isLoading, error, refresh, clearCache } = useAdaptiveCache(
    `user_${userId}`,
    () => fetchUserProfile(userId),
    10 * 60 * 1000 // 10 minutes TTL
  );

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!data) return <div>Aucune donnée</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refresh}>Actualiser</button>
      <button onClick={clearCache}>Vider le cache</button>
    </div>
  );
};
```

---

## 🚀 OPTIMISEUR DE REQUÊTES SUPABASE

### `SupabaseQueryOptimizer`

Optimiseur de requêtes Supabase avec cache automatique.

#### Usage

```typescript
import { queryOptimizer } from '@/lib/supabase-optimizer';

// Créer une requête optimisée
const propertiesQuery = queryOptimizer.createQuery('properties');

// Exécuter avec options
const properties = await propertiesQuery.execute({
  select: 'id, name, city, price',
  filters: { status: 'disponible' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 20,
  cache: true,
  cacheTTL: 5 * 60 * 1000 // 5 minutes
});

// Requête avec pagination
const paginatedProperties = await propertiesQuery.execute({
  range: { from: 0, to: 19 }, // Page 1
  cache: true
});
```

#### Options de requête

| Option | Type | Description |
|--------|------|-------------|
| `cache` | `boolean` | Activer le cache |
| `cacheTTL` | `number` | Durée de vie du cache |
| `cacheKey` | `string` | Clé de cache personnalisée |
| `select` | `string` | Colonnes à sélectionner |
| `orderBy` | `object` | Tri: `{ column: string, ascending?: boolean }` |
| `limit` | `number` | Limite de résultats |
| `range` | `object` | Pagination: `{ from: number, to: number }` |
| `filters` | `object` | Filtres: `{ column: value }` |

### Requêtes par lots

```typescript
// Exécution de plusieurs requêtes en parallèle
const results = await queryOptimizer.batchQuery([
  { 
    table: 'properties', 
    options: { 
      filters: { status: 'disponible' },
      cache: true 
    } 
  },
  { 
    table: 'profiles', 
    options: { 
      limit: 10,
      orderBy: { column: 'created_at', ascending: false }
    } 
  },
  { 
    table: 'applications', 
    options: { 
      select: 'id, status, created_at'
    } 
  }
]);

console.log(results.properties);
console.log(results.profiles);
console.log(results.applications);
```

### Préchauffage de cache

```typescript
// Précharger les données fréquemment utilisées
await queryOptimizer.warmCache([
  { table: 'properties', options: { cache: true } },
  { table: 'profiles', options: { cache: true, limit: 10 } }
]);
```

### Hook optimisé

```typescript
import { useOptimizedQuery } from '@/lib/supabase-optimizer';

const PropertiesList = () => {
  const { data, loading, error, refetch } = useOptimizedQuery(
    'properties',
    {
      select: 'id, name, city, price',
      filters: { status: 'disponible' },
      orderBy: { column: 'created_at', ascending: false },
      cache: true,
      cacheTTL: 5 * 60 * 1000
    },
    [] // Dépendances
  );

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {data?.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
```

---

## 🎛️ COMPOSANTS DE REPORTING

### `ReportMetrics`

Composant pour afficher les métriques de performance.

```typescript
import { ReportMetrics, type Metric } from '@/components/admin/reporting/ReportMetrics';

const metrics: Metric[] = [
  {
    title: 'Utilisateurs Total',
    value: 1250,
    change: 12.5,
    changeType: 'increase',
    icon: <Users className="h-4 w-4 text-muted-foreground" />
  },
  {
    title: 'Propriétés',
    value: 342,
    change: 8.2,
    changeType: 'increase',
    icon: <Home className="h-4 w-4 text-muted-foreground" />
  },
  {
    title: 'Demandes',
    value: 89,
    change: 15.3,
    changeType: 'increase',
    icon: <FileText className="h-4 w-4 text-muted-foreground" />
  },
  {
    title: 'Taux de Conversion',
    value: '24.5%',
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
  }
];

<ReportMetrics metrics={metrics} />;
```

### `Charts`

Composant pour afficher les graphiques de données.

```typescript
import { Charts } from '@/components/admin/reporting/Charts';

const timelineData = [
  { date: '2025-10-01', applications: 12, properties: 8 },
  { date: '2025-10-02', applications: 19, properties: 15 },
  // ...
];

const citiesData = [
  { city: 'Abidjan', count: 156 },
  { city: 'Bouaké', count: 45 },
  // ...
];

const propertyTypes = [
  { name: 'Appartement', count: 234 },
  { name: 'Maison', count: 156 },
  // ...
];

<Charts
  timelineData={timelineData}
  citiesData={citiesData}
  propertyTypes={propertyTypes}
/>;
```

### `DateRangeFilter`

Composant de filtre de dates avec présélections.

```typescript
import { DateRangeFilter } from '@/components/admin/reporting/DateRangeFilter';

<DateRangeFilter
  startDate={startDate}
  endDate={endDate}
  onDateRangeChange={(start, end) => {
    setStartDate(start);
    setEndDate(end);
  }}
  onPresetChange={(preset) => {
    setPeriodPreset(preset);
  }}
  periodPreset="30d"
/>;
```

---

## 📊 MÉTRIQUES DE PERFORMANCE

### Statistiques de cache

```typescript
import { globalCache } from '@/lib/adaptive-cache';

const stats = globalCache.getStats();

console.log({
  hits: stats.hits,           // Nombre de hits
  misses: stats.misses,       // Nombre de misses  
  size: stats.size,           // Taille actuelle du cache
  maxSize: stats.maxSize,     // Taille maximale
  hitRate: stats.hitRate      // Taux de hits (%)
});
```

### Métriques de requêtes

```typescript
import { queryOptimizer } from '@/lib/supabase-optimizer';

const cacheStats = queryOptimizer.getCacheStats();

console.log({
  totalQueries: cacheStats.hits + cacheStats.misses,
  cachedQueries: cacheStats.hits,
  cacheEfficiency: (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100
});
```

---

## 🔧 CONFIGURATION

### Variables d'environnement

```env
# Cache
VITE_CACHE_ENABLED=true
VITE_CACHE_MAX_SIZE=200
VITE_CACHE_DEFAULT_TTL=600000

# Performance
VITE_PERFORMANCE_MONITORING=true
VITE_LAZY_LOADING=true
VITE_BUNDLE_ANALYZER=false

# Supabase
VITE_DB_CACHE_ENABLED=true
VITE_DB_CACHE_TTL=300000
```

### Configuration Vite

Voir `vite.config.ts` pour les optimisations de build configurées.

---

## 📖 GUIDES D'UTILISATION

### Migration vers la pagination intelligente

```typescript
// Avant - Pagination manuelle
const [currentPage, setCurrentPage] = useState(1);
const items = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

// Après - Pagination intelligente
const { currentItems, currentPage, setSearchValue } = useSmartPagination({
  data,
  pageSize: 20,
  searchKeys: ['name', 'description'],
  enableInfiniteScroll: true
});
```

### Utilisation du cache adaptatif

```typescript
// Avant - Pas de cache
const data = await fetchUserProfile(userId);

// Après - Cache adaptatif
const { data, isLoading } = useAdaptiveCache(
  `user_${userId}`,
  () => fetchUserProfile(userId),
  10 * 60 * 1000 // 10 minutes
);
```

---

## 🚀 DÉPLOIEMENT

### Checklist de déploiement

1. ✅ Exécuter les tests de performance
2. ✅ Valider la configuration de cache
3. ✅ Vérifier les headers HTTP
4. ✅ Tester la pagination intelligente
5. ✅ Valider les métriques de performance

### Scripts utiles

```bash
# Tests de performance
npm run test:performance

# Validation des optimisations
./scripts/validate-optimizations.sh

# Build optimisé
npm run build

# Analyse du bundle
npm run analyze
```

---

**📞 Support:** tech@mon-toit.ci  
**📖 Documentation complète:** RAPPORT_FINAL_OPTIMISATIONS.md  
**🧪 Tests:** tests/performance/