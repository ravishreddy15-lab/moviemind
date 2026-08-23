import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Film, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchMovies, getGenres, getTmdbStatus, Movie } from "@/utils/api";
import MovieCard from "@/components/movie/MovieCard";

interface Filters {
  genre: string;
  minRating: number;
  sortBy: "relevance" | "rating" | "rating_asc" | "year" | "oldest" | "popularity" | "votes" | "title" | "title_desc";
}

const SORT_OPTIONS: { value: Filters["sortBy"]; label: string; icon?: string }[] = [
  { value: "relevance", label: "Featured & Relevance" },
  { value: "rating", label: "Highest Rating (★ 9.3 → 7.0)" },
  { value: "rating_asc", label: "Lowest Rating (★ 7.0 → 9.3)" },
  { value: "year", label: "Newest First (2024 → 1960)" },
  { value: "oldest", label: "Oldest Classics (1960 → 2024)" },
  { value: "popularity", label: "Most Popular (Votes & Views)" },
  { value: "title", label: "Title (A → Z)" },
  { value: "title_desc", label: "Title (Z → A)" },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState<Filters>({
    genre: searchParams.get("genre") || "",
    minRating: Number(searchParams.get("minRating")) || Number(searchParams.get("min_rating")) || 0,
    sortBy: (searchParams.get("sortBy") as Filters["sortBy"]) || (searchParams.get("sort_by") as Filters["sortBy"]) || "relevance",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tmdbStatus, setTmdbStatus] = useState<{ configured: boolean; total_movies_accessible: number } | null>(null);

  useEffect(() => {
    getTmdbStatus().then(setTmdbStatus).catch(() => {});
  }, []);

  // Sync state when URL searchParams changes
  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    const genreParam = searchParams.get("genre") || "";
    const minRatingParam = Number(searchParams.get("minRating")) || Number(searchParams.get("min_rating")) || 0;
    const rawSort = (searchParams.get("sortBy") || searchParams.get("sort_by") || "relevance") as Filters["sortBy"];
    const pageParam = Number(searchParams.get("page")) || 1;

    setQuery(qParam);
    setCurrentPage(pageParam);
    setFilters({
      genre: genreParam,
      minRating: minRatingParam,
      sortBy: rawSort,
    });
  }, [searchParams]);

  useEffect(() => {
    getGenres()
      .then((res) => {
        if (res?.genres && res.genres.length > 0) {
          setAllGenres(res.genres);
        } else {
          setAllGenres([
            "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
            "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
            "Romance", "Sci-Fi", "Thriller", "War"
          ]);
        }
      })
      .catch(() => {
        setAllGenres([
          "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
          "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
          "Romance", "Sci-Fi", "Thriller", "War"
        ]);
      });
  }, []);

  const fetchMovies = useCallback(async (q: string, f: Filters, page: number) => {
    setLoading(true);
    try {
      const result = await searchMovies(
        q,
        f.genre,
        f.minRating,
        1900,
        2030,
        f.sortBy,
        page
      );
      setMovies(result.movies || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || Math.ceil((result.total || 0) / 24) || 1);
    } catch (err) {
      console.error("Failed to search movies:", err);
      setMovies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(query, filters, currentPage);
  }, [query, filters, currentPage, fetchMovies]);

  const updateFilter = (updates: Partial<Filters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    setCurrentPage(1);
    const newParams = new URLSearchParams();
    if (query) newParams.set("q", query);
    if (newFilters.genre) newParams.set("genre", newFilters.genre);
    if (newFilters.minRating > 0) newParams.set("minRating", String(newFilters.minRating));
    if (newFilters.sortBy && newFilters.sortBy !== "relevance") newParams.set("sortBy", newFilters.sortBy);
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set("q", val);
    else newParams.delete("q");
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = filters.genre !== "" || filters.minRating > 0 || filters.sortBy !== "relevance";
  const clearFilters = () => {
    setFilters({ genre: "", minRating: 0, sortBy: "relevance" });
    setQuery("");
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label || "Relevance";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Search and Quick Chips */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search movies, actors, directors, descriptions..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-12 h-12 bg-zinc-900/90 border-zinc-800 text-white text-base placeholder:text-zinc-500 rounded-xl focus:border-purple-500"
            />
            {query && (
              <button
                onClick={() => handleQueryChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={clearFilters}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                !hasActiveFilters && !query
                  ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/20"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              )}
            >
              All Movies
            </button>
            <button
              onClick={() => {
                updateFilter({ sortBy: "popularity", genre: "", minRating: 0 });
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                filters.sortBy === "popularity" && !filters.genre
                  ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/20"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              )}
            >
              🔥 Most Popular
            </button>
            <button
              onClick={() => {
                updateFilter({ sortBy: "rating", minRating: 8, genre: "" });
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                filters.sortBy === "rating" && filters.minRating >= 8
                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 font-semibold"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              )}
            >
              ⭐ Top Rated (8.0+)
            </button>
            <button
              onClick={() => {
                updateFilter({ sortBy: "year", genre: "", minRating: 0 });
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                filters.sortBy === "year"
                  ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/20"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              )}
            >
              🕒 New Releases
            </button>
            <button
              onClick={() => {
                updateFilter({ sortBy: "oldest", genre: "", minRating: 0 });
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                filters.sortBy === "oldest"
                  ? "bg-amber-600/30 border-amber-500/50 text-amber-300 font-semibold"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              )}
            >
              🏛️ Vintage Classics
            </button>
            <button
              onClick={() => {
                updateFilter({ sortBy: "title", genre: "", minRating: 0 });
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                filters.sortBy === "title"
                  ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/20"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              )}
            >
              🔤 Title (A-Z)
            </button>
            {allGenres.slice(0, 10).map((g) => (
              <button
                key={g}
                onClick={() => updateFilter({ genre: filters.genre.toLowerCase() === g.toLowerCase() ? "" : g })}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap btn-press",
                  filters.genre.toLowerCase() === g.toLowerCase()
                    ? "bg-purple-600/30 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-500/20"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Search meta & controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm text-zinc-300 font-medium flex items-center gap-2">
                <span>{loading ? "Finding movies..." : `${total} movie${total !== 1 ? "s" : ""} found`}</span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-xs text-purple-400 font-normal">
                  Sorted by: <span className="font-semibold text-purple-300">{currentSortLabel}</span>
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="md:hidden text-zinc-300 bg-zinc-800/80 border border-zinc-700 hover:text-white btn-press"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5 text-purple-400" /> Filters
              </Button>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter({ sortBy: e.target.value as Filters["sortBy"] })}
                className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 font-medium rounded-xl px-3.5 py-2 cursor-pointer focus:outline-none focus:border-purple-500 shadow-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-zinc-500 font-medium">Active filters:</span>
              {filters.genre && (
                <Badge
                  variant="outline"
                  className="border-purple-500/40 text-purple-300 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20 px-2.5 py-1"
                  onClick={() => updateFilter({ genre: "" })}
                >
                  Genre: {filters.genre}
                  <X className="w-3.5 h-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge
                  variant="outline"
                  className="border-yellow-500/40 text-yellow-300 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20 px-2.5 py-1"
                  onClick={() => updateFilter({ minRating: 0 })}
                >
                  Rating: {filters.minRating}+
                  <X className="w-3.5 h-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.sortBy !== "relevance" && (
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10 cursor-pointer hover:bg-blue-500/20 px-2.5 py-1"
                  onClick={() => updateFilter({ sortBy: "relevance" })}
                >
                  Sort: {currentSortLabel}
                  <X className="w-3.5 h-3.5 ml-1.5" />
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-zinc-400 hover:text-purple-400 transition-colors cursor-pointer ml-1 underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" /> Filters & Sort
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sort Order Radio List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sort Order</h4>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateFilter({ sortBy: opt.value })}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        filters.sortBy === opt.value
                          ? "bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30"
                          : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {filters.sortBy === opt.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 ml-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Genres</h4>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateFilter({ genre: "" })}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                      !filters.genre
                        ? "bg-purple-600/20 text-purple-300 font-medium"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <span>All Genres</span>
                  </button>
                  {allGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => updateFilter({ genre: filters.genre.toLowerCase() === genre.toLowerCase() ? "" : genre })}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        filters.genre.toLowerCase() === genre.toLowerCase()
                          ? "bg-purple-600/20 text-purple-300 font-medium"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      )}
                    >
                      <span>{genre}</span>
                      {filters.genre.toLowerCase() === genre.toLowerCase() && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Minimum Rating</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 7, 8, 9].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateFilter({ minRating: r })}
                      className={cn(
                        "py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center btn-press",
                        filters.minRating === r
                          ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 font-semibold"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      )}
                    >
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Drawer Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex justify-end animate-fade-in">
              <div className="w-5/6 max-w-sm bg-zinc-900 border-l border-zinc-800 h-full p-6 overflow-y-auto space-y-6 animate-slide-left">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-purple-400" /> Filter & Sort Movies
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Sort Options */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sort Order</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateFilter({ sortBy: opt.value })}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between",
                          filters.sortBy === opt.value
                            ? "bg-purple-600 text-white font-medium"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        <span>{opt.label}</span>
                        {filters.sortBy === opt.value && <span className="w-2 h-2 rounded-full bg-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre Filter */}
                <div className="space-y-2 pt-3 border-t border-zinc-800">
                  <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Genre</h4>
                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                    <button
                      onClick={() => updateFilter({ genre: "" })}
                      className={cn(
                        "text-left px-3 py-2 rounded-lg text-xs transition-colors",
                        !filters.genre
                          ? "bg-purple-600 text-white font-medium"
                          : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                      )}
                    >
                      All Genres
                    </button>
                    {allGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => updateFilter({ genre: filters.genre.toLowerCase() === genre.toLowerCase() ? "" : genre })}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg text-xs transition-colors",
                          filters.genre.toLowerCase() === genre.toLowerCase()
                            ? "bg-purple-600 text-white font-medium"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min Rating */}
                <div className="space-y-2 pt-3 border-t border-zinc-800">
                  <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Min Rating</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 7, 8, 9].map((r) => (
                      <button
                        key={r}
                        onClick={() => updateFilter({ minRating: r })}
                        className={cn(
                          "py-2 rounded-lg text-xs font-medium border transition-colors text-center",
                          filters.minRating === r
                            ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                            : "border-zinc-800 bg-zinc-800/50 text-zinc-400"
                        )}
                      >
                        {r === 0 ? "Any" : `${r}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 space-y-2 border-t border-zinc-800">
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-medium"
                  >
                    Show {total} Results
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                    className="w-full text-zinc-400 hover:text-white"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Movies Grid */}
          <main className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse">
                    <div className="aspect-[2/3] bg-zinc-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                      <div className="h-4 bg-zinc-800 rounded w-1/3 pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 animate-fade-in">
                <div className="mb-4 rounded-2xl bg-zinc-800/60 p-5 border border-zinc-700/50">
                  <Film className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No movies match your criteria</h3>
                <p className="text-zinc-400 max-w-md text-sm mb-6">
                  {filters.genre
                    ? `No movies found in the "${filters.genre}" category with your current filters.`
                    : "Try broadening your search or resetting rating and genre filters."}
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 flex items-center gap-2 btn-press"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Filters & View All
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {movies.map((movie, idx) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      rank={(currentPage - 1) * 24 + idx + 1}
                      sortBy={filters.sortBy}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/80">
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                      <span className="font-semibold text-white">{totalPages}</span> ({total} total movies)
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 rounded-xl"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>

                      {/* Page number buttons */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                          let pageNum = currentPage;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={cn(
                                "w-9 h-9 rounded-xl text-xs font-medium transition-colors cursor-pointer",
                                currentPage === pageNum
                                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-bold"
                                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 rounded-xl"
                      >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
