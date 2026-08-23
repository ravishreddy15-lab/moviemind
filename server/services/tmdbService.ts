import { ServerMovie, StreamingPlatform, MOVIES_DATABASE } from "../data/moviesData";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// TMDB Genre ID to Name Mapping
export const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

export const REVERSE_GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "sci-fi": 878,
  "science fiction": 878,
  thriller: 53,
  war: 10752,
  western: 37
};

// In-Memory Cache with TTL (15 minutes)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setToCache<T>(key: string, data: T): void {
  // Cap cache size to avoid unbounded memory growth
  if (cache.size > 2000) {
    const firstKeys = Array.from(cache.keys()).slice(0, 500);
    firstKeys.forEach((k) => cache.delete(k));
  }
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export function getTmdbApiKey(): string | null {
  return process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || process.env.TMDB_READ_ACCESS_TOKEN || null;
}

export function isTmdbConfigured(): boolean {
  return Boolean(getTmdbApiKey());
}

async function tmdbFetch(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<any> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Check if apiKey looks like a Bearer token (longer than 50 chars) or standard v3 key
  const isBearer = apiKey.length > 50;
  if (!isBearer) {
    url.searchParams.set("api_key", apiKey);
  }

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") {
      url.searchParams.set(k, String(v));
    }
  });

  const cacheKey = url.toString();
  const cached = getFromCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {
      "Accept": "application/json"
    };
    if (isBearer) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      console.warn(`TMDB request failed: ${res.status} ${res.statusText} on ${endpoint}`);
      return null;
    }
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`TMDB fetch error on ${endpoint}:`, err);
    return null;
  }
}

/**
 * Format raw TMDB movie into standard ServerMovie
 */
export function formatTmdbMovie(tmdb: any, fullDetails?: any): ServerMovie {
  const tmdbId = String(tmdb.id);
  const releaseYear = tmdb.release_date ? parseInt(tmdb.release_date.split("-")[0], 10) : 2022;
  
  const genres = fullDetails?.genres
    ? fullDetails.genres.map((g: any) => g.name)
    : (tmdb.genre_ids || []).map((id: number) => TMDB_GENRE_MAP[id] || "Drama").filter(Boolean);

  if (genres.length === 0) genres.push("Drama");

  const runtimeMinutes = fullDetails?.runtime || (tmdb.runtime ? tmdb.runtime : 110 + (tmdb.id % 45));
  const hours = Math.floor(runtimeMinutes / 60);
  const mins = runtimeMinutes % 60;
  const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  let director = "Acclaimed Director";
  let stars: string[] = [];

  if (fullDetails?.credits) {
    const dir = fullDetails.credits.crew?.find((c: any) => c.job === "Director");
    if (dir) director = dir.name;
    stars = (fullDetails.credits.cast || []).slice(0, 4).map((c: any) => c.name);
  }

  if (stars.length === 0) {
    stars = ["Ensemble Cast", "Featured Actor"];
  }

  // Certificate / Age Rating estimation
  let certificate = "PG-13";
  if (fullDetails?.release_dates?.results) {
    const usRelease = fullDetails.release_dates.results.find((r: any) => r.iso_3166_1 === "US");
    if (usRelease?.release_dates?.length > 0) {
      const cert = usRelease.release_dates.find((d: any) => d.certification)?.certification;
      if (cert) certificate = cert;
    }
  }

  const posterPath = tmdb.poster_path
    ? `${TMDB_IMAGE_BASE}/w500${tmdb.poster_path}`
    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";

  const backdropPath = tmdb.backdrop_path
    ? `${TMDB_IMAGE_BASE}/original${tmdb.backdrop_path}`
    : tmdb.poster_path
      ? `${TMDB_IMAGE_BASE}/original${tmdb.poster_path}`
      : undefined;

  return {
    id: `tmdb-${tmdbId}`,
    title: tmdb.title || tmdb.original_title || "Untitled Film",
    year: isNaN(releaseYear) ? 2020 : releaseYear,
    certificate,
    duration,
    duration_minutes: runtimeMinutes,
    genre: genres,
    rating: tmdb.vote_average ? Math.round(tmdb.vote_average * 10) / 10 : 7.8,
    description: tmdb.overview || "An extraordinary cinematic journey exploring compelling human emotions, narrative conflicts, and unforgettable characters.",
    stars,
    votes: tmdb.vote_count || 1250,
    director,
    language: tmdb.original_language ? tmdb.original_language.toUpperCase() : "English",
    country: fullDetails?.production_countries?.[0]?.name || "United States",
    poster: posterPath,
    backdrop: backdropPath
  };
}

