import { Link } from "react-router-dom";
import { Sparkles, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const floatingPosters = [
  { rotate: -8, x: -120, y: -40, animClass: "animate-float-slow" },
  { rotate: 5, x: 100, y: -60, animClass: "animate-float-medium", delay: "2s" },
  { rotate: -3, x: -60, y: 30, animClass: "animate-float-slow", delay: "4s" },
  { rotate: 7, x: 80, y: 40, animClass: "animate-float-fast", delay: "1s" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] animate-float-medium" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] animate-float-fast" style={{ animationDelay: "4s" }} />
      </div>

      {floatingPosters.map((poster, i) => (
        <div
          key={i}
          className={cn("absolute hidden lg:block", poster.animClass)}
          style={{
            left: `calc(50% + ${poster.x}px)`,
            top: `calc(50% + ${poster.y}px)`,
            opacity: 0.15,
            transform: `rotate(${poster.rotate}deg)`,
            animationDelay: poster.delay || "0s",
          }}
        >
          <div className="w-32 h-44 rounded-lg bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 border border-zinc-700/30 flex items-center justify-center backdrop-blur-sm">
            <Film className="h-10 w-10 text-zinc-500/50" />
          </div>
        </div>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up stagger-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            AI-Powered Recommendations
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-in-up stagger-2">
          <span className="gradient-text">What Should You</span>
          <br />
          <span className="gradient-text">Watch Tonight?</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-3">
          Let AI understand your taste and recommend the perfect movie in less than one minute.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4">
          <Link to="/quiz">
            <button
              className={cn(
                "inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-base font-semibold text-white btn-press",
                "shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-shadow duration-300"
              )}
            >
              <Sparkles className="h-5 w-5" />
              Start Recommendation
            </button>
          </Link>
          <Link to="/search">
            <button
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-transparent px-8 py-4 text-base font-semibold text-white btn-press",
                "hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors duration-300"
              )}
            >
              Browse Movies
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
