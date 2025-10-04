import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      // Check if favorites table exists, if not we'll use localStorage
      const { data, error } = await supabase
        .from('user_favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) {
        // Fallback to localStorage if table doesn't exist
        const localFavorites = localStorage.getItem(`favorites_${user.id}`);
        setFavorites(localFavorites ? JSON.parse(localFavorites) : []);
      } else {
        setFavorites(data.map(f => f.property_id));
      }
    } catch (err) {
      const localFavorites = localStorage.getItem(`favorites_${user.id}`);
      setFavorites(localFavorites ? JSON.parse(localFavorites) : []);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.includes(propertyId);

    try {
      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw error;

        setFavorites(favorites.filter(id => id !== propertyId));
        toast({
          title: "Favori retiré",
          description: "Le bien a été retiré de vos favoris"
        });
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, property_id: propertyId });

        if (error) throw error;

        setFavorites([...favorites, propertyId]);
        toast({
          title: "Favori ajouté",
          description: "Le bien a été ajouté à vos favoris"
        });
      }

      // Update localStorage as backup
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(
        isFavorite ? favorites.filter(id => id !== propertyId) : [...favorites, propertyId]
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos favoris",
        variant: "destructive"
      });
    }
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};
