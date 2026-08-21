import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, Eye, Trash2, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { getWatchlist, removeFromWatchlist, getLiked, toggleLiked, getViewed, setViewedGenres } from "@/utils/watchlist";
import { getMovie, Movie } from "@/utils/api";

export default function WatchlistPage() {
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [viewedMovies, setViewedMovies] = useState<Movie[]>([]);

  const loadData = async () => {
    const wIds = getWatchlist();
    const lIds = getLiked();
    const vIds = getViewed();
    const wMovies = (await Promise.all(wIds.map(async (id) => { try { return (await getMovie(id)).movie; } catch { return null; } }))).filter(Boolean) as Movie[];
    const lMovies = (await Promise.all(lIds.map(async (id) => { try { return (await getMovie(id)).movie; } catch { return null; } }))).filter(Boolean) as Movie[];
    const vMovies = (await Promise.all(vIds.map(async (id) => { try { return (await getMovie(id)).movie; } catch { return null; } }))).filter(Boolean) as Movie[];
    vMovies.forEach((m) => { if (m.genre?.length) setViewedGenres(m.id, m.genre); });
    setWatchlistMovies(wMovies);
    setLikedMovies(lMovies);
    setViewedMovies(vMovies);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { window.addEventListener("moviemind-data-changed", loadData); return () => window.removeEventListener("moviemind-data-changed", loadData); }, []);

  const removeWatchlist = (id: string) => { removeFromWatchlist(id); setWatchlistMovies((prev) => prev.filter((m) => m.id !== id)); };
  const removeLiked = (id: string) => { toggleLiked(id); setLikedMovies((prev) => prev.filter((m) => m.id !== id)); };

  const renderCard = (movie: Movie, onRemove?: () => void) => (
    <div key={movie.id} className="group relative rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-purple-500/50 transition-all duration-200 animate-fade-in-up">
      <Link to={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
          {movie.poster ? (<img src={movie.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />) : (<span className="text-5xl font-bold text-zinc-700">{movie.title?.[0]}</span>)}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white font-medium">{movie.rating}</span>
          </div>
        </div>
      </Link>
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/movie/${movie.id}`}><h3 className="text-sm font-semibold text-white hover:text-purple-400 transition-colors line-clamp-1">{movie.title}</h3></Link>
          <p className="text-xs text-zinc-500">{movie.year}</p>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors btn-press" title="Remove">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="animate-fade-in-down">
          <h1 className="text-3xl font-bold text-white">My Collection</h1>
          <p className="text-zinc-400 mt-1">Your saved movies and viewing history</p>
        </div>
        <div className="animate-fade-in-up stagger-1">
          <Tabs defaultValue="watchlist" className="space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
                <Bookmark className="w-4 h-4 mr-2" /> Watchlist ({watchlistMovies.length})
              </TabsTrigger>
              <TabsTrigger value="liked" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
                <Heart className="w-4 h-4 mr-2" /> Liked ({likedMovies.length})
              </TabsTrigger>
              <TabsTrigger value="viewed" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
                <Eye className="w-4 h-4 mr-2" /> Viewed ({viewedMovies.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="watchlist">
              {watchlistMovies.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{watchlistMovies.map((m) => renderCard(m, () => removeWatchlist(m.id)))}</div> : <EmptyState icon={Bookmark} title="Your watchlist is empty" description="Click the bookmark icon on any movie to add it here." />}
            </TabsContent>
            <TabsContent value="liked">
              {likedMovies.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{likedMovies.map((m) => renderCard(m, () => removeLiked(m.id)))}</div> : <EmptyState icon={Heart} title="No liked movies yet" description="Click the heart icon on any movie to like it." />}
            </TabsContent>
            <TabsContent value="viewed">
              {viewedMovies.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{viewedMovies.map((m) => renderCard(m))}</div> : <EmptyState icon={Eye} title="No viewed movies yet" description="Click 'Mark as Viewed' on any movie to track it here." />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
