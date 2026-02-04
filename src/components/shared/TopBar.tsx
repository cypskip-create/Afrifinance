import { Search, Settings2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showWidgetSettings?: boolean;
  showNotifications?: boolean;
  onWidgetSettingsClick?: () => void;
  onSearch?: (query: string) => void;
  initialSearchQuery?: string;
}

export function TopBar({ 
  title, 
  subtitle, 
  showSearch = true, 
  showWidgetSettings = false, 
  showNotifications = true,
  onWidgetSettingsClick,
  onSearch,
  initialSearchQuery = ""
}: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(!!initialSearchQuery);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else if (location.pathname !== '/traders-hub') {
        // Navigate to TradersHub with search query
        navigate(`/traders-hub?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          {showSearch && (
            <div className="flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search stocks, topics..." 
                    className="w-48 h-9 text-sm"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    ✕
                  </Button>
                </form>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Widget Settings */}
          {showWidgetSettings && onWidgetSettingsClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0"
              onClick={onWidgetSettingsClick}
              title="Customize Widgets"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></div>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
