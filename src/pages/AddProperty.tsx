import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MediaUploader } from '@/components/property/MediaUploader';
import { propertySchema, PropertyFormData } from '@/components/property/form/PropertyFormSchema';
import { PropertyBasicInfo } from '@/components/property/form/PropertyBasicInfo';
import { PropertyLocation } from '@/components/property/form/PropertyLocation';
import { PropertyCharacteristicsForm } from '@/components/property/form/PropertyCharacteristicsForm';
import { PropertyPricing } from '@/components/property/form/PropertyPricing';

const AddProperty = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState({
    images: [] as File[],
    video: null as File | null,
    panoramas: [] as File[],
    floorPlans: [] as File[],
    virtualTourUrl: ''
  });

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: '',
      address: '',
      city: '',
      neighborhood: '',
      monthly_rent: 0,
      deposit_amount: 0,
      charges_amount: 0,
      bedrooms: 0,
      bathrooms: 0,
      surface_area: 0,
      floor_number: 0,
      is_furnished: false,
      has_ac: false,
      has_parking: false,
      has_garden: false,
    },
  });

  const uploadAllMedia = async (propertyId: string) => {
    const uploadedData: {
      images: string[];
      videoUrl: string | null;
      panoramas: { url: string; title: string }[];
      floorPlans: { url: string; title: string }[];
    } = {
      images: [],
      videoUrl: null,
      panoramas: [],
      floorPlans: []
    };

    // Upload images
    for (const file of mediaFiles.images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Math.random()}.${fileExt}`;
      const { error, data } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);
      uploadedData.images.push(publicUrl);
    }

    // Upload video
    if (mediaFiles.video) {
      const fileExt = mediaFiles.video.name.split('.').pop();
      const fileName = `${propertyId}/${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('property-videos')
        .upload(fileName, mediaFiles.video);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('property-videos')
        .getPublicUrl(fileName);
      uploadedData.videoUrl = publicUrl;
    }

    // Upload panoramas
    for (const file of mediaFiles.panoramas) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('property-360')
        .upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('property-360')
        .getPublicUrl(fileName);
      uploadedData.panoramas.push({ url: publicUrl, title: file.name });
    }

    // Upload floor plans
    for (const file of mediaFiles.floorPlans) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('property-plans')
        .upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('property-plans')
        .getPublicUrl(fileName);
      uploadedData.floorPlans.push({ url: publicUrl, title: file.name });
    }

    return uploadedData;
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!profile) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté',
        variant: 'destructive',
      });
      return;
    }

    if (profile.user_type !== 'proprietaire' && profile.user_type !== 'agence') {
      toast({
        title: 'Accès refusé',
        description: 'Seuls les propriétaires et agences peuvent ajouter des biens',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Geocode the address
      let latitude = null;
      let longitude = null;
      
      try {
        const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-address', {
          body: { 
            address: data.address,
            city: data.city 
          }
        });

        if (!geocodeError && geocodeData) {
          latitude = geocodeData.latitude;
          longitude = geocodeData.longitude;
          logger.info('Geocoded coordinates', { latitude, longitude, address: data.address, city: data.city });
        }
      } catch (geocodeError) {
        logger.error('Geocoding error', { error: geocodeError, address: data.address, city: data.city });
        // Continue without coordinates
      }

      // Créer le bien
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          owner_id: profile.id,
          title: data.title,
          description: data.description || null,
          property_type: data.property_type,
          address: data.address,
          city: data.city,
          neighborhood: data.neighborhood || null,
          monthly_rent: data.monthly_rent,
          deposit_amount: data.deposit_amount || null,
          charges_amount: data.charges_amount || null,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          surface_area: data.surface_area || null,
          floor_number: data.floor_number || null,
          is_furnished: data.is_furnished,
          has_ac: data.has_ac,
          has_parking: data.has_parking,
          has_garden: data.has_garden,
          status: 'disponible',
          latitude,
          longitude,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload all media
      const uploadedMedia = await uploadAllMedia(property.id);
      
      await supabase
        .from('properties')
        .update({
          main_image: uploadedMedia.images[0] || null,
          images: uploadedMedia.images,
          video_url: uploadedMedia.videoUrl,
          virtual_tour_url: mediaFiles.virtualTourUrl || null,
          panoramic_images: uploadedMedia.panoramas,
          floor_plans: uploadedMedia.floorPlans,
        })
        .eq('id', property.id);

      toast({
        title: 'Bien créé avec succès',
        description: 'Votre bien a été ajouté à la plateforme',
      });

      navigate('/mes-biens');
    } catch (error) {
      logger.error('Error creating property', { error, userId: profile?.id, propertyData: data });
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du bien',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (!profile || (profile.user_type !== 'proprietaire' && profile.user_type !== 'agence')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                Seuls les propriétaires et agences peuvent ajouter des biens
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Ajouter un bien</h1>
            <p className="text-muted-foreground mt-2">
              Remplissez les informations de votre propriété
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <PropertyBasicInfo form={form} />
              <PropertyLocation form={form} />
              <PropertyCharacteristicsForm form={form} />
              <PropertyPricing form={form} />

              {/* Multimedia */}
              <Card>
                <CardHeader>
                  <CardTitle>Médias</CardTitle>
                  <CardDescription>Ajoutez des photos, vidéos, vues 360° et plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <MediaUploader
                    onImagesChange={(files) => setMediaFiles(prev => ({ ...prev, images: files }))}
                    onVideoChange={(file) => setMediaFiles(prev => ({ ...prev, video: file }))}
                    onPanoramaChange={(files) => setMediaFiles(prev => ({ ...prev, panoramas: files }))}
                    onFloorPlanChange={(files) => setMediaFiles(prev => ({ ...prev, floorPlans: files }))}
                    onVirtualTourUrlChange={(url) => setMediaFiles(prev => ({ ...prev, virtualTourUrl: url }))}
                    uploading={uploading}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/mes-biens')}
                  disabled={uploading}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Publier le bien'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProperty;
