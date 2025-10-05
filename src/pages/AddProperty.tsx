import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { MediaUploader } from '@/components/property/MediaUploader';
import { VALIDATION_LIMITS, PROPERTY_LIMITS, ERROR_MESSAGES, PROPERTY_TYPES } from '@/constants';

const propertySchema = z.object({
  title: z.string()
    .trim()
    .min(VALIDATION_LIMITS.MIN_TITLE_LENGTH, `Le titre doit contenir au moins ${VALIDATION_LIMITS.MIN_TITLE_LENGTH} caractères`)
    .max(VALIDATION_LIMITS.MAX_TITLE_LENGTH, `Le titre ne peut pas dépasser ${VALIDATION_LIMITS.MAX_TITLE_LENGTH} caractères`),
  description: z.string()
    .trim()
    .max(VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH, `La description ne peut pas dépasser ${VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH} caractères`)
    .optional(),
  property_type: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  address: z.string()
    .trim()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  city: z.string()
    .trim()
    .min(VALIDATION_LIMITS.MIN_NAME_LENGTH, `La ville doit contenir au moins ${VALIDATION_LIMITS.MIN_NAME_LENGTH} caractères`)
    .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, `La ville ne peut pas dépasser ${VALIDATION_LIMITS.MAX_NAME_LENGTH} caractères`),
  neighborhood: z.string()
    .trim()
    .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, `Le quartier ne peut pas dépasser ${VALIDATION_LIMITS.MAX_NAME_LENGTH} caractères`)
    .optional(),
  monthly_rent: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= PROPERTY_LIMITS.MIN_RENT && num <= PROPERTY_LIMITS.MAX_RENT;
    },
    `Le loyer doit être entre ${PROPERTY_LIMITS.MIN_RENT.toLocaleString()} et ${PROPERTY_LIMITS.MAX_RENT.toLocaleString()} FCFA`
  ),
  deposit_amount: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
    'La caution doit être positive'
  ).optional(),
  charges_amount: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
    'Les charges doivent être positives'
  ).optional(),
  bedrooms: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= PROPERTY_LIMITS.MIN_BEDROOMS && num <= PROPERTY_LIMITS.MAX_BEDROOMS;
    },
    `Nombre de chambres invalide (${PROPERTY_LIMITS.MIN_BEDROOMS}-${PROPERTY_LIMITS.MAX_BEDROOMS})`
  ),
  bathrooms: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= PROPERTY_LIMITS.MIN_BATHROOMS && num <= PROPERTY_LIMITS.MAX_BATHROOMS;
    },
    `Nombre de salles de bain invalide (${PROPERTY_LIMITS.MIN_BATHROOMS}-${PROPERTY_LIMITS.MAX_BATHROOMS})`
  ),
  surface_area: z.string().refine(
    (val) => {
      if (!val) return true;
      const num = Number(val);
      return !isNaN(num) && num >= PROPERTY_LIMITS.MIN_SURFACE && num <= PROPERTY_LIMITS.MAX_SURFACE;
    },
    `Surface invalide (${PROPERTY_LIMITS.MIN_SURFACE}-${PROPERTY_LIMITS.MAX_SURFACE}m²)`
  ).optional(),
  floor_number: z.string().refine(
    (val) => val === '' || !isNaN(Number(val)),
    'L\'étage doit être un nombre'
  ).optional(),
  is_furnished: z.boolean().default(false),
  has_ac: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  has_garden: z.boolean().default(false),
});

type PropertyFormData = z.infer<typeof propertySchema>;

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
      monthly_rent: '',
      deposit_amount: '',
      charges_amount: '',
      bedrooms: '0',
      bathrooms: '0',
      surface_area: '',
      floor_number: '',
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
          monthly_rent: Number(data.monthly_rent),
          deposit_amount: data.deposit_amount ? Number(data.deposit_amount) : null,
          charges_amount: data.charges_amount ? Number(data.charges_amount) : null,
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          surface_area: data.surface_area ? Number(data.surface_area) : null,
          floor_number: data.floor_number ? Number(data.floor_number) : null,
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
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Bel appartement F3 au cœur de Cocody" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez votre bien en détail..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de bien *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type.toLowerCase()} value={type.toLowerCase()}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rue principale" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville *</FormLabel>
                          <FormControl>
                            <Input placeholder="Abidjan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quartier</FormLabel>
                          <FormControl>
                            <Input placeholder="Cocody" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Caractéristiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chambres *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salles de bain *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="surface_area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface (m²)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floor_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Étage</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="is_furnished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Meublé</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_ac"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Climatisation</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_parking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Parking</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_garden"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Jardin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tarifs */}
              <Card>
                <CardHeader>
                  <CardTitle>Tarifs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="monthly_rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loyer mensuel (FCFA) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="150000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deposit_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caution (FCFA)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="300000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="charges_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charges (FCFA)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="25000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

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