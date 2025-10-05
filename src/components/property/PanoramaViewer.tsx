import { Pannellum } from "pannellum-react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PanoramaViewerProps {
  imageUrl: string;
  title?: string;
}

export const PanoramaViewer = ({ imageUrl, title }: PanoramaViewerProps) => {
  return (
    <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
      <Pannellum
        width="100%"
        height="100%"
        image={imageUrl}
        pitch={0}
        yaw={0}
        hfov={110}
        autoLoad
        showZoomCtrl={true}
        mouseZoom={true}
        showFullscreenCtrl={true}
        compass={true}
        title={title}
      >
        <Pannellum.Hotspot
          type="info"
          pitch={0}
          yaw={0}
          text="Vue panoramique 360°"
        />
      </Pannellum>
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
        <Maximize2 className="inline-block h-4 w-4 mr-1" />
        Utilisez votre souris pour naviguer
      </div>
    </div>
  );
};
