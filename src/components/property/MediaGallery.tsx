import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { PanoramaViewer } from "./PanoramaViewer";
import { FloorPlanViewer } from "./FloorPlanViewer";
import { OptimizedImage } from "./OptimizedImage";
import { SwipeGallery } from "./SwipeGallery";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePropertyImageAccess } from "@/hooks/usePropertyImageAccess";
import { Image, Video, Globe, Layout, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  propertyId: string;
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  panoramicImages?: Array<{ url: string; title?: string }>;
  floorPlans?: Array<{ url: string; title: string; floor?: string; surface?: number }>;
}

export const MediaGallery = ({
  propertyId,
  images = [],
  videoUrl,
  virtualTourUrl,
  panoramicImages = [],
  floorPlans = [],
}: MediaGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const isMobile = useIsMobile();

  // Hook pour accès images
  const { 
    maxImages, 
    showBlur, 
    showHDPhotos, 
    show3DTour, 
    showFloorPlans 
  } = usePropertyImageAccess(propertyId);

  // Limiter les images affichées
  const displayImages = images.slice(0, maxImages);
  const hiddenImagesCount = images.length - displayImages.length;

  const hasVideo = !!videoUrl;
  const has360 = panoramicImages.length > 0;
  const hasPlans = floorPlans.length > 0;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="photos" className="gap-2">
            <Image className="h-4 w-4" />
            Photos ({displayImages.length}/{images.length})
          </TabsTrigger>
          {hasVideo && (
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Vidéo
              <Badge variant="secondary" className="ml-1">
                Nouveau
              </Badge>
            </TabsTrigger>
          )}
          {has360 && show3DTour && (
            <TabsTrigger value="360" className="gap-2">
              <Globe className="h-4 w-4" />
              Vue 360°
              <Badge variant="secondary" className="ml-1">
                {panoramicImages.length}
              </Badge>
            </TabsTrigger>
          )}
          {hasPlans && showFloorPlans && (
            <TabsTrigger value="plans" className="gap-2">
              <Layout className="h-4 w-4" />
              Plans
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="photos" className="space-y-4">
          {/* Alert si photos limitées */}
          {!showHDPhotos && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>
                {showBlur ? 'Aperçu limité' : 'Photos HD verrouillées'}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  {showBlur 
                    ? 'Créez un compte pour voir plus de photos et postuler.'
                    : `Validez votre dossier pour accéder aux ${hiddenImagesCount} photos HD restantes, la visite 3D et les plans du bien.`
                  }
                </p>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link to={showBlur ? '/auth' : '/verification'}>
                    <Lock className="mr-2 h-4 w-4" />
                    {showBlur ? 'Créer un compte' : 'Valider mon dossier'}
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isMobile ? (
            /* Mobile: SwipeGallery */
            <SwipeGallery 
              images={displayImages}
              onImageChange={(idx) => setLightboxIndex(idx)}
              className={cn(showBlur && 'blur-sm')}
            />
          ) : (
            /* Desktop: Original layout */
            <>
              {/* Main image */}
              {displayImages.length > 0 && (
                <div
                  className={cn(
                    "relative aspect-video w-full overflow-hidden rounded-lg cursor-pointer group",
                    showBlur && "blur-sm"
                  )}
                  onClick={() => !showBlur && openLightbox(0)}
                >
                  <OptimizedImage
                    src={displayImages[0]}
                    alt="Photo principale"
                    priority={true}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {showBlur && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Lock className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnail grid */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.slice(1, 5).map((image, index) => (
                    <div
                      key={index + 1}
                      className={cn(
                        "relative aspect-video overflow-hidden rounded-md cursor-pointer group",
                        showBlur && "blur-sm"
                      )}
                      onClick={() => !showBlur && openLightbox(index + 1)}
                    >
                      <OptimizedImage
                        src={image}
                        alt={`Photo ${index + 2}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {index === 3 && hiddenImagesCount > 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                          <Lock className="h-6 w-6 mr-2" />
                          +{hiddenImagesCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {hasVideo && (
          <TabsContent value="video">
            <VideoPlayer url={videoUrl} thumbnail={images[0]} />
          </TabsContent>
        )}

        {has360 && (
          <TabsContent value="360">
            <div className="space-y-4">
              {panoramicImages.map((panorama, index) => (
                <div key={index}>
                  {panorama.title && (
                    <h3 className="text-lg font-semibold mb-2">
                      {panorama.title}
                    </h3>
                  )}
                  <PanoramaViewer imageUrl={panorama.url} title={panorama.title} />
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {hasPlans && (
          <TabsContent value="plans">
            <FloorPlanViewer plans={floorPlans} />
          </TabsContent>
        )}
      </Tabs>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images.map((src) => ({ src }))}
        plugins={[Zoom, Fullscreen]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
      />
    </div>
  );
};
