import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { propertySchema, type PropertyFormData } from '@/components/property/form/PropertyFormSchema';
import { usePropertyPermissions } from './usePropertyPermissions';
import type { MediaUrls } from './useMediaUpload';

/**
 * Hook for managing property form state and submission
 * Handles both creation and update of properties
 */
export const usePropertyForm = (propertyId?: string) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = usePropertyPermissions();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: '',
      address: '',
      city: '',
      neighborhood: '',
      bedrooms: 0,
      bathrooms: 0,
      surface_area: 0,
      floor_number: 0,
      is_furnished: false,
      has_ac: false,
      has_parking: false,
      has_garden: false,
      monthly_rent: 0,
      deposit_amount: 0,
      charges_amount: 0,
    },
  });

  /**
   * Load existing property data (for edit mode)
   */
  const loadProperty = async (): Promise<void> => {
    if (!propertyId) return;

    setLoading(true);
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        logger.error('Failed to load property', { error, propertyId });
        toast({
          title: "Erreur",
          description: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
          variant: "destructive",
        });
        navigate('/mes-biens');
        return;
      }

      // Populate form with existing data
      form.reset({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        address: property.address,
        city: property.city,
        neighborhood: property.neighborhood || '',
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        surface_area: property.surface_area || 50,
        floor_number: property.floor_number || 0,
        is_furnished: property.is_furnished || false,
        has_ac: property.has_ac || false,
        has_parking: property.has_parking || false,
        has_garden: property.has_garden || false,
        monthly_rent: property.monthly_rent,
        deposit_amount: property.deposit_amount || 0,
        charges_amount: property.charges_amount || 0,
      });

      logger.info('Property loaded successfully', { propertyId });
    } catch (error) {
      logger.error('Load property error', { error, propertyId });
      toast({
        title: "Erreur",
        description: ERROR_MESSAGES.SERVER_ERROR,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Geocode address to get coordinates
   */
  const geocodeAddress = async (
    address: string,
    city: string
  ): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address, city },
      });

      if (error || !data) {
        logger.error('Geocoding failed', { error, address, city });
        toast({
          title: "Avertissement",
          description: ERROR_MESSAGES.GEOCODING_FAILED,
        });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Geocode error', { error, address, city });
      return null;
    }
  };

  /**
   * Submit property (create or update)
   */
  const submitProperty = async (
    data: PropertyFormData,
    mediaUrls: MediaUrls
  ): Promise<string> => {
    if (!user || !profile) {
      toast({
        title: "Erreur",
        description: ERROR_MESSAGES.AUTH_REQUIRED,
        variant: "destructive",
      });
      throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    setSubmitting(true);

    try {
      // Geocode the address
      const coords = await geocodeAddress(data.address, data.city);

      const propertyData: any = {
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood || null,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        surface_area: data.surface_area,
        floor_number: data.floor_number,
        is_furnished: data.is_furnished,
        has_ac: data.has_ac,
        has_parking: data.has_parking,
        has_garden: data.has_garden,
        monthly_rent: data.monthly_rent,
        deposit_amount: data.deposit_amount,
        charges_amount: data.charges_amount,
        owner_id: user.id,
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        images: mediaUrls.images,
        main_image: mediaUrls.mainImage,
        video_url: mediaUrls.videoUrl,
        panoramic_images: mediaUrls.panoramas,
        floor_plans: mediaUrls.floorPlans,
      };

      if (propertyId) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', propertyId);

        if (error) {
          logger.error('Failed to update property', { error, propertyId });
          throw error;
        }

        toast({
          title: "Succès",
          description: SUCCESS_MESSAGES.PROPERTY_UPDATED,
        });

        return propertyId;
      } else {
        // Create new property
        const { data: newProperty, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select('id')
          .single();

        if (error || !newProperty) {
          logger.error('Failed to create property', { error });
          throw error;
        }

        toast({
          title: "Succès",
          description: SUCCESS_MESSAGES.PROPERTY_CREATED,
        });

        return newProperty.id;
      }
    } catch (error) {
      logger.error('Submit property error', { error, propertyId });
      toast({
        title: "Erreur",
        description: ERROR_MESSAGES.SERVER_ERROR,
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Load property data on mount if in edit mode
  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  return {
    form,
    loading,
    submitting,
    loadProperty,
    submitProperty,
  };
};
