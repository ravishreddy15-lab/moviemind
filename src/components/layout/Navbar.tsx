import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Menu,
  X,
  User,
  Sun,
  Moon,
  Film,
  Home,
  Compass,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Browse", to: "/search", icon: Compass },
  { label: "Quiz", to: "/quiz", icon: HelpCircle },
  { label: "Search", to: "/search", icon: Search },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Film className="h-7 w-7 text-primary" />
              </motion.div>
              <span className="text-xl font-bold gradient-text">MovieMind</span>
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.to);
                return (
                  <Link key={link.to + link.label} to={link.to}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "text-white"
                          : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg bg-primary/20 border border-primary/30"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link to="/search" className="hidden md:flex">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </motion.button>
              </Link>

              {/* Theme Toggle Placeholder */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
                className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.button>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                </motion.button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl glass-strong shadow-xl p-1"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-medium text-white">
                          Movie Fan
                        </p>
                        <p className="text-xs text-muted-foreground">
                          fan@moviemind.ai
                        </p>
                      </div>
                      <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        Watchlist
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-72 glass-strong z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-bold gradient-text">
                  MovieMind
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to + link.label}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary/20 text-white border border-primary/30"
                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </motion.div>
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
                    <p className="text-sm font-medium text-white">Movie Fan</p>
                    <p className="text-xs text-muted-foreground">
                      fan@moviemind.ai
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
