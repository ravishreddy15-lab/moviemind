import { motion } from "framer-motion";
import type { Movie } from "@/utils/api";
import MovieCard from "./MovieCard";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function MovieGrid({ movies, loading = false }: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-zinc-800 animate-pulse h-80"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <p className="text-lg font-medium">No movies found</p>
        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {movies.map((movie) => (
        <motion.div key={movie.id} variants={item}>
          <MovieCard movie={movie} />
        </motion.div>
      ))}
    </motion.div>
  );
}
