import { useState, useRef, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { ProtectedRoute } from "./ProtectedRoute";

export function MainLayout() {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    // Require a meaningful pull before showing indicator, then apply heavy resistance.
    if (diff > 20 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      // Dampened curve: feels like rubber band — slower as it stretches further.
      const stretched = (diff - 20) * 0.22;
      setPullDistance(Math.min(stretched, 90));
    } else if (diff <= 20) {
      setPullDistance(0);
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(() => {
    // Higher commit threshold so casual scrolls don't trigger refresh.
    if (pullDistance > 75 && !refreshing) {
      setRefreshing(true);
      setPullDistance(50);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } else {
      setPullDistance(0);
    }
    setPulling(false);
  }, [pullDistance, refreshing]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Pull indicator */}
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
          style={{ height: pullDistance > 0 ? pullDistance : 0 }}
        >
          <div
            className={`w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full ${refreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 60, 1), transform: `rotate(${pullDistance * 4}deg)` }}
          />
        </div>

        <div
          ref={scrollRef}
          className="pb-20 overflow-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Outlet />
        </div>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}
