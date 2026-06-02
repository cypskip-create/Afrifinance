import { Home, TrendingUp, Users, Wallet, Bell, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "markets", label: "Markets", icon: TrendingUp, path: "/markets" },
  { id: "portfolio", label: "Portfolio", icon: Wallet, path: "/track-investments" },
  { id: "traders", label: "TradersHub", icon: Users, path: "/traders-hub" },
  { id: "alerts", label: "Alerts", icon: Bell, path: "/alerts" },
  { id: "account", label: "Profile", icon: User, path: "/account" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="grid grid-cols-6 h-full max-w-2xl mx-auto px-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/alerts" && location.pathname === "/notifications");
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "tab-item tap-scale relative flex flex-col items-center justify-center py-1.5 gap-0.5",
                isActive ? "active" : "inactive"
              )}
            >
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
              )}
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <item.icon
                  className={cn("h-[18px] w-[18px] transition-all duration-200", isActive && "text-primary")}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium leading-tight",
                  isActive && "font-semibold text-primary"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
