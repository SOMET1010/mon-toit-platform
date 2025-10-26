import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShieldCheck, Home, TrendingUp, Users } from 'lucide-react';
import { ILLUSTRATIONS } from '@/lib/illustrations';

const CITIES = [
  'Abidjan',
  'Cocody',
  'Plateau',
  'Marcory',
  'Yopougon',
  'Abobo',
  'Adjamé',
  'Koumassi',
  'Port-Bouët',
  'Treichville'
];

const PROPERTY_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'studio', label: 'Studio' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'commerce', label: 'Local commercial' }
];

export function HeroSection() {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (propertyType !== 'all') params.append('type', propertyType);
    if (maxBudget) params.append('maxPrice', maxBudget);
    
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Image de fond avec overlay gradient */}
      <div className="absolute inset-0">
        <img
          src={ILLUSTRATIONS.realistic.heroFamilyReal}
          alt="Famille heureuse devant leur nouvelle maison à Abidjan"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {/* Gradient overlay ivoirien */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-secondary/85 to-[hsl(var(--lagune))]/90"></div>
        
        {/* Pattern ivoirien subtil */}
        <div className="absolute inset-0 bg-pattern-ivoirien opacity-5"></div>
      </div>

      {/* Contenu */}
      <div className="container relative z-10 px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge certification */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
            <img 
              src="/certification_badge.png" 
              alt="ANSUT" 
              className="h-6 w-6 brightness-0 invert"
            />
            <span className="text-sm font-medium">
              Plateforme Certifiée ANSUT
            </span>
          </div>

          {/* Titre principal */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Trouvez votre{' '}
              <span className="text-accent">Toit Idéal</span>
              <br />
              en Côte d'Ivoire
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              La première plateforme immobilière certifiée par l'État ivoirien. 
              Sécurisée, transparente et 100% gratuite pour les locataires.
            </p>
          </div>

          {/* Formulaire de recherche */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Recherche rapide
              </h2>
              <span className="ml-auto text-sm text-muted-foreground">
                Simple et efficace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Ville */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Home className="h-4 w-4 text-primary" />
                  Ville
                </label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type de bien */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Type de bien
                </label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget max */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  <span className="text-accent">₣</span>
                  Budget max
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 200000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="border-2"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSearch}
                className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold shadow-lg"
              >
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
              <Link to="/publier" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 text-base font-semibold"
                >
                  Publier une annonce
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-1 mt-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>100% gratuit • Sécurisé • Certifié ANSUT</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                2,500+
              </div>
              <div className="text-sm text-white/80">Biens disponibles</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                1,200+
              </div>
              <div className="text-sm text-white/80">Propriétaires</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                98%
              </div>
              <div className="text-sm text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

