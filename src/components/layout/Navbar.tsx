import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Bell, Moon, Sun, User, Crown, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface NavbarProps {
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  searchValue?: string;
}

const Navbar = ({ onSearchChange, showSearch = false, searchValue = "" }: NavbarProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("audioflix-theme") !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", !isDarkMode);
    localStorage.setItem("audioflix-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse" },
    { to: "/profile", label: "Profile" },
    { to: "/login", label: "Sign In" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          <span className="text-gradient">Audio</span>
          <span className="text-foreground">Flix</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                location.pathname === link.to
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 rounded-lg bg-gold/15 text-gold px-2.5 py-1 text-xs font-semibold border border-gold/30">
            <Crown className="w-3.5 h-3.5" />
            Premium
          </span>

          <div className={`hidden md:flex items-center transition-all duration-300 ${searchOpen ? "w-64" : "w-10"}`}>
            {searchOpen ? (
              <div className="flex items-center w-full bg-secondary rounded-lg px-3 py-2 gap-2">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search titles, genres..."
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    onSearchChange?.("");
                  }}
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            className="hidden md:flex relative w-10 h-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
          </button>

          <div className="hidden md:block relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label="User menu"
            >
              <span className="w-7 h-7 rounded-full bg-accent/30 text-accent-foreground flex items-center justify-center text-xs font-bold">
                NA
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-card shadow-xl p-1.5 animate-fade-in z-50">
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-foreground hover:bg-secondary"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Settings
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border px-4 pb-4 animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-gold/15 text-gold px-2.5 py-1 text-xs font-semibold border border-gold/30">
              <Crown className="w-3.5 h-3.5" />
              Premium
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="flex items-center bg-secondary rounded-lg px-3 py-2.5 gap-2 mb-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
          )}
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === link.to
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
