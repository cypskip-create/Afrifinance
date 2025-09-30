import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { ProtectedRoute } from "./ProtectedRoute";

export function MainLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Main content area with bottom padding for navigation */}
        <main className="pb-20">
          <Outlet />
        </main>
        
        {/* Bottom navigation */}
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}