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
    if (diff > 0 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      setPullDistance(Math.min(diff * 0.4, 80));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60 && !refreshing) {
      setRefreshing(true);
      setPullDistance(50);
      // Trigger page refresh
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
