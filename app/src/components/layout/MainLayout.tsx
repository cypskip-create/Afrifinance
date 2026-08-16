import { useState, useRef, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { ProtectedRoute } from "./ProtectedRoute";
import { LogoRefresh } from "@/components/shared/LogoRefresh";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { RouteSeo } from "@/components/shared/RouteSeo";
import { AppLockGate } from "@/components/security/AppLockGate";


// Session-scoped: splash only shows once per app open, not on every re-mount.
let splashShown = false;

export function MainLayout() {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showSplash, setShowSplash] = useState(!splashShown);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { splashShown = true; }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    // Rubber-band: significant dead zone, then heavy resistance so casual
    // scrolls never trip refresh. Feels closer to Robinhood / X.
    if (diff > 40 && window.scrollY <= 0) {
      const stretched = (diff - 40) * 0.28;
      setPullDistance(Math.min(stretched, 96));
    } else if (diff <= 40) {
      setPullDistance(0);
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(() => {
    // Commit only past a firm threshold — Fidelity-like resistance.
    if (pullDistance > 78 && !refreshing) {
      setRefreshing(true);
      setPullDistance(56);
      setTimeout(() => window.location.reload(), 650);
    } else {
      setPullDistance(0);
    }
    setPulling(false);
  }, [pullDistance, refreshing]);

  return (
    <ProtectedRoute>
      <RouteSeo />
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <AppLockGate>
        <div className="min-h-screen bg-background">

          {/* Branded pull indicator */}
          <div
            className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
            style={{ height: pullDistance > 0 ? pullDistance : 0 }}
          >
            <LogoRefresh progress={pullDistance / 78} refreshing={refreshing} />
          </div>

          <div
            ref={scrollRef}
            className="pb-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Outlet />
          </div>

          <BottomNavigation />
        </div>
      </AppLockGate>
    </ProtectedRoute>
  );
}