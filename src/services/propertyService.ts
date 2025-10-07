import { supabase } from '@/integrations/supabase/client';
import type { Property, SearchFilters } from '@/types';

/**
 * Parse Supabase/Postgres errors into user-friendly messages
 */
export function parsePropertyError(error: any): string {
  if (!error) return 'Une erreur inconnue est survenue';

  const errorMessage = error?.message || String(error);
  const errorCode = error?.code;

  // Postgres constraint violations
  if (errorCode === '23505') {
    return 'Une propriété similaire existe déjà. Vérifiez vos données.';
  }
  
  if (errorCode === '23503') {
    return 'Référence invalide. Assurez-vous que toutes les informations sont correctes.';
  }

  if (errorCode === '23502') {
    return 'Champs obligatoires manquants. Veuillez remplir tous les champs requis.';
  }

  // RLS policy violations
  if (errorMessage.includes('RLS') || errorMessage.includes('policy')) {
    return 'Permissions insuffisantes. Connectez-vous avec un compte propriétaire.';
  }

  // Geolocation errors
  if (errorMessage.includes('latitude') || errorMessage.includes('longitude')) {
    return 'Erreur de localisation. Veuillez sélectionner un emplacement valide sur la carte.';
  }

  // Network/timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    return 'Problème de connexion. Vérifiez votre connexion internet et réessayez.';
  }

  // Generic validation errors
  if (errorMessage.includes('invalid') || errorMessage.includes('invalide')) {
    return 'Données invalides. Vérifiez que tous les champs sont correctement remplis.';
  }

  // Return original message if no pattern matches
  return errorMessage.length > 100 
    ? 'Erreur lors de la création de la propriété. Veuillez réessayer.' 
    : errorMessage;
}

/**
 * Centralized property service for all property-related database operations
 */
export const propertyService = {
  /**
   * Fetch all properties with optional filters
   * Uses secure RPC to hide owner_id from public queries
   */
  async fetchAll(filters?: SearchFilters): Promise<Property[]> {
    // SECURITY: Use RPC for public property browsing (hides owner_id)
    // For ANSUT certified properties, still use direct query with join
    if (filters?.isAnsutCertified) {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          leases!inner(certification_status)
        `)
        .eq('leases.certification_status', 'certified')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching certified properties:', error);
        throw error;
      }
      
      // Remove duplicates if multiple certified leases for the same property
      const uniqueProperties = data.reduce((acc, current) => {
        const exists = acc.find(item => item.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, [] as any[]);

      return uniqueProperties as Property[];
    }

    // Use secure RPC for public browsing
    const { data, error } = await supabase.rpc('get_public_properties', {
      p_city: filters?.city || null,
      p_property_type: filters?.propertyType?.[0] || null,
      p_min_rent: filters?.minPrice || null,
      p_max_rent: filters?.maxPrice || null,
      p_min_bedrooms: filters?.minBedrooms || null,
      p_status: null, // Show all statuses in search
    });

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    // Apply client-side filters not supported by RPC
    let results = data || [];
    
    if (filters?.propertyType && filters.propertyType.length > 1) {
      results = results.filter(p => filters.propertyType?.includes(p.property_type));
    }
    if (filters?.minBathrooms) {
      results = results.filter(p => p.bathrooms >= filters.minBathrooms!);
    }
    if (filters?.minSurface) {
      results = results.filter(p => p.surface_area && p.surface_area >= filters.minSurface!);
    }
    if (filters?.isFurnished !== undefined) {
      results = results.filter(p => p.is_furnished === filters.isFurnished);
    }
    if (filters?.hasParking !== undefined) {
      results = results.filter(p => p.has_parking === filters.hasParking);
    }
    if (filters?.hasGarden !== undefined) {
      results = results.filter(p => p.has_garden === filters.hasGarden);
    }
    if (filters?.hasAc !== undefined) {
      results = results.filter(p => p.has_ac === filters.hasAc);
    }

    // Note: owner_id is intentionally excluded by RPC for security
    return results as unknown as Property[];
  },

  /**
   * Fetch a single property by ID
   * First tries secure RPC (public access), then falls back to direct query (for owners)
   */
  async fetchById(id: string): Promise<Property | null> {
    // SECURITY: Try public RPC first (hides owner_id)
    const { data: publicData, error: publicError } = await supabase.rpc('get_public_property', {
      p_property_id: id
    });

    if (!publicError && publicData && publicData.length > 0) {
      // Note: owner_id is intentionally excluded by RPC for security
      return publicData[0] as unknown as Property;
    }

    // If RPC fails (not public or user is owner/admin), try direct query
    // RLS will allow access if user is owner or admin
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching property:', error);
      throw error;
    }

    return data;
  },

  /**
   * Fetch properties by owner ID
   */
  async fetchByOwner(ownerId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching owner properties:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Update a property
   */
  async update(id: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      const userMessage = parsePropertyError(error);
      throw new Error(userMessage);
    }

    return data;
  },

  /**
   * Delete a property
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      const userMessage = parsePropertyError(error);
      throw new Error(userMessage);
    }
  },

  /**
   * Increment view count for a property
   */
  async incrementViewCount(id: string): Promise<void> {
    // Manually increment view count
    const { data: property } = await supabase
      .from('properties')
      .select('view_count')
      .eq('id', id)
      .single();

    if (property) {
      const { error } = await supabase
        .from('properties')
        .update({ view_count: (property.view_count || 0) + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing view count:', error);
        throw error;
      }
    }
  },

  /**
   * Get property statistics
   */
  async getStats(propertyId: string) {
    const [favoritesResult, applicationsResult, propertyResult] = await Promise.all([
      supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId),
      supabase
        .from('rental_applications')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId),
      supabase
        .from('properties')
        .select('view_count')
        .eq('id', propertyId)
        .single(),
    ]);

    const views = propertyResult.data?.view_count || 0;
    const applications = applicationsResult.count || 0;

    return {
      views,
      favorites: favoritesResult.count || 0,
      applications,
      conversionRate: views > 0 ? Math.round((applications / views) * 100) : 0,
    };
  },

  /**
   * Search properties with geo-location filtering
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    filters?: SearchFilters
  ): Promise<Property[]> {
    // First fetch all properties with filters
    const properties = await this.fetchAll(filters);

    // Filter by distance (using Haversine formula in geo.ts)
    const { calculateDistance } = await import('@/lib/geo');

    return properties.filter((property) => {
      if (!property.latitude || !property.longitude) return false;

      const distance = calculateDistance(
        latitude,
        longitude,
        property.latitude,
        property.longitude
      );

      return distance <= radiusKm;
    });
  },
};
