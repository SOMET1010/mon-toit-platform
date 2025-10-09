import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "./VideoPlayer";
import { PanoramaViewer } from "./PanoramaViewer";
import { FloorPlanViewer } from "./FloorPlanViewer";
import { ProgressiveImage } from "./ProgressiveImage";
import { Image, Video, Globe, Layout } from "lucide-react";

interface MediaGalleryProps {
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  panoramicImages?: Array<{ url: string; title?: string }>;
  floorPlans?: Array<{ url: string; title: string; floor?: string; surface?: number }>;
}

export const MediaGallery = ({
  images = [],
  videoUrl,
  virtualTourUrl,
  panoramicImages = [],
  floorPlans = [],
}: MediaGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
            Photos ({images.length})
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
          {has360 && (
            <TabsTrigger value="360" className="gap-2">
              <Globe className="h-4 w-4" />
              Vue 360°
              <Badge variant="secondary" className="ml-1">
                {panoramicImages.length}
              </Badge>
            </TabsTrigger>
          )}
          {hasPlans && (
            <TabsTrigger value="plans" className="gap-2">
              <Layout className="h-4 w-4" />
              Plans
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="photos" className="space-y-4">
          {/* Main image */}
          {images.length > 0 && (
            <div
              className="relative aspect-video w-full overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <ProgressiveImage
                src={images[0]}
                alt="Photo principale"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          )}

          {/* Thumbnail grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((image, index) => (
                <div
                  key={index + 1}
                  className="relative aspect-video overflow-hidden rounded-md cursor-pointer group"
                  onClick={() => openLightbox(index + 1)}
                >
                  <ProgressiveImage
                    src={image}
                    alt={`Photo ${index + 2}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {index === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                      +{images.length - 5} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
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
