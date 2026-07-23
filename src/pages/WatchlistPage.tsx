import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Heart, Clock, Film, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { movies } from "@/data/movies";

const watchlistMovies = movies.slice(0, 6);
const likedMovies = movies.slice(6, 10);
const recentMovies = movies.slice(10, 13);

function MovieGrid({ items }: { items: typeof movies }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((movie, i) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Link to={`/movie/${movie.id}`}>
            <div className="group rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
              <div className="aspect-[2/3] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
                <span className="text-5xl font-bold text-zinc-700 group-hover:text-zinc-600 transition-colors">
                  {movie.title[0]}
                </span>
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white font-medium">{movie.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                  {movie.title}
                </h3>
                <p className="text-xs text-zinc-500">{movie.year} · {movie.duration}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white">My Collection</h1>
          <p className="text-zinc-400 mt-1">Your saved movies and viewing history</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="watchlist" className="space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
                <Bookmark className="w-4 h-4 mr-2" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="liked" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
                <Heart className="w-4 h-4 mr-2" />
                Liked
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400">
                <Clock className="w-4 h-4 mr-2" />
                Recently Viewed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist">
              {watchlistMovies.length > 0 ? (
                <MovieGrid items={watchlistMovies} />
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="Your watchlist is empty"
                  description="Start adding movies you want to watch later."
                />
              )}
            </TabsContent>

            <TabsContent value="liked">
              {likedMovies.length > 0 ? (
                <MovieGrid items={likedMovies} />
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No liked movies yet"
                  description="Like movies to keep track of your favorites."
                />
              )}
            </TabsContent>

            <TabsContent value="recent">
              {recentMovies.length > 0 ? (
                <MovieGrid items={recentMovies} />
              ) : (
                <EmptyState
                  icon={Clock}
                  title="No recently viewed movies"
                  description="Start browsing to build your viewing history."
                />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
