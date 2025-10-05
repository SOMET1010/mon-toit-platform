import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
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

const propertySchema = z.object({
  title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().trim().max(2000, 'La description ne peut pas dépasser 2000 caractères').optional(),
  property_type: z.string().min(1, 'Veuillez sélectionner un type de bien'),
  address: z.string().trim().min(5, 'L\'adresse doit contenir au moins 5 caractères').max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  city: z.string().trim().min(2, 'La ville doit contenir au moins 2 caractères').max(100, 'La ville ne peut pas dépasser 100 caractères'),
  neighborhood: z.string().trim().max(100, 'Le quartier ne peut pas dépasser 100 caractères').optional(),
  monthly_rent: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Le loyer doit être supérieur à 0'),
  deposit_amount: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), 'La caution doit être positive').optional(),
  charges_amount: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), 'Les charges doivent être positives').optional(),
  bedrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Le nombre de chambres doit être positif'),
  bathrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Le nombre de salles de bain doit être positif'),
  surface_area: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0), 'La surface doit être positive').optional(),
  floor_number: z.string().refine((val) => val === '' || !isNaN(Number(val)), 'L\'étage doit être un nombre').optional(),
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
          console.log('Geocoded coordinates:', { latitude, longitude });
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
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
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du bien',
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
                            <SelectItem value="appartement">Appartement</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="maison">Maison</SelectItem>
                            <SelectItem value="bureau">Bureau</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
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