/**
 * Discover movies from TMDB (can paginate up to 500 pages = 10,000+ movies!)
 */
export async function getTmdbDiscoverMovies(params: {
  page?: number;
  genre?: string;
  min_rating?: number;
  year_from?: number;
  year_to?: number;
  sort_by?: string;
}): Promise<{ movies: ServerMovie[]; total: number; page: number; total_pages: number } | null> {
  const page = Math.min(params.page || 1, 500);
  
  let tmdbSort = "popularity.desc";
  const queryParams: Record<string, string | number | undefined> = {
    page,
    include_adult: "false"
  };

  if (params.sort_by === "rating") {
    tmdbSort = "vote_average.desc";
    queryParams["vote_count.gte"] = params.min_rating ? 100 : 250;
  } else if (params.sort_by === "rating_asc") {
    tmdbSort = "vote_average.asc";
    queryParams["vote_count.gte"] = 50;
  } else if (params.sort_by === "year") {
    tmdbSort = "primary_release_date.desc";
    queryParams["primary_release_date.lte"] = new Date().toISOString().split("T")[0];
    queryParams["vote_count.gte"] = 30;
  } else if (params.sort_by === "oldest" || params.sort_by === "year_asc") {
    tmdbSort = "primary_release_date.asc";
    queryParams["primary_release_date.gte"] = "1920-01-01";
    queryParams["vote_count.gte"] = 30;
  } else if (params.sort_by === "votes" || params.sort_by === "popularity") {
    tmdbSort = "vote_count.desc";
  } else if (params.sort_by === "title") {
    tmdbSort = "original_title.asc";
  } else if (params.sort_by === "title_desc") {
    tmdbSort = "original_title.desc";
  } else {
    tmdbSort = "popularity.desc";
    queryParams["vote_count.gte"] = params.min_rating ? 100 : 25;
  }

  queryParams.sort_by = tmdbSort;

  if (params.genre) {
    const genreId = REVERSE_GENRE_MAP[params.genre.toLowerCase()];
    if (genreId) queryParams.with_genres = genreId;
  }

  if (params.min_rating) {
    queryParams["vote_average.gte"] = params.min_rating;
  }

  if (params.year_from) {
    queryParams["primary_release_date.gte"] = `${params.year_from}-01-01`;
  }

  if (params.year_to) {
    queryParams["primary_release_date.lte"] = `${params.year_to}-12-31`;
  }

  const data = await tmdbFetch("/discover/movie", queryParams);
  if (!data || !data.results) return null;

  const movies: ServerMovie[] = data.results.map((m: any) => formatTmdbMovie(m));
  const total = Math.min(data.total_results || 8500, 10000);
  const total_pages = Math.min(data.total_pages || 425, 500);

  return {
    movies,
    total,
    page,
    total_pages
  };
}

/**
 * Search movies live on TMDB
 */
export async function searchTmdbMovies(query: string, page = 1): Promise<{ movies: ServerMovie[]; total: number } | null> {
  if (!query || !query.trim()) return null;

  const data = await tmdbFetch("/search/movie", {
    query: query.trim(),
    page: Math.min(page, 100),
    include_adult: "false"
  });

  if (!data || !data.results) return null;

  const movies: ServerMovie[] = data.results.map((m: any) => formatTmdbMovie(m));
  return {
    movies,
    total: data.total_results || movies.length
  };
}

