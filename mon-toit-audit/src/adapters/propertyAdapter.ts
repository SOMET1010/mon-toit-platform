/**
 * Property Adapter
 * 
 * Maps database property structure to application Property type
 */

import type { Property } from '@/types';

interface DBProperty {
  id: string;
  title: string;
  description: string | null;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  location: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  amenities: string[] | null;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export function adaptPropertyFromDB(dbProperty: any): Property {
  const amenities = dbProperty.amenities || [];
  const has_ac = amenities.includes('climatisation') || amenities.includes('ac');
  const has_parking = amenities.includes('parking') || amenities.includes('garage');
  const has_garden = amenities.includes('jardin') || amenities.includes('garden');
  const is_furnished = amenities.includes('meublé') || amenities.includes('furnished');

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    property_type: dbProperty.type,
    monthly_rent: dbProperty.price,
    surface_area: dbProperty.surface,
    neighborhood: dbProperty.location,
    address: dbProperty.location || '',
    city: dbProperty.city,
    latitude: dbProperty.latitude,
    longitude: dbProperty.longitude,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    floor_number: null,
    is_furnished,
    has_ac,
    has_parking,
    has_garden,
    deposit_amount: dbProperty.price * 2,
    charges_amount: null,
    main_image: dbProperty.images?.[0] || null,
    images: dbProperty.images || [],
    video_url: null,
    virtual_tour_url: null,
    panoramic_images: null,
    floor_plans: null,
    media_metadata: null,
    status: dbProperty.status,
    view_count: 0,
    owner_id: dbProperty.owner_id,
    created_at: dbProperty.created_at,
    updated_at: dbProperty.updated_at,
    work_status: null,
    work_description: null,
    work_images: null,
    work_estimated_cost: null,
    work_estimated_duration: null,
    work_start_date: null,
    title_deed_url: null,
  };
}

export function adaptPropertiesFromDB(dbProperties: any[]): Property[] {
  return dbProperties.map(adaptPropertyFromDB);
}
