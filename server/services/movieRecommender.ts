import { MOVIES_DATABASE, ServerMovie, STREAMING_PROVIDERS_MAP, StreamingPlatform } from "../data/moviesData";

export interface RecommendationResult {
  movie: ServerMovie;
  match_percentage: number;
  reason: string;
  similar_attributes?: string[];
}

export function getAllMovies(): ServerMovie[] {
  return MOVIES_DATABASE;
}

export function getMovieById(idOrSlug: string): ServerMovie | undefined {
  const norm = idOrSlug.toLowerCase().trim();
  return MOVIES_DATABASE.find(
    (m) => m.id === norm || m.title.toLowerCase() === norm || m.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === norm
  );
}

export function getStreamingPlatforms(idOrSlug: string): StreamingPlatform[] {
  const movie = getMovieById(idOrSlug);
  if (!movie) return [];
  return STREAMING_PROVIDERS_MAP[movie.id] || [
    { platform: "Amazon Prime Video", type: "Subscription", url: "https://www.amazon.com/Prime-Video", color: "#00A8E1", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
    { platform: "Apple TV", type: "Rent", url: "https://tv.apple.com", color: "#555555", logo: "https://image.tmdb.org/t/p/original/SPnB1qiCkYfirS2it3hZORwGVn.jpg" }
  ];
}

export function getSimilarMovies(idOrSlug: string, count: number = 6): RecommendationResult[] {
  const target = getMovieById(idOrSlug);
  if (!target) return [];

  const others = MOVIES_DATABASE.filter((m) => m.id !== target.id);
  const scored = others.map((movie) => {
    let score = 0;
    const reasons: string[] = [];

    // Genre overlap
    const sharedGenres = movie.genre.filter((g) => target.genre.includes(g));
    if (sharedGenres.length > 0) {
      score += sharedGenres.length * 30;
      reasons.push(`Shared ${sharedGenres.join(", ")} vibes`);
    }

    // Director match
    if (movie.director === target.director) {
      score += 40;
      reasons.push(`Directed by ${movie.director}`);
    }

    // Star overlap
    const sharedStars = movie.stars.filter((s) => target.stars.includes(s));
    if (sharedStars.length > 0) {
      score += 25;
      reasons.push(`Starring ${sharedStars[0]}`);
    }

    // Rating proximity
    const ratingDiff = Math.abs(movie.rating - target.rating);
    if (ratingDiff < 0.5) score += 15;

    // Decade proximity
    const decadeDiff = Math.abs(movie.year - target.year);
    if (decadeDiff <= 5) score += 10;
    else if (decadeDiff <= 10) score += 5;

    // Compute percentage
    const match_percentage = Math.min(99, Math.max(70, Math.round(70 + (score / 120) * 28)));
    const reason = reasons.length > 0
      ? `Matches ${target.title} due to ${reasons.join(", ")}.`
      : `Recommended based on critically acclaimed rating (${movie.rating}/10) and narrative depth.`;

    return {
      movie,
      match_percentage,
      reason,
      similar_attributes: reasons
    };
  });

  scored.sort((a, b) => b.match_percentage - a.match_percentage);
  return scored.slice(0, count);
}

export function searchMovies(params: {
  query?: string;
  genre?: string;
  min_rating?: number;
  year_from?: number;
  year_to?: number;
  sort_by?: "rating" | "rating_asc" | "year" | "oldest" | "year_asc" | "votes" | "popularity" | "title" | "title_desc" | "relevance";
  limit?: number;
  offset?: number;
}): { movies: ServerMovie[]; total: number } {
  let list = [...MOVIES_DATABASE];

  if (params.query) {
    const q = params.query.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.stars.some((s) => s.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q)
    );

    // If sorting by relevance or no specific sort, prioritize closest title match
    if (!params.sort_by || params.sort_by === "relevance") {
      list.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aExact = aTitle === q ? 100 : aTitle.startsWith(q) ? 50 : aTitle.includes(q) ? 25 : 0;
        const bExact = bTitle === q ? 100 : bTitle.startsWith(q) ? 50 : bTitle.includes(q) ? 25 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return b.rating - a.rating;
      });
    }
  }

  if (params.genre && params.genre !== "All") {
    list = list.filter((m) => m.genre.some((g) => g.toLowerCase() === params.genre!.toLowerCase()));
  }

  if (params.min_rating) {
    list = list.filter((m) => m.rating >= params.min_rating!);
  }

  if (params.year_from) {
    list = list.filter((m) => m.year >= params.year_from!);
  }

  if (params.year_to) {
    list = list.filter((m) => m.year <= params.year_to!);
  }

  // Handle explicit sort criteria
  const sortBy = params.sort_by;
  if (sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
  } else if (sortBy === "rating_asc") {
    list.sort((a, b) => a.rating - b.rating || a.votes - b.votes);
  } else if (sortBy === "year") {
    list.sort((a, b) => b.year - a.year || b.rating - a.rating);
  } else if (sortBy === "oldest" || sortBy === "year_asc") {
    list.sort((a, b) => a.year - b.year || b.rating - a.rating);
  } else if (sortBy === "votes" || sortBy === "popularity") {
    list.sort((a, b) => b.votes - a.votes || b.rating - a.rating);
  } else if (sortBy === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "title_desc") {
    list.sort((a, b) => b.title.localeCompare(a.title));
  } else if (!params.query) {
    // Default relevance / featured mix: balance rating and popularity
    list.sort((a, b) => (b.rating * 100000 + b.votes / 100) - (a.rating * 100000 + a.votes / 100));
  }

  const total = list.length;
  const offset = params.offset || 0;
  const limit = params.limit || 20;
  const paged = list.slice(offset, offset + limit);

  return { movies: paged, total };
}

