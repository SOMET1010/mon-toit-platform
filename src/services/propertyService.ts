import { supabase } from '@/integrations/supabase/client';
import type { Property, SearchFilters } from '@/types';

/**
 * Centralized property service for all property-related database operations
 */
export const propertyService = {
  /**
   * Fetch all properties with optional filters
   */
  async fetchAll(filters?: SearchFilters): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters?.minPrice) {
      query = query.gte('monthly_rent', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('monthly_rent', filters.maxPrice);
    }
    if (filters?.minBedrooms) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }
    if (filters?.minBathrooms) {
      query = query.gte('bathrooms', filters.minBathrooms);
    }
    if (filters?.minSurface) {
      query = query.gte('surface_area', filters.minSurface);
    }
    if (filters?.isFurnished !== undefined) {
      query = query.eq('is_furnished', filters.isFurnished);
    }
    if (filters?.hasParking !== undefined) {
      query = query.eq('has_parking', filters.hasParking);
    }
    if (filters?.hasGarden !== undefined) {
      query = query.eq('has_garden', filters.hasGarden);
    }
    if (filters?.hasAc !== undefined) {
      query = query.eq('has_ac', filters.hasAc);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetch a single property by ID
   */
  async fetchById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

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
      throw error;
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
      throw error;
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

    return {
      view_count: propertyResult.data?.view_count || 0,
      favorites_count: favoritesResult.count || 0,
      applications_count: applicationsResult.count || 0,
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
