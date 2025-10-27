import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
  onToggleHeatmap: () => void;
  showHeatmap: boolean;
  propertiesCount: number;
}

export function SearchFilters({
  onFilterChange,
  onToggleHeatmap,
  showHeatmap,
  propertiesCount,
}: SearchFiltersProps) {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [type, setType] = useState('');
  const [rooms, setRooms] = useState('');
  const [city, setCity] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      priceMin: priceMin ? parseInt(priceMin) : undefined,
      priceMax: priceMax ? parseInt(priceMax) : undefined,
      type: type || undefined,
      rooms: rooms ? parseInt(rooms) : undefined,
      city: city || undefined,
    });
  };

  const handleResetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setType('');
    setRooms('');
    setCity('');
    onFilterChange({});
  };

  return (
    <>
      {/* Mobile: Bouton flottant */}
      <div className="md:hidden fixed top-20 left-4 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="shadow-xl"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filtres ({propertiesCount})
        </Button>
      </div>

      {/* Filtres */}
      <Card
        className={`
          ${isOpen ? 'block' : 'hidden'} md:block
          fixed md:absolute top-32 md:top-4 left-4 z-40
          w-[calc(100%-2rem)] md:w-80
          shadow-2xl
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {propertiesCount} biens
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prix */}
          <div className="space-y-2">
            <Label>Prix (FCFA/mois)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type de bien</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="appartement">Appartement</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="duplex">Duplex</SelectItem>
                <SelectItem value="bureau">Bureau</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chambres */}
          <div className="space-y-2">
            <Label>Nombre de pièces minimum</Label>
            <Select value={rooms} onValueChange={setRooms}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ville */}
          <div className="space-y-2">
            <Label>Ville / Quartier</Label>
            <Input
              type="text"
              placeholder="Ex: Cocody, Plateau..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Heatmap Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Label htmlFor="heatmap" className="text-sm">
              Afficher zones de prix
            </Label>
            <Switch
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={onToggleHeatmap}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Appliquer
            </Button>
            <Button onClick={handleResetFilters} variant="outline">
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

