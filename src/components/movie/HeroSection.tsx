import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const floatingPosters = [
  { rotate: -8, x: -120, y: -40, delay: 0 },
  { rotate: 5, x: 100, y: -60, delay: 0.8 },
  { rotate: -3, x: -60, y: 30, delay: 1.6 },
  { rotate: 7, x: 80, y: 40, delay: 2.4 },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {floatingPosters.map((poster, i) => (
        <motion.div
          key={i}
          className="absolute hidden lg:block"
          style={{
            left: `calc(50% + ${poster.x}px)`,
            top: `calc(50% + ${poster.y}px)`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 0.15,
            scale: 1,
            rotate: poster.rotate,
            y: [0, -15, 0],
          }}
          transition={{
            opacity: { duration: 1, delay: poster.delay },
            scale: { duration: 1, delay: poster.delay },
            rotate: { duration: 0 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: poster.delay },
          }}
        >
          <div className="w-32 h-44 rounded-lg bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 border border-zinc-700/30 flex items-center justify-center backdrop-blur-sm">
            <Film className="h-10 w-10 text-zinc-500/50" />
          </div>
        </motion.div>
      ))}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            AI-Powered Recommendations
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
        >
          <span className="gradient-text">What Should You</span>
          <br />
          <span className="gradient-text">Watch Tonight?</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Let AI understand your taste and recommend the perfect movie in less than one minute.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/quiz">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-base font-semibold text-white",
                "shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-shadow duration-300"
              )}
            >
              <Sparkles className="h-5 w-5" />
              Start Recommendation
            </motion.button>
          </Link>
          <Link to="/search">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-transparent px-8 py-4 text-base font-semibold text-white",
                "hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors duration-300"
              )}
            >
              Browse Movies
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
