import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Share, Download, ZoomIn, ZoomOut } from "lucide-react";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
}

export function ImageViewer({ open, onOpenChange, images, initialIndex = 0 }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const handlePrev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const handleNext = () => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  if (!images.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black/95 border-0 rounded-none [&>button]:hidden">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center w-full h-full" onClick={() => onOpenChange(false)}>
          <img
            src={images[currentIndex]}
            alt=""
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10" onClick={handlePrev}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10" onClick={handleNext}>
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
