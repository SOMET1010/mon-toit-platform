import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { useMediaUpload, type MediaFiles } from '@/hooks/useMediaUpload';
import { usePropertyPermissions } from '@/hooks/usePropertyPermissions';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MediaUploader } from '@/components/property/MediaUploader';
import { type PropertyFormData } from '@/components/property/form/PropertyFormSchema';
import { PropertyBasicInfo } from '@/components/property/form/PropertyBasicInfo';
import { PropertyLocation } from '@/components/property/form/PropertyLocation';
import { PropertyCharacteristicsForm } from '@/components/property/form/PropertyCharacteristicsForm';
import { PropertyPricing } from '@/components/property/form/PropertyPricing';
import { PropertyWorkStatus } from '@/components/property/form/PropertyWorkStatus';
import { LocationPicker } from '@/components/property/LocationPicker';

const AddProperty = () => {
  const navigate = useNavigate();
  const { requireOwnerAccess } = usePropertyPermissions();
  const { form, submitting, submitProperty } = usePropertyForm();
  const { uploading, progress, uploadMedia, validateMediaFiles } = useMediaUpload();
  
  const [mediaFiles, setMediaFiles] = useState<MediaFiles>({
    images: [],
    video: null,
    panoramas: [],
    floorPlans: [],
    virtualTourUrl: '',
  });

  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

  const onSubmit = async (data: PropertyFormData) => {
    // Validate media files
    const validation = validateMediaFiles(mediaFiles);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }

    try {
      // 1. Create property first (without media URLs)
      const propertyId = await submitProperty(data, {
        images: [],
        mainImage: null,
        videoUrl: null,
        panoramas: [],
        floorPlans: [],
      });

      // 2. Upload all media
      const mediaUrls = await uploadMedia(propertyId, mediaFiles);

      // 3. Update property with media URLs
      await submitProperty(data, mediaUrls, propertyId);

      navigate('/mes-biens');
    } catch (error) {
      // Errors are already handled by the hooks
    }
  };

  const accessCheck = requireOwnerAccess();
  if (!accessCheck.hasAccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                {accessCheck.error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </CardContent>
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
              
              <LocationPicker 
                city={form.watch("city")}
                onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
              />

              <PropertyCharacteristicsForm form={form} />
              <PropertyPricing form={form} />
              <PropertyWorkStatus form={form} />

              {/* Multimedia */}
              <Card>
                <CardHeader>
                  <CardTitle>Médias</CardTitle>
                  <CardDescription>Ajoutez des photos, vidéos, vues 360° et plans</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MediaUploader
                    onImagesChange={(files) => setMediaFiles(prev => ({ ...prev, images: files }))}
                    onVideoChange={(file) => setMediaFiles(prev => ({ ...prev, video: file }))}
                    onPanoramaChange={(files) => setMediaFiles(prev => ({ ...prev, panoramas: files }))}
                    onFloorPlanChange={(files) => setMediaFiles(prev => ({ ...prev, floorPlans: files }))}
                    onVirtualTourUrlChange={(url) => setMediaFiles(prev => ({ ...prev, virtualTourUrl: url }))}
                    uploading={uploading}
                  />
                  
                  {uploading && progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Téléchargement des médias...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/mes-biens')}
                  disabled={submitting || uploading}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting || uploading} className="flex-1">
                  {submitting || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publication en cours...
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
