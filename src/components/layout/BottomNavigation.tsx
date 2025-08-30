import { Home, TrendingUp, Search, PieChart, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "markets", label: "Markets", icon: TrendingUp, path: "/markets" },
  { id: "discover", label: "Discover", icon: Search, path: "/discover" },
  { id: "portfolio", label: "Portfolio", icon: PieChart, path: "/portfolio" },
  { id: "account", label: "Account", icon: User, path: "/account" },
];

export function BottomNavigation() {
  return (
    <nav className="bottom-nav kenyan-pattern">
      <div className="grid grid-cols-5 h-full">
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