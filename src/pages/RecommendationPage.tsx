import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRecommendations, Recommendation } from "@/utils/api";

type SortMode = "best" | "rated" | "newest";

export default function RecommendationPage() {
  const location = useLocation();
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    (location.state?.recommendations as Recommendation[]) || []
  );
  const [loading, setLoading] = useState(recommendations.length === 0);

  useEffect(() => {
    if (recommendations.length > 0) return;

    async function fetchDefault() {
      try {
        const result = await getRecommendations({});
        setRecommendations(result.recommendations);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDefault();
  }, [recommendations.length]);

  const sortedRecommendations = useMemo(() => {
    const list = [...recommendations];
    switch (sortMode) {
      case "rated":
        return list.sort((a, b) => b.movie.rating - a.movie.rating);
      case "newest":
        return list.sort((a, b) => b.movie.year - a.movie.year);
      case "best":
      default:
        return list.sort((a, b) => b.match_percentage - a.match_percentage);
    }
  }, [recommendations, sortMode]);

  const displayed = sortedRecommendations.slice(0, 12);

  const sortButtons: { key: SortMode; label: string }[] = [
    { key: "best", label: "Best Match" },
    { key: "rated", label: "Highest Rated" },
    { key: "newest", label: "Newest" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">AI Picks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Your Personalized Recommendations
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Based on your preferences, we found these perfect matches
          </p>
        </motion.div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            {sortButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setSortMode(btn.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer",
                  sortMode === btn.key
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-600"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <Link to="/quiz">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Quiz Again
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-zinc-800/50 animate-pulse">
                <div className="h-48 bg-zinc-700/50 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-700/50 rounded w-3/4" />
                  <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
                  <div className="h-3 bg-zinc-700/50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayed.map((rec, i) => (
              <motion.div
                key={rec.movie.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
              >
                <Link to={`/movie/${rec.movie.id}`}>
                  <div className="group rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {rec.movie.poster ? (
                        <>
                          <img
                            src={rec.movie.poster}
                            alt={`${rec.movie.title} poster`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty("display", "flex");
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                          <div className="hidden absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 items-center justify-center">
                            <span className="text-5xl font-bold text-zinc-700">{rec.movie.title[0]}</span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                          <span className="text-5xl font-bold text-zinc-700 group-hover:text-zinc-600 transition-colors">
                            {rec.movie.title[0]}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-bold">
                          {rec.match_percentage}% Match
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-white font-medium">{rec.movie.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {rec.movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{rec.movie.year}</span>
                        <span>·</span>
                        <span>{rec.movie.duration}</span>
                        <span>·</span>
                        <span>{rec.movie.certificate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(rec.movie.genre || []).slice(0, 2).map((g) => (
                          <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {g}
                          </span>
                        ))}
                      </div>
                      {rec.reason && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{rec.reason}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