const MOOD_TO_GENRES: Record<string, string[]> = {
  happy: ["Comedy", "Animation", "Family"],
  sad: ["Drama"],
  excited: ["Action", "Adventure", "Thriller"],
  scary: ["Horror", "Thriller"],
  romantic: ["Romance", "Drama"],
  thoughtful: ["Drama", "Sci-Fi", "Mystery"],
  adventurous: ["Adventure", "Action", "Fantasy"],
  dramatic: ["Drama", "War", "Biography"],
  curious: ["Mystery", "Sci-Fi", "Thriller"],
  nostalgic: ["Drama", "Romance", "Comedy"],
  inspired: ["Biography", "Drama", "History"],
  calm: ["Drama", "Animation", "Family"],
  tense: ["Thriller", "Crime", "Mystery"],
  magical: ["Fantasy", "Adventure", "Family"],
};

export const AVAILABLE_MOODS = Object.keys(MOOD_TO_GENRES);

export function getPersonalizedRecommendations(params: {
  mood?: string;
  genres?: string[];
  max_runtime?: number;
  query?: string;
  rating_min?: number;
  year_min?: number;
  year_max?: number;
  tempo?: string;
  favorite_actor?: string;
  favorite_director?: string;
  count?: number;
}): RecommendationResult[] {
  const count = params.count || 12;
  const targetGenres = (params.genres || []).map((g) => g.toLowerCase().trim()).filter(Boolean);
  const targetMood = (params.mood || "").toLowerCase().trim();

  // Map mood words to related genres and thematic tags
  const moodMatchedGenres: string[] = [];
  if (targetMood) {
    for (const [mKey, gList] of Object.entries(MOOD_TO_GENRES)) {
      if (targetMood.includes(mKey) || mKey.includes(targetMood)) {
        moodMatchedGenres.push(...gList.map((g) => g.toLowerCase()));
      }
    }
  }

  const scoredMovies = MOVIES_DATABASE.map((movie) => {
    let score = 40; // baseline score
    const reasons: string[] = [];
    const movieGenresLower = movie.genre.map((g) => g.toLowerCase());

    // 1. Direct genre match
    if (targetGenres.length > 0) {
      const directMatches = movie.genre.filter((g) => targetGenres.includes(g.toLowerCase()));
      if (directMatches.length > 0) {
        score += directMatches.length * 28;
        reasons.push(`matches selected genre (${directMatches.join(", ")})`);
      }
    }

    // 2. Mood & thematic match
    if (targetMood) {
      const moodMatches = movie.genre.filter((g) => moodMatchedGenres.includes(g.toLowerCase()));
      if (moodMatches.length > 0) {
        score += moodMatches.length * 18;
        reasons.push(`aligns with your "${targetMood}" mood`);
      }

      if (targetMood.includes("mind") || targetMood.includes("thought") || targetMood.includes("deep")) {
        if (movieGenresLower.includes("sci-fi") || movieGenresLower.includes("mystery") || movie.director === "Christopher Nolan") {
          score += 25;
          reasons.push("features deep philosophical twists");
        }
      } else if (targetMood.includes("thrill") || targetMood.includes("intense") || targetMood.includes("action") || targetMood.includes("fast")) {
        if (movieGenresLower.includes("action") || movieGenresLower.includes("thriller") || movieGenresLower.includes("crime")) {
          score += 25;
          reasons.push("delivers heart-pounding intensity");
        }
      } else if (targetMood.includes("feel-good") || targetMood.includes("happy") || targetMood.includes("laugh") || targetMood.includes("light")) {
        if (movieGenresLower.includes("animation") || movieGenresLower.includes("comedy") || movieGenresLower.includes("family") || movieGenresLower.includes("romance")) {
          score += 25;
          reasons.push("uplifting, heartwarming story");
        }
      } else if (targetMood.includes("dark") || targetMood.includes("scare") || targetMood.includes("gritty")) {
        if (movieGenresLower.includes("crime") || movieGenresLower.includes("horror") || movieGenresLower.includes("mystery")) {
          score += 25;
          reasons.push("captivating dark atmospheric tension");
        }
      }
    }

    // 3. Tempo / Runtime compatibility
    if (params.tempo) {
      const t = params.tempo.toLowerCase();
      if (t.includes("fast") && movie.duration_minutes <= 130) {
        score += 15;
        reasons.push("briskly paced runtime");
      } else if (t.includes("slow") || t.includes("epic") || t.includes("deep")) {
        if (movie.duration_minutes > 140) {
          score += 15;
          reasons.push("expansive, epic story structure");
        }
      }
    }

    if (params.max_runtime && movie.duration_minutes <= params.max_runtime) {
      score += 10;
    }

    // 4. Rating & Critical Acclaim bonus
    if (params.rating_min && movie.rating >= params.rating_min) {
      score += 15;
    }
    score += (movie.rating - 7.0) * 8;

    // 5. Query matching
    if (params.query) {
      const q = params.query.toLowerCase();
      if (movie.title.toLowerCase().includes(q)) score += 45;
      if (movie.director.toLowerCase().includes(q)) score += 35;
      if (movie.description.toLowerCase().includes(q)) score += 20;
    }

    if (params.favorite_director && movie.director.toLowerCase().includes(params.favorite_director.toLowerCase())) {
      score += 35;
      reasons.push(`directed by ${movie.director}`);
    }

    if (params.favorite_actor && movie.stars.some((s) => s.toLowerCase().includes(params.favorite_actor!.toLowerCase()))) {
      score += 30;
      reasons.push(`starring ${params.favorite_actor}`);
    }

    const match_percentage = Math.min(99, Math.max(76, Math.round(score)));
    const reason = reasons.length > 0
      ? `Strong recommendation: ${reasons.slice(0, 2).join(" and ")}.`
      : `Acclaimed pick (${movie.rating}/10) directed by ${movie.director}.`;

    return { movie, match_percentage, reason, score };
  });

  // Sort descending by score
  scoredMovies.sort((a, b) => b.score - a.score);

  // Return the requested count
  return scoredMovies.slice(0, count).map(({ movie, match_percentage, reason }) => ({
    movie,
    match_percentage,
    reason
  }));
}

