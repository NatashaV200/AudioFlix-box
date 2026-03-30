import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  House,
  Library,
  Compass,
  Heart,
  History,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: House },
  { to: "/library", label: "Library", icon: Library },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/history", label: "Listening History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border/50 bg-background/85 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="w-full p-3">
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="tap-target w-11 h-11 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
