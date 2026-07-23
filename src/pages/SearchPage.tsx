import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Star, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { searchMovies, getGenres, Movie } from "@/utils/api";

interface Filters {
  genre: string;
  minRating: number;
  sortBy: "relevance" | "rating" | "year" | "popularity";
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<Filters>({
    genre: searchParams.get("genre") || "",
    minRating: Number(searchParams.get("minRating")) || 0,
    sortBy: (searchParams.get("sortBy") as Filters["sortBy"]) || "relevance",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getGenres().then((res) => setAllGenres(res.genres)).catch(() => {});
  }, []);

  const fetchMovies = useCallback(async (q: string, f: Filters) => {
    setLoading(true);
    try {
      const result = await searchMovies(
        q,
        f.genre,
        f.minRating,
        1900,
        2030,
        f.sortBy === "popularity" ? "relevance" : f.sortBy
      );
      setMovies(result.movies);
      setTotal(result.total);
    } catch (err) {
      console.error("Search failed:", err);
      setMovies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(query, filters);
  }, [query, filters, fetchMovies]);

  const updateFilter = (updates: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...updates }));
  };

  const hasActiveFilters = filters.genre !== "" || filters.minRating > 0;

  const clearFilters = () => {
    setFilters({ genre: "", minRating: 0, sortBy: "relevance" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search movies, actors, directors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 bg-zinc-900/80 border-zinc-800 text-white text-base placeholder:text-zinc-500"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {loading ? "Searching..." : `${total} movie${total !== 1 ? "s" : ""} found`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden text-zinc-400 hover:text-white"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
              </Button>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter({ sortBy: e.target.value as Filters["sortBy"] })}
                className="bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-1.5 cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="year">Year</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.genre && (
                <Badge
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20"
                  onClick={() => updateFilter({ genre: "" })}
                >
                  {filters.genre}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20"
                  onClick={() => updateFilter({ minRating: 0 })}
                >
                  Rating {filters.minRating}+
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              <button onClick={clearFilters} className="text-xs text-zinc-500 hover:text-white cursor-pointer">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          <AnimatePresence>
            {(showFilters || true) && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 220 }}
                exit={{ opacity: 0, width: 0 }}
                className={cn(
                  "flex-shrink-0 space-y-6 overflow-hidden",
                  "fixed md:static inset-0 z-40 bg-background md:bg-transparent md:block",
                  showFilters ? "block" : "hidden md:block"
                )}
              >
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-5 md:sticky md:top-24 h-fit">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="md:hidden text-zinc-500 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Genre</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => updateFilter({ genre: filters.genre === genre ? "" : genre })}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                            filters.genre === genre
                              ? "bg-purple-600/20 text-purple-400"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          )}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Min Rating</h4>
                    <div className="flex gap-2">
                      {[0, 7, 8, 9].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateFilter({ minRating: r })}
                          className={cn(
                            "px-3 py-1 rounded-lg text-sm border transition-colors cursor-pointer",
                            filters.minRating === r
                              ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                              : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                          )}
                        >
                          {r === 0 ? "Any" : `${r}+`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-zinc-800/50 animate-pulse">
                    <div className="aspect-[2/3] bg-zinc-700/50 rounded-t-xl" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-zinc-700/50 rounded w-3/4" />
                      <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : movies.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-zinc-800/50 p-6">
                  <Film className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No movies found</h3>
                <p className="text-zinc-500 max-w-md">Try adjusting your search or filters to find what you're looking for.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((movie, i) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/movie/${movie.id}`}>
                      <div className="group rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                        <div className="aspect-[2/3] relative overflow-hidden">
                          {movie.poster ? (
                            <>
                              <img src={movie.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                              <span className="text-5xl font-bold text-zinc-700 group-hover:text-zinc-600 transition-colors">
                                {movie.title[0]}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 z-10">
                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-white font-medium">{movie.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">{movie.title}</h3>
                          <p className="text-xs text-zinc-500">{movie.year} · {movie.duration}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
