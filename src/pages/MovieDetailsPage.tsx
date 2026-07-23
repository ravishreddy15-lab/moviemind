import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Calendar, Bookmark, Heart, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { formatNumber } from "@/lib/utils";
import { getMovie, getSimilarMovies, Movie, Recommendation } from "@/utils/api";

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);

    async function fetchData() {
      try {
        const [movieRes, similarRes] = await Promise.all([
          getMovie(id!),
          getSimilarMovies(id!, 4),
        ]);
        setMovie(movieRes.movie);
        setSimilarMovies(similarRes.recommendations);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-72 bg-gradient-to-t from-background via-zinc-900 to-zinc-800 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[2/3] rounded-xl bg-zinc-800/50 animate-pulse" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="h-8 bg-zinc-800/50 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-zinc-800/50 rounded w-1/3 animate-pulse" />
                <div className="h-20 bg-zinc-800/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          icon={ArrowLeft}
          title="Movie not found"
          description="The movie you're looking for doesn't exist or has been removed."
          action={{ label: "Go Home", onClick: () => window.location.href = "/" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-72 bg-gradient-to-t from-background via-zinc-900 to-zinc-800 overflow-hidden"
      >
        {movie.poster && (
          <img
            src={movie.poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="absolute inset-0 flex items-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">{movie.title}</h1>
            <div className="flex items-center gap-3 text-zinc-400">
              <span>{movie.year}</span>
              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300">{movie.certificate}</Badge>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{movie.rating}</span>
                <span>({formatNumber(movie.votes)} votes)</span>
              </div>
            </div>
          </div>
        </div>
        <Link to="/" className="absolute top-4 left-4 sm:left-8">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1"
          >
            <div className="aspect-[2/3] rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 flex items-center justify-center sticky top-24 overflow-hidden">
              {movie.poster ? (
                <img src={movie.poster} alt={`${movie.title} poster`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl font-bold text-zinc-700">{movie.title[0]}</span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 space-y-8"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((g) => (
                  <Badge key={g} variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                    {g}
                  </Badge>
                ))}
              </div>

              <p className="text-zinc-300 leading-relaxed text-base">{movie.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Director</span>
                  <p className="text-white font-medium">{movie.director}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Language</span>
                  <p className="text-white font-medium">{movie.language}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Country</span>
                  <p className="text-white font-medium">{movie.country}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Duration</span>
                  <p className="text-white font-medium">{movie.duration}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Cast</h3>
              <div className="flex flex-wrap gap-2">
                {movie.stars.map((star) => (
                  <div
                    key={star}
                    className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-full px-3 py-1.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {star.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm text-zinc-300">{star}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                <Bookmark className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Why we recommend this</span>
              </div>
              <p className="text-sm text-zinc-400">
                This movie is a top-rated {movie.genre[0]?.toLowerCase()} film with a {movie.rating}/10 IMDb rating and over {formatNumber(movie.votes)} votes. 
                Directed by {movie.director}, it features exceptional performances and has been critically acclaimed worldwide.
              </p>
            </div>
          </motion.div>
        </div>

        {similarMovies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Related Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarMovies.map((rec, i) => (
                <motion.div
                  key={rec.movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/movie/${rec.movie.id}`}>
                    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-purple-500/50 transition-all">
                      <div className="aspect-[2/3] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden relative">
                        {rec.movie.poster ? (
                          <>
                            <img src={rec.movie.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                          </>
                        ) : (
                          <span className="text-4xl font-bold text-zinc-700">{rec.movie.title[0]}</span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">{rec.movie.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{rec.movie.rating}</span>
                          <span>·</span>
                          <span>{rec.movie.year}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