/**
 * Fetch Top Rated Movies from TMDB
 */
export async function getTmdbTopRated(page = 1): Promise<ServerMovie[] | null> {
  const data = await tmdbFetch("/movie/top_rated", {
    page: Math.min(page, 100)
  });
  if (!data || !data.results) return null;
  return data.results.map((m: any) => formatTmdbMovie(m));
}

/**
 * Fetch Trending / Popular Movies from TMDB
 */
export async function getTmdbTrending(page = 1): Promise<ServerMovie[] | null> {
  const data = await tmdbFetch("/trending/movie/week", {
    page: Math.min(page, 100)
  });
  if (!data || !data.results) return null;
  return data.results.map((m: any) => formatTmdbMovie(m));
}

/**
 * Get detailed movie by TMDB ID or clean query
 */
export async function getTmdbMovieDetails(idOrTmdbId: string): Promise<ServerMovie | null> {
  const rawId = idOrTmdbId.replace(/^tmdb-/, "");
  const numId = parseInt(rawId, 10);

  if (!isNaN(numId) && numId > 0) {
    const data = await tmdbFetch(`/movie/${numId}`, {
      append_to_response: "credits,release_dates,videos,similar"
    });
    if (data && data.title) {
      return formatTmdbMovie(data, data);
    }
  }

  // Fallback: search TMDB by title
  const search = await searchTmdbMovies(idOrTmdbId, 1);
  if (search && search.movies.length > 0) {
    const first = search.movies[0];
    const cleanId = first.id.replace(/^tmdb-/, "");
    const detailed = await tmdbFetch(`/movie/${cleanId}`, {
      append_to_response: "credits,release_dates,videos,similar"
    });
    if (detailed && detailed.title) {
      return formatTmdbMovie(detailed, detailed);
    }
    return first;
  }

  return null;
}

/**
 * Get Watch/Streaming Providers from TMDB
 */
