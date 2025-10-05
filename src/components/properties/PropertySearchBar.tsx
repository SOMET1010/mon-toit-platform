import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PropertySearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const PropertySearchBar = ({ searchQuery, onSearchChange, sortBy, onSortChange }: PropertySearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un bien..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_desc">Plus récent</SelectItem>
          <SelectItem value="created_asc">Plus ancien</SelectItem>
          <SelectItem value="price_desc">Prix décroissant</SelectItem>
          <SelectItem value="price_asc">Prix croissant</SelectItem>
          <SelectItem value="views_desc">Plus de vues</SelectItem>
          <SelectItem value="views_asc">Moins de vues</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertySearchBar;
