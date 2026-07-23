import { Link } from "react-router-dom";
import { Film, Github, MessageCircle, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Browse Movies", to: "/search" },
  { label: "Take the Quiz", to: "/quiz" },
];

const exploreLinks = [
  { label: "Top Rated", to: "/search" },
  { label: "New Releases", to: "/search" },
  { label: "Hidden Gems", to: "/search" },
];

const socialLinks = [
  { label: "Twitter", icon: MessageCircle, href: "#" },
  { label: "GitHub", icon: Github, href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold gradient-text">MovieMind</span>
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI Powered Movie Recommendations. Discover your next favorite film
              with intelligent suggestions tailored to your taste.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-white hover:border-border-hover transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get weekly AI-curated movie picks delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-card border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
              >
                Join
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MovieMind AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> by AI
          </p>
        </div>
      </div>
    </footer>
  );
}