export function getQuizRecommendations(answers: any): RecommendationResult[] {
  const mood = answers.mood || (Array.isArray(answers.moods) ? answers.moods[0] : "") || "";
  const genres = Array.isArray(answers.genres)
    ? answers.genres
    : typeof answers.genres === "string"
    ? answers.genres.split(",").filter(Boolean)
    : [];
  const pacing = answers.pace || answers.pacing || "";
  const style = answers.style || "";
  const length = answers.length || "";

  let maxRuntime: number | undefined;
  if (length.includes("90") || length.includes("short") || length.includes("Under")) {
    maxRuntime = 110;
  } else if (length.includes("120") || length.includes("standard")) {
    maxRuntime = 135;
  }

  return getPersonalizedRecommendations({
    mood: `${mood} ${style}`,
    genres,
    tempo: pacing,
    max_runtime: maxRuntime,
    count: 16
  });
}

export function getMoodJourney(
  moodsOrStart: string[] | string,
  targetOrLimit?: string | number,
  limitSteps?: number
): {
  journey: Array<{
    mood: string;
    movie: ServerMovie;
    reason: string;
  }>;
} {
  const moodsList = Array.isArray(moodsOrStart)
    ? moodsOrStart
    : [moodsOrStart, typeof targetOrLimit === "string" ? targetOrLimit : ""].filter(Boolean);

  if (moodsList.length === 0) {
    moodsList.push("happy", "thoughtful");
  }

  const allMoodGenres: string[] = [];
  moodsList.forEach((mood) => {
    const genres = MOOD_TO_GENRES[mood.toLowerCase()] || ["Drama", "Adventure"];
    allMoodGenres.push(...genres);
  });

  const uniqueMoodGenres = Array.from(new Set(allMoodGenres));
  const candidates = MOVIES_DATABASE.map((m) => {
    const movieGenres = m.genre;
    const overlap = movieGenres.filter((g) => uniqueMoodGenres.includes(g)).length;
    let score = overlap * 0.4 + (m.rating || 7.0) * 0.08;

    const matchedMoods = moodsList.filter((mood) => {
      const gList = MOOD_TO_GENRES[mood.toLowerCase()] || [];
      return movieGenres.some((g) => gList.includes(g));
    });

    const moodRatio = matchedMoods.length / moodsList.length;
    score += moodRatio * 2.0 + matchedMoods.length * 0.3;

    return { movie: m, score, matchedMoods };
  });

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, 5);

  const journey = top.map((item, idx) => {
    const matchedStr = item.matchedMoods.length > 0 ? item.matchedMoods.join(" & ") : moodsList[idx % moodsList.length];
    return {
      mood: matchedStr,
      movie: item.movie,
      reason: `Matches your ${matchedStr} mood - ${item.movie.genre.slice(0, 3).join(", ")} with ${item.movie.rating}/10 rating`
    };
  });

  return { journey };
}
