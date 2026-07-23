import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Sparkles,
  Film,
  Heart,
  RefreshCw,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clapperboard,
  Eye,
  Zap,
  BarChart3,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/movie/HeroSection";
import MovieCard from "@/components/movie/MovieCard";
import GenreBadge from "@/components/movie/GenreBadge";
import { moods, testimonials } from "@/data/movies";
import { cn } from "@/lib/utils";
import { useRef as useRefType } from "react";
import { getTrending, getTopRated, getGenres, Movie } from "@/utils/api";

function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const genreGradients: Record<string, string> = {
  Action: "from-red-500/20 to-orange-500/20",
  Comedy: "from-yellow-500/20 to-amber-500/20",
  Drama: "from-blue-500/20 to-indigo-500/20",
  Horror: "from-gray-700/40 to-red-900/20",
  "Sci-Fi": "from-cyan-500/20 to-blue-500/20",
  Romance: "from-pink-500/20 to-rose-500/20",
  Thriller: "from-purple-500/20 to-gray-800/20",
  Animation: "from-green-400/20 to-emerald-500/20",
  Adventure: "from-emerald-500/20 to-teal-500/20",
  Crime: "from-slate-500/20 to-zinc-700/20",
  Mystery: "from-violet-500/20 to-purple-800/20",
  Fantasy: "from-fuchsia-500/20 to-pink-500/20",
  War: "from-stone-500/20 to-amber-800/20",
  Biography: "from-teal-500/20 to-cyan-700/20",
  History: "from-amber-600/20 to-yellow-800/20",
  Family: "from-sky-400/20 to-blue-400/20",
  Music: "from-indigo-400/20 to-purple-500/20",
  Western: "from-orange-600/20 to-yellow-700/20",
};

const howItWorks = [
  {
    icon: <Clapperboard className="w-7 h-7" />,
    title: "Take the Quiz",
    description: "Answer a few questions about your taste, mood, and preferences. Our quiz is fun, quick, and designed to truly understand what you love.",
    step: 1,
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI Analyzes",
    description: "Our advanced AI processes your answers, cross-references thousands of movies, and identifies patterns that match your unique taste profile.",
    step: 2,
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "Get Recommendations",
    description: "Receive personalized movie picks curated just for you. Each recommendation comes with a match percentage and explanation.",
    step: 3,
  },
];

const features = [
  { icon: <Brain className="w-6 h-6" />, title: "AI-Powered Recommendations", description: "Machine learning algorithms analyze your preferences for spot-on suggestions." },
  { icon: <Eye className="w-6 h-6" />, title: "Smart Mood Detection", description: "We match movies to your current mood and emotional state for perfect timing." },
  { icon: <Film className="w-6 h-6" />, title: "Genre Analysis", description: "Deep genre profiling goes beyond labels to understand sub-genres and themes." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Personalized Matching", description: "The more you use MovieMind, the smarter your recommendations become." },
  { icon: <Zap className="w-6 h-6" />, title: "Real-time Updates", description: "Stay current with trending movies and freshly released gems in real time." },
  { icon: <ListChecks className="w-6 h-6" />, title: "Watchlist Management", description: "Save, organize, and track movies you want to watch across all your devices." },
];

const genreColors: Record<string, string> = {
  Action: "bg-red-500/10 text-red-400 border-red-500/20",
  Comedy: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Drama: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Horror: "bg-red-900/20 text-red-300 border-red-700/20",
  "Sci-Fi": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Romance: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Thriller: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Animation: "bg-green-400/10 text-green-400 border-green-500/20",
  Adventure: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Crime: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Mystery: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Fantasy: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  War: "bg-stone-500/10 text-stone-400 border-stone-500/20",
  Biography: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  History: "bg-amber-600/10 text-amber-400 border-amber-600/20",
  Family: "bg-sky-400/10 text-sky-400 border-sky-400/20",
  Music: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
  Western: "bg-orange-600/10 text-orange-400 border-orange-600/20",
};

function HorizontalScrollRow({
  title,
  subtitle,
  moviesList,
  viewAllLink,
  loading,
}: {
  title: string;
  subtitle?: string;
  moviesList: Movie[];
  viewAllLink: string;
  loading?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-none w-[220px]">
              <div className="rounded-xl bg-zinc-800/50 animate-pulse">
                <div className="aspect-[2/3] bg-zinc-700/50 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-zinc-700/50 rounded w-3/4" />
                  <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border hover:border-primary/50 hover:bg-primary/10"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border hover:border-primary/50 hover:bg-primary/10"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Link to={viewAllLink}>
            <Button variant="ghost" className="text-primary hover:text-primary-light ml-2">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {moviesList.map((movie, i) => (
          <div key={movie.id} className="flex-none w-[220px] snap-start">
            <MovieCard movie={movie} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, topRatedRes, genresRes] = await Promise.all([
          getTrending(12),
          getTopRated(12),
          getGenres(),
        ]);
        setTrendingMovies(trendingRes.movies);
        setTopRatedMovies(topRatedRes.movies);
        setAllGenres(genresRes.genres);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const uniqueGenres = allGenres;

  return (
    <main className="bg-background min-h-screen">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-16">
        <AnimatedSection>
          <HorizontalScrollRow
            title="Trending Now"
            subtitle="Most popular movies this week"
            moviesList={trendingMovies}
            viewAllLink="/search"
            loading={loading}
          />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <HorizontalScrollRow
            title="Top Rated"
            subtitle="Critically acclaimed masterpieces"
            moviesList={topRatedMovies}
            viewAllLink="/search"
            loading={loading}
          />
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Popular Genres</h2>
            <p className="text-muted-foreground mt-2">
              Explore movies by genre and discover new favorites
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-zinc-800/50 animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uniqueGenres.map((genre, i) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link to={`/search?genre=${encodeURIComponent(genre)}`}>
                    <Card
                      className={cn(
                        "group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden",
                        "bg-gradient-to-br",
                        genreGradients[genre] || "from-gray-500/20 to-gray-700/20"
                      )}
                    >
                      <CardContent className="p-5 text-center">
                        <Film className="w-8 h-8 mx-auto mb-3 text-white/70 group-hover:text-primary transition-colors" />
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                          {genre}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="text-muted-foreground mt-2">
              Three simple steps to find your next favorite movie
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 text-center h-full">
                  <CardContent className="p-8">
                    <div className="relative inline-flex mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Features</h2>
            <p className="text-muted-foreground mt-2">
              Everything you need for the perfect movie night
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">What People Say</h2>
            <p className="text-muted-foreground mt-2">
              Trusted by thousands of movie enthusiasts
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-secondary/10 overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none" />
              <div className="relative z-10">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to find your next favorite movie?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Take a quick quiz and let our AI find the perfect movies tailored just for you.
                </p>
                <Link to="/quiz">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start the Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </main>
  );
}
