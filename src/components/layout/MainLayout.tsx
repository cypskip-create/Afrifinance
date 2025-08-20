import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content area with bottom padding for navigation */}
      <main className="pb-20">
        <Outlet />
      </main>
      
      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
}