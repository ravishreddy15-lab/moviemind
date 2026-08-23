import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import {
  getAllMovies,
  getMovieById,
  getSimilarMovies,
  getStreamingPlatforms,
  searchMovies,
  getPersonalizedRecommendations,
  getQuizRecommendations,
  getMoodJourney
} from "./server/services/movieRecommender";
import {
  isTmdbConfigured,
  getTmdbDiscoverMovies,
  getTmdbTopRated,
  getTmdbTrending,
  searchTmdbMovies,
  getTmdbMovieDetails,
  getTmdbStreamingProviders,
  getTmdbSimilarMovies
} from "./server/services/tmdbService";
import { processChat } from "./server/services/chatService";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(cors());
  app.use(express.json());

  // Health check & TMDB Status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      tmdb_connected: isTmdbConfigured(),
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/tmdb/status", (req, res) => {
    const configured = isTmdbConfigured();
    res.json({
      configured,
      total_movies_accessible: configured ? 8500 : getAllMovies().length,
      mode: configured ? "live_tmdb_api" : "curated_catalog",
      message: configured
        ? "Connected to TMDB API (8,200+ movies ready to explore)"
        : "Curated local database active. Provide TMDB_API_KEY to unlock 8,200+ live movies."
    });
  });

  // Genres
  app.get("/api/genres", (req, res) => {
    const genres = [
      "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
      "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
      "Music", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
    ].sort();
    res.json({ genres });
  });

  // Movies list & pagination (supports up to 8,200+ movies across pages)
  app.get("/api/movies", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (isTmdbConfigured()) {
      const tmdbData = await getTmdbDiscoverMovies({ page, sort_by: "votes" });
      if (tmdbData && tmdbData.movies.length > 0) {
        return res.json(tmdbData);
      }
    }

    // Local fallback
    const offset = (page - 1) * limit;
    const { movies, total } = searchMovies({ limit, offset });
    res.json({
      movies,
      total,
      page,
      total_pages: Math.ceil(total / limit)
    });
  });

  // Trending movies
  app.get("/api/trending", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 12;

    if (isTmdbConfigured()) {
      const trending = await getTmdbTrending(1);
      if (trending && trending.length > 0) {
        return res.json({ movies: trending.slice(0, limit) });
      }
    }

    const { movies } = searchMovies({ sort_by: "votes", limit });
    res.json({ movies });
  });

  // Top rated movies
  app.get("/api/top-rated", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 12;

    if (isTmdbConfigured()) {
      const topRated = await getTmdbTopRated(1);
      if (topRated && topRated.length > 0) {
        return res.json({ movies: topRated.slice(0, limit) });
      }
    }

    const { movies } = searchMovies({ sort_by: "rating", limit });
    res.json({ movies });
  });

  // Search movies (Live TMDB search across 8,200+ movies or filter discovery)
  app.get("/api/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    const genre = req.query.genre as string;
    const min_rating = req.query.min_rating ? parseFloat(req.query.min_rating as string) : undefined;
    const year_from = req.query.year_from ? parseInt(req.query.year_from as string) : undefined;
    const year_to = req.query.year_to ? parseInt(req.query.year_to as string) : undefined;
    const sort_by = (req.query.sort_by as string) || (req.query.sortBy as string) || "relevance";
    const page = parseInt(req.query.page as string) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 24;
    const offset = (page - 1) * limit;

    if (isTmdbConfigured()) {
      if (query) {
        const searchResult = await searchTmdbMovies(query, page);
        if (searchResult && searchResult.movies.length > 0) {
          let filtered = searchResult.movies;
          if (genre && genre !== "All") {
            filtered = filtered.filter((m) => m.genre.some((g) => g.toLowerCase() === genre.toLowerCase()));
          }
          if (min_rating) {
            filtered = filtered.filter((m) => m.rating >= min_rating);
          }
          if (year_from) {
            filtered = filtered.filter((m) => m.year >= year_from);
          }
          if (year_to) {
            filtered = filtered.filter((m) => m.year <= year_to);
          }

          if (sort_by === "rating") {
            filtered.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
          } else if (sort_by === "rating_asc") {
            filtered.sort((a, b) => a.rating - b.rating || a.votes - b.votes);
          } else if (sort_by === "year") {
            filtered.sort((a, b) => b.year - a.year || b.rating - a.rating);
          } else if (sort_by === "oldest" || sort_by === "year_asc") {
            filtered.sort((a, b) => a.year - b.year || b.rating - a.rating);
          } else if (sort_by === "votes" || sort_by === "popularity") {
            filtered.sort((a, b) => b.votes - a.votes || b.rating - a.rating);
          } else if (sort_by === "title") {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
          } else if (sort_by === "title_desc") {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
          }

          return res.json({
            movies: filtered,
            results: filtered,
            total: searchResult.total,
            page,
            query
          });
        }
      } else {
        const discoverResult = await getTmdbDiscoverMovies({
          page,
          genre,
          min_rating,
          year_from,
          year_to,
          sort_by
        });
        if (discoverResult && discoverResult.movies.length > 0) {
          return res.json({
            movies: discoverResult.movies,
            results: discoverResult.movies,
            total: discoverResult.total,
            page,
            total_pages: discoverResult.total_pages,
            query: ""
          });
        }
      }
    }

    // Local search fallback
    const { movies, total } = searchMovies({
      query,
      genre,
      min_rating,
      year_from,
      year_to,
      sort_by: sort_by as any,
      limit,
      offset
    });

    res.json({
      movies,
      results: movies,
      total,
      page,
      query: query || ""
    });
  });

  // Single movie details
  app.get("/api/movies/:id", async (req, res) => {
    const movieId = req.params.id;

    // First check local DB
    const localMovie = getMovieById(movieId);
    if (localMovie) {
      return res.json({ movie: localMovie });
    }

    // If TMDB is configured or ID is TMDB ID
    if (isTmdbConfigured() || movieId.startsWith("tmdb-") || /^\d+$/.test(movieId)) {
      const tmdbMovie = await getTmdbMovieDetails(movieId);
      if (tmdbMovie) {
        return res.json({ movie: tmdbMovie });
      }
    }

    res.status(404).json({ error: "Movie not found" });
  });

  // Similar movies
  app.get("/api/movies/:id/similar", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 6;
    const movieId = req.params.id;

    if (isTmdbConfigured() || movieId.startsWith("tmdb-")) {
      const tmdbSimilar = await getTmdbSimilarMovies(movieId, limit);
      if (tmdbSimilar && tmdbSimilar.length > 0) {
        return res.json({
          movie_id: movieId,
          recommendations: tmdbSimilar.map((m, idx) => ({
            movie: m,
            match_percentage: Math.max(78, 98 - idx * 4),
            reason: `Shares thematic elements, tone, and director style with ${m.title}.`
          }))
        });
      }
    }

    const movie = getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    const recommendations = getSimilarMovies(movieId, limit);
    res.json({
      movie_id: movieId,
      recommendations
    });
  });

  // Streaming info (real-time watch providers)
  app.get("/api/movies/:id/streaming", async (req, res) => {
    const movieId = req.params.id;

    if (isTmdbConfigured() || movieId.startsWith("tmdb-")) {
      const tmdbProviders = await getTmdbStreamingProviders(movieId);
      if (tmdbProviders && tmdbProviders.length > 0) {
        return res.json({
          movie_id: movieId,
          platforms: tmdbProviders
        });
      }
    }

    const platforms = getStreamingPlatforms(movieId);
    res.json({
      movie_id: movieId,
      platforms
    });
  });

  // Multi-criteria recommendations
  app.post("/api/recommend", async (req, res) => {
    const {
      mood,
      genres,
      preferred_genres,
      max_runtime,
      duration_min,
      duration_max,
      query,
      rating_min,
      year_min,
      year_max,
      favorite_actor,
      favorite_director,
      count
    } = req.body || {};

    const recommendations = getPersonalizedRecommendations({
      mood,
      genres: genres || preferred_genres,
      max_runtime: max_runtime || (duration_max ? parseInt(duration_max) : undefined),
      query,
      rating_min,
      year_min,
      year_max,
      favorite_actor,
      favorite_director,
      count: count || 12
    });

    res.json({
      recommendations,
      total: recommendations.length
    });
  });

  // Quiz recommendations
  app.post("/api/quiz/recommend", (req, res) => {
    const body = req.body || {};
    const answers = body.answers || body;
    const recommendations = getQuizRecommendations(answers);
    res.json({
      recommendations,
      explanation: "Tailored to your mood, pace, and cinematic taste preferences."
    });
  });

  // AI Chat Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body || {};
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message string is required" });
      }
      const response = await processChat(message, history || []);
      res.json({
        response: response.reply,
        reply: response.reply,
        suggested_movies: response.suggested_movies,
        quick_actions: response.quick_actions
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Failed to process chat message", details: err?.message });
    }
  });

  // Mood journey
  app.post("/api/mood-journey", (req, res) => {
    const { moods, start_mood, target_mood, movies_per_mood } = req.body || {};
    const result = getMoodJourney(
      moods || [start_mood, target_mood].filter(Boolean),
      movies_per_mood || 2
    );
    res.json(result);
  });

  app.get("/api/mood-journey/suggestions", (req, res) => {
    const moodList = [
      "happy", "sad", "excited", "scary", "romantic", "thoughtful",
      "adventurous", "dramatic", "curious", "nostalgic", "inspired", "calm", "tense", "magical"
    ];
    res.json({
      moods: moodList,
      starting_moods: moodList.slice(0, 5),
      target_moods: moodList.slice(5, 10)
    });
  });

  // Gamification endpoints
  app.get("/api/gamification/badges", (req, res) => {
    res.json({
      badges: {
        "cinephile-initiate": { name: "Cinephile Initiate", description: "Explored 5 critically acclaimed films", icon: "Film", requirement: 5 },
        "nolan-scholar": { name: "Nolan Scholar", description: "Watched or saved Christopher Nolan masterpieces", icon: "Brain", requirement: 3 },
        "genre-explorer": { name: "Genre Explorer", description: "Explored films across 5 distinct genres", icon: "Compass", requirement: 5 },
        "night-owl": { name: "Midnight Screenings", description: "Engaged with the AI recommender late night", icon: "Moon", requirement: 1 },
        "taste-master": { name: "Taste Master", description: "Completed the cinema quiz and rated 10 movies", icon: "Sparkles", requirement: 10 },
        "first-steps": { name: "First Steps", description: "View your first movie", icon: "Film", requirement: 1 },
        "explorer": { name: "Explorer", description: "View 10 movies", icon: "Compass", requirement: 10 },
        "night-owl-badge": { name: "Night Owl", description: "View 25 movies", icon: "Moon", requirement: 25 },
        "binge-watcher": { name: "Binge Watcher", description: "View 50 movies", icon: "Popcorn", requirement: 50 },
        "curator": { name: "Curator", description: "Add 5 movies to watchlist", icon: "Bookmark", requirement: 5 },
        "critic": { name: "Critic", description: "Like 5 movies", icon: "Star", requirement: 5 },
        "connoisseur": { name: "Connoisseur", description: "Like 15 movies", icon: "Award", requirement: 15 },
        "genre-master": { name: "Genre Master", description: "Explore 15 genres", icon: "Theater", requirement: 15 },
        "quiz-pro": { name: "Quiz Pro", description: "Complete a quiz", icon: "FileText", requirement: 1 },
      }
    });
  });

  app.get("/api/gamification/stats", (req, res) => {
    res.json({
      stats: {
        movies_viewed: 0,
        genres_explored: 0,
        quizzes_completed: 0,
        searches_made: 0,
        likes_given: 0,
        watchlist_size: 0,
        shares_made: 0,
        badges_earned: [],
        streak_days: 0,
        total_rating: 0,
      }
    });
  });

  app.get("/api/gamification/leaderboard", (req, res) => {
    res.json({
      leaderboard: [
        { rank: 1, name: "CinemaVirtuoso", score: 2840, badges: 5 },
        { rank: 2, name: "FilmBuff_99", score: 2410, badges: 4 },
        { rank: 3, name: "MovieMindExplorer", score: 1950, badges: 3 },
        { rank: 4, name: "SciFiVoyager", score: 1620, badges: 2 }
      ]
    });
  });

  // Vite middleware for development or Static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MovieMind AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
