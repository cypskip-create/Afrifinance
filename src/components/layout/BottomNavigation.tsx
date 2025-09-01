import { Home, TrendingUp, Search, Newspaper, User, PieChart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "markets", label: "Markets", icon: TrendingUp, path: "/markets" },
  { id: "portfolio", label: "Portfolio", icon: PieChart, path: "/portfolio" },
  { id: "discover", label: "Discover", icon: Search, path: "/discover" },
  { id: "news", label: "News", icon: Newspaper, path: "/news" },
  { id: "account", label: "Account", icon: User, path: "/account" },
];

export function BottomNavigation() {
  return (
    <nav className="bottom-nav kenyan-pattern">
      <div className="grid grid-cols-6 h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "tab-item",
                isActive ? "active" : "inactive"
              )
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}