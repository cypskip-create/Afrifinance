import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import Home from "./pages/Home";
import Markets from "./pages/Markets";
import Discover from "./pages/Discover";
import News from "./pages/News";
import Account from "./pages/Account";
import StockDetail from "./pages/StockDetail";
import Watchlist from "./pages/Watchlist";
import SectorDetail from "./pages/SectorDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Learn from "./pages/Learn";
import Notifications from "./pages/Notifications";
import Landing from "./pages/Landing";
import SectorHeatmap from "./pages/SectorHeatmap";
import TrackInvestments from "./pages/TrackInvestments";
import TradersHub from "./pages/TradersHub";
import Rooms from "./pages/Rooms";
import StockScreener from "./pages/StockScreener";
import StockCompare from "./pages/StockCompare";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="kenyan-stocks-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="markets" element={<Markets />} />
                <Route path="discover" element={<Discover />} />
                <Route path="news" element={<News />} />
                <Route path="account" element={<Account />} />
                <Route path="stock/:symbol" element={<StockDetail />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="sector/:sector" element={<SectorDetail />} />
                <Route path="learn" element={<Learn />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="alerts" element={<Notifications />} />
                <Route path="sector-heatmap" element={<SectorHeatmap />} />
                <Route path="market-brief" element={<SectorHeatmap />} />
                <Route path="track-investments" element={<TrackInvestments />} />
                <Route path="traders-hub" element={<TradersHub />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="screener" element={<StockScreener />} />
                <Route path="compare" element={<StockCompare />} />
                <Route path="profile/:userId" element={<UserProfile />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
