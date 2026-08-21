import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Menu, X, User, Sun, Moon, Film, Home, Compass, HelpCircle, Route } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Browse", to: "/search", icon: Compass },
  { label: "Quiz", to: "/quiz", icon: HelpCircle },
  { label: "Mood Journey", to: "/mood-journey", icon: Route },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("moviemind_user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.loggedIn) {
        setLoggedIn(true);
        setUserEmail(parsed.email);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("moviemind_user");
    setLoggedIn(false);
    setUserEmail("");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong nav-slide animate-fade-in-down">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="transition-transform duration-200 group-hover:rotate-15 group-hover:scale-110">
                <Film className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text">MovieMind</span>
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to);
                return (
                  <Link key={link.to + link.label} to={link.to}>
                    <div
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive ? "text-white" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <div className="absolute inset-0 rounded-lg bg-primary/20 border border-primary/30" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors btn-press"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold btn-press"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl glass-strong shadow-xl p-1 animate-scale-in" style={{ transformOrigin: "top right" }}>
                    {loggedIn ? (
                      <>
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                          <p className="text-xs text-muted-foreground">Signed in</p>
                        </div>
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          Profile
                        </Link>
                        <Link to="/watchlist" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          Watchlist
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          Sign In
                        </Link>
                        <Link to="/login" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-72 glass-strong z-50 md:hidden flex flex-col animate-slide-left" style={{ animationDuration: "0.3s" }}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-lg font-bold gradient-text">MovieMind</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to);
                return (
                  <Link key={link.to + link.label} to={link.to} onClick={() => setMobileOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive ? "bg-primary/20 text-white border border-primary/30" : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{loggedIn ? userEmail.split("@")[0] : "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{loggedIn ? userEmail : "Not signed in"}</p>
                </div>
              </div>
              {loggedIn ? (
                <button onClick={handleLogout} className="w-full mt-3 px-4 py-2 text-sm text-destructive bg-destructive/10 rounded-lg transition-colors">
                  Sign Out
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block mt-3 px-4 py-2 text-sm text-center text-white bg-purple-600 rounded-lg transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <div className="h-16" />
    </>
  );
}
