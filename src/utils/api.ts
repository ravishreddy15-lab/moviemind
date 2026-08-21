const API_BASE = "/api";

export interface Movie {
  id: string;
  title: string;
  year: number;
  certificate: string;
  duration: string;
  genre: string[];
  rating: number;
  description: string;
  stars: string[];
  votes: number;
  director: string;
  language: string;
  country: string;
  duration_minutes: number;
  poster?: string;
  matchPercentage?: number;
  recommendationReason?: string;
}

export interface Recommendation {
  movie: Movie;
  match_percentage: number;
  reason: string;
}

export interface QuizAnswers {
  mood: string;
  genres: string[];
  movie_length: string;
  release_period: string;
  imdb_rating: string;
  family_friendly: boolean;
  language: string;
  favorite_actor: string;
  favorite_director: string;
  description: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  return apiFetch("/health");
}

export async function getMovies(page = 1, limit = 20) {
  return apiFetch<{ movies: Movie[]; total: number; page: number; limit: number }>(
    `/movies?page=${page}&limit=${limit}`
  );
}

export async function getMovie(id: string) {
  return apiFetch<{ movie: Movie }>(`/movies/${encodeURIComponent(id)}`);
}

export async function getSimilarMovies(id: string, limit = 10) {
  return apiFetch<{ recommendations: Recommendation[] }>(
    `/movies/${encodeURIComponent(id)}/similar?limit=${limit}`
  );
}

export async function getTrending(limit = 20) {
  return apiFetch<{ movies: Movie[] }>(`/trending?limit=${limit}`);
}

export async function getTopRated(limit = 20) {
  return apiFetch<{ movies: Movie[] }>(`/top-rated?limit=${limit}`);
}

export async function searchMovies(
  q = "",
  genre = "",
  minRating = 0,
  yearFrom = 1900,
  yearTo = 2030,
  sortBy = "relevance"
) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre) params.set("genre", genre);
  if (minRating) params.set("min_rating", String(minRating));
  if (yearFrom > 1900) params.set("year_from", String(yearFrom));
  if (yearTo < 2030) params.set("year_to", String(yearTo));
  if (sortBy !== "relevance") params.set("sort_by", sortBy);
  return apiFetch<{ movies: Movie[]; total: number }>(`/search?${params}`);
}

export async function getRecommendations(params: {
  query?: string;
  genres?: string[];
  mood?: string;
  rating_min?: number;
  year_min?: number;
  year_max?: number;
  duration_min?: string;
  duration_max?: string;
  language?: string;
  family_friendly?: boolean;
  favorite_actor?: string;
  favorite_director?: string;
  free_text?: string;
}) {
  return apiFetch<{ recommendations: Recommendation[] }>("/recommend", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getQuizRecommendations(answers: QuizAnswers) {
  return apiFetch<{ recommendations: Recommendation[] }>("/quiz/recommend", {
    method: "POST",
    body: JSON.stringify(answers),
  });
}

export async function getGenres() {
  return apiFetch<{ genres: string[] }>("/genres");
}

export async function sendChatMessage(message: string, history: Array<{role: string; content: string}> = []) {
  return apiFetch<{ response: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export async function getMoodJourney(moods: string[], moviesPerMood = 2) {
  return apiFetch<{ journey: Array<{mood: string; movie: Movie; reason: string}> }>("/mood-journey", {
    method: "POST",
    body: JSON.stringify({ moods, movies_per_mood: moviesPerMood }),
  });
}

export async function getMoodSuggestions() {
  return apiFetch<{ moods: string[] }>("/mood-journey/suggestions");
}

export async function getStreamingInfo(id: string) {
  return apiFetch<{ platforms: Array<{platform: string; type: string; url: string; color: string}>; movie_title: string }>(
    `/movies/${encodeURIComponent(id)}/streaming`
  );
}

export async function getBadges() {
  return apiFetch<{ badges: Record<string, {name: string; description: string; icon: string; requirement: number}> }>("/gamification/badges");
}

export async function getGamificationStats() {
  return apiFetch<{ stats: {
    movies_viewed: number;
    genres_explored: number;
    quizzes_completed: number;
    searches_made: number;
    likes_given: number;
    watchlist_size: number;
    shares_made: number;
    badges_earned: string[];
    streak_days: number;
    total_rating: number;
  }}>("/gamification/stats");
}

export async function getLeaderboard() {
  return apiFetch<{ leaderboard: Array<{rank: number; name: string; score: number; badges: number}> }>("/gamification/leaderboard");
}
