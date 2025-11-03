import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import Home from "./pages/Home";
import Markets from "./pages/Markets";
import Discover from "./pages/Discover";
import News from "./pages/News";
import Portfolio from "./pages/Portfolio";
import Account from "./pages/Account";
import StockDetail from "./pages/StockDetail";
import Watchlist from "./pages/Watchlist";
import SectorDetail from "./pages/SectorDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TradersHub from "./pages/TradersHub";
import Learn from "./pages/Learn";
import PaperTrade from "./pages/PaperTrade";
import Rooms from "./pages/Rooms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="kenyan-stocks-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="markets" element={<Markets />} />
                <Route path="discover" element={<Discover />} />
                <Route path="news" element={<News />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="account" element={<Account />} />
                <Route path="stock/:symbol" element={<StockDetail />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="sector/:sector" element={<SectorDetail />} />
                <Route path="tradershub" element={<TradersHub />} />
                <Route path="learn" element={<Learn />} />
                <Route path="papertrade" element={<PaperTrade />} />
                <Route path="rooms" element={<Rooms />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
