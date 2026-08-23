import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Sparkles, RotateCcw, Star, Loader2, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRecommendations, getQuizRecommendations, Recommendation } from "@/utils/api";

type SortMode = "best" | "rated" | "newest";

export default function RecommendationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    (location.state?.recommendations as Recommendation[]) || []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecs() {
      setLoading(true);
      try {
        // If passed directly via state, use that
        if (location.state?.recommendations && location.state.recommendations.length > 0) {
          setRecommendations(location.state.recommendations);
          setLoading(false);
          return;
        }

        // Check if query parameters exist from Quiz or search
        const mood = searchParams.get("mood") || "";
        const genresStr = searchParams.get("genres") || "";
        const genres = genresStr ? genresStr.split(",").filter(Boolean) : [];
        const style = searchParams.get("style") || "";
        const pace = searchParams.get("pace") || "";
        const length = searchParams.get("length") || "";

        let result;
        if (mood || genres.length > 0 || style || pace || length) {
          result = await getQuizRecommendations({
            mood,
            genres,
            style,
            pace,
            length,
          });
        } else {
          result = await getRecommendations({});
        }

        if (result && result.recommendations) {
          setRecommendations(result.recommendations);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecs();
  }, [location.state, searchParams]);

  const sortedRecommendations = useMemo(() => {
    const list = [...recommendations];
    switch (sortMode) {
      case "rated":
        return list.sort((a, b) => b.movie.rating - a.movie.rating);
      case "newest":
        return list.sort((a, b) => b.movie.year - a.movie.year);
      default:
        return list.sort((a, b) => b.match_percentage - a.match_percentage);
    }
  }, [recommendations, sortMode]);

  const displayed = sortedRecommendations.slice(0, 16);
  const sortButtons: { key: SortMode; label: string }[] = [
    { key: "best", label: "Best Match" },
    { key: "rated", label: "Highest Rated" },
    { key: "newest", label: "Newest" },
  ];

  const moodParam = searchParams.get("mood");
  const genresParam = searchParams.get("genres");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">AI Curated Matches</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Personalized Recommendations</h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
            {moodParam || genresParam ? (
              <span>
                Personalized for{" "}
                {moodParam && <span className="text-purple-300 font-semibold capitalize">"{moodParam}" mood </span>}
                {genresParam && <span className="text-purple-300 font-semibold">({genresParam.split(",").join(", ")})</span>}
              </span>
            ) : (
              "Based on your cinematic preferences and taste profile"
            )}
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in-up stagger-1">
          <div className="flex gap-2">
            {sortButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setSortMode(btn.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer btn-press",
                  sortMode === btn.key
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-600"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/quiz">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 btn-press">
                <RotateCcw className="w-4 h-4 mr-2" /> Take Quiz Again
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="ghost" className="text-purple-400 hover:bg-purple-950/30">
                <Compass className="w-4 h-4 mr-2" /> Browse All
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-zinc-800/50 animate-pulse border border-zinc-800">
                <div className="aspect-[2/3] bg-zinc-700/50 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-700/50 rounded w-3/4" />
                  <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
                  <div className="h-3 bg-zinc-700/50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8 space-y-4">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto opacity-70" />
            <h2 className="text-xl font-bold text-white">No matches found for this specific combo</h2>
            <p className="text-zinc-400 max-w-md mx-auto">Try retaking the quiz with broader genre options or explore the full catalog.</p>
            <Link to="/quiz">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">Retake Taste Quiz</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayed.map((rec, i) => (
              <div key={rec.movie.id} className={cn("animate-fade-in-up", `stagger-${Math.min(i + 1, 8)}`)}>
                <Link to={`/movie/${rec.movie.id}`}>
                  <div className="group rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/20">
                    <div className="aspect-[2/3] relative overflow-hidden bg-zinc-950">
                      {rec.movie.poster ? (
                        <>
                          <img
                            src={rec.movie.poster}
                            alt={`${rec.movie.title} poster`}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold shadow-sm backdrop-blur-sm">
                          {rec.match_percentage}% Match
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 border border-zinc-700/50">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-white font-medium">{rec.movie.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                        {rec.movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>{rec.movie.year}</span>
                        <span>·</span>
                        <span>{rec.movie.duration}</span>
                        <span>·</span>
                        <span>{rec.movie.certificate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(rec.movie.genre || []).slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      {rec.reason && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
                          {rec.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
