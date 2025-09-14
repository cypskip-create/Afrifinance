import { Search, Bot, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showAI?: boolean;
  showNotifications?: boolean;
}

export function TopBar({ 
  title, 
  subtitle, 
  showSearch = true, 
  showAI = true, 
  showNotifications = true 
}: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiUsage] = useState({ used: 1, limit: 3, tier: "Free" }); // Mock data

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
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search stocks, crypto, ETFs..." 
                    className="w-48 h-9 text-sm"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0"
                    onClick={() => setSearchOpen(false)}
                  >
                    ✕
                  </Button>
                </div>
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

          {/* AI Assistant */}
          {showAI && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 relative"
              title={`AI Assistant (${aiUsage.used}/${aiUsage.limit} used)`}
            >
              <Bot className="h-4 w-4" />
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
              >
                {aiUsage.limit - aiUsage.used}
              </Badge>
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></div>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}