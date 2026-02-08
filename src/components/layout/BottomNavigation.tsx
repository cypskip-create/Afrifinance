import { Home, TrendingUp, Compass, Newspaper, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "markets", label: "Markets", icon: TrendingUp, path: "/markets" },
  { id: "news", label: "News", icon: Newspaper, path: "/news" },
  { id: "discover", label: "Discover", icon: Compass, path: "/discover" },
  { id: "account", label: "Account", icon: User, path: "/account" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="grid grid-cols-5 h-full max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "tab-item tap-scale relative flex flex-col items-center justify-center py-1.5",
                isActive ? "active" : "inactive"
              )}
            >
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-0.5 sm:h-1 bg-primary rounded-full" />
              )}
              <item.icon className={cn(
                "h-5 w-5 sm:h-[22px] sm:w-[22px] mb-0.5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] sm:text-[11px] font-medium leading-tight",
                isActive && "font-semibold text-primary"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}