export async function getTmdbStreamingProviders(idOrTmdbId: string): Promise<StreamingPlatform[]> {
  const rawId = idOrTmdbId.replace(/^tmdb-/, "");
  const numId = parseInt(rawId, 10);

  let targetId = numId;
  if (isNaN(targetId) || targetId <= 0) {
    const search = await searchTmdbMovies(idOrTmdbId, 1);
    if (search && search.movies.length > 0) {
      targetId = parseInt(search.movies[0].id.replace(/^tmdb-/, ""), 10);
    }
  }

  if (isNaN(targetId) || targetId <= 0) {
    return [
      { platform: "Amazon Prime Video", type: "Subscription", url: "https://www.amazon.com/Prime-Video", color: "#00A8E1", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
      { platform: "Apple TV", type: "Rent", url: "https://tv.apple.com", color: "#555555", logo: "https://image.tmdb.org/t/p/original/SPnB1qiCkYfirS2it3hZORwGVn.jpg" }
    ];
  }

  const data = await tmdbFetch(`/movie/${targetId}/watch/providers`);
  if (!data || !data.results) {
    return [
      { platform: "Amazon Prime Video", type: "Subscription", url: "https://www.amazon.com/Prime-Video", color: "#00A8E1", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
      { platform: "Apple TV", type: "Rent", url: "https://tv.apple.com", color: "#555555", logo: "https://image.tmdb.org/t/p/original/SPnB1qiCkYfirS2it3hZORwGVn.jpg" }
    ];
  }

  const regionData = data.results.US || data.results.GB || Object.values(data.results)[0] as any;
  if (!regionData) {
    return [
      { platform: "Amazon Prime Video", type: "Subscription", url: "https://www.amazon.com/Prime-Video", color: "#00A8E1", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" }
    ];
  }

  const platforms: StreamingPlatform[] = [];

  const providerColors: Record<string, string> = {
    "Netflix": "#E50914",
    "Amazon Prime Video": "#00A8E1",
    "Prime Video": "#00A8E1",
    "Disney Plus": "#113CCF",
    "Disney+": "#113CCF",
    "Apple TV": "#333333",
    "Apple TV Plus": "#333333",
    "Max": "#002BE7",
    "HBO Max": "#002BE7",
    "Hulu": "#1CE783",
    "Paramount Plus": "#0064FF",
    "Paramount+": "#0064FF",
    "Peacock": "#000000",
    "YouTube": "#FF0000",
    "Google Play Movies": "#4285F4"
  };

  // Stream (Flatrate)
  if (regionData.flatrate) {
    for (const p of regionData.flatrate) {
      platforms.push({
        platform: p.provider_name,
        type: "Subscription",
        url: regionData.link || "https://www.themoviedb.org",
        color: providerColors[p.provider_name] || "#7c3aed",
        logo: p.logo_path ? `${TMDB_IMAGE_BASE}/original${p.logo_path}` : undefined
      });
    }
  }

  // Rent
  if (regionData.rent) {
    for (const p of regionData.rent.slice(0, 3)) {
      if (!platforms.some((existing) => existing.platform === p.provider_name)) {
        platforms.push({
          platform: p.provider_name,
          type: "Rent",
          url: regionData.link || "https://www.themoviedb.org",
          color: providerColors[p.provider_name] || "#4f46e5",
          logo: p.logo_path ? `${TMDB_IMAGE_BASE}/original${p.logo_path}` : undefined
        });
      }
    }
  }

  // Buy
  if (regionData.buy && platforms.length < 4) {
    for (const p of regionData.buy.slice(0, 2)) {
      if (!platforms.some((existing) => existing.platform === p.provider_name)) {
        platforms.push({
          platform: p.provider_name,
          type: "Buy",
          url: regionData.link || "https://www.themoviedb.org",
          color: providerColors[p.provider_name] || "#2563eb",
          logo: p.logo_path ? `${TMDB_IMAGE_BASE}/original${p.logo_path}` : undefined
        });
      }
    }
  }

  return platforms.length > 0 ? platforms : [
    { platform: "Amazon Prime Video", type: "Subscription", url: "https://www.amazon.com/Prime-Video", color: "#00A8E1", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
    { platform: "Apple TV", type: "Rent", url: "https://tv.apple.com", color: "#555555", logo: "https://image.tmdb.org/t/p/original/SPnB1qiCkYfirS2it3hZORwGVn.jpg" }
  ];
}

/**
 * Get Similar Movies from TMDB
 */
export async function getTmdbSimilarMovies(idOrTmdbId: string, limit = 6): Promise<ServerMovie[]> {
  const rawId = idOrTmdbId.replace(/^tmdb-/, "");
  const numId = parseInt(rawId, 10);

  let targetId = numId;
  if (isNaN(targetId) || targetId <= 0) {
    const search = await searchTmdbMovies(idOrTmdbId, 1);
    if (search && search.movies.length > 0) {
      targetId = parseInt(search.movies[0].id.replace(/^tmdb-/, ""), 10);
    }
  }

  if (!isNaN(targetId) && targetId > 0) {
    const [similarData, recData] = await Promise.all([
      tmdbFetch(`/movie/${targetId}/similar`),
      tmdbFetch(`/movie/${targetId}/recommendations`)
    ]);

    const results = [
      ...(recData?.results || []),
      ...(similarData?.results || [])
    ];

    if (results.length > 0) {
      const seen = new Set<number>();
      const unique = results.filter((m: any) => {
        if (m.id === targetId || seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      return unique.slice(0, limit).map((m: any) => formatTmdbMovie(m));
    }
  }

  // Fallback to local DB
  return MOVIES_DATABASE.filter((m) => m.id !== idOrTmdbId).slice(0, limit);
}
