import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <motion.div
        className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Film className="w-16 h-16 text-zinc-700" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-8xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
        >
          404
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-zinc-400 max-w-md">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-3 justify-center">
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Search className="w-4 h-4 mr-2" />
              Browse Movies
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
