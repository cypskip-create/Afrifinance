import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Share, Download } from "lucide-react";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
}

export function ImageViewer({ open, onOpenChange, images, initialIndex = 0 }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [dragY, setDragY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const startY = useRef(0);
  const startX = useRef(0);
  const startDist = useRef(0);

  const handlePrev = () => { setZoom(1); setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1)); };
  const handleNext = () => { setZoom(1); setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0)); };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      startDist.current = Math.hypot(dx, dy);
      return;
    }
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && startDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      setZoom(Math.max(1, Math.min(4, (dist / startDist.current))));
      return;
    }
    if (zoom > 1) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  }, [zoom]);

  const onTouchEnd = useCallback(() => {
    if (dragY > 100) onOpenChange(false);
    setDragY(0);
    startDist.current = 0;
  }, [dragY, onOpenChange]);

  if (!images.length) return null;

  const opacity = Math.max(0.3, 1 - dragY / 400);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full max-h-full w-screen h-screen p-0 bg-black border-0 rounded-none [&>button]:hidden"
        style={{ background: `rgba(0,0,0,${opacity})` }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/60 to-transparent">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
          {images.length > 1 && (
            <span className="text-white/80 text-sm font-semibold tabular-nums">
              {currentIndex + 1} / {images.length}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10" asChild>
              <a href={images[currentIndex]} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Image — swipe down to dismiss, double-tap area to close */}
        <div
          className="flex items-center justify-center w-full h-full select-none touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => zoom === 1 && onOpenChange(false)}
          style={{ transform: `translateY(${dragY}px)`, transition: dragY === 0 ? "transform 0.25s ease" : "none" }}
        >
          <img
            src={images[currentIndex]}
            alt=""
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease" }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => setZoom(z => z === 1 ? 2 : 1)}
            draggable={false}
          />
        </div>

        {/* Navigation arrows (desktop) */}
        {images.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white bg-black/30 hover:bg-black/50" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white bg-black/30 hover:bg-black/50" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setZoom(1); }} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6" : "bg-white/40 w-1.5"}`} />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
