const WATCHLIST_KEY = "moviemind_watchlist";
const LIKED_KEY = "moviemind_liked";

function broadcast() {
  window.dispatchEvent(new Event("moviemind-data-changed"));
}

export function getWatchlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(movieId: string): void {
  const list = getWatchlist();
  if (!list.includes(movieId)) {
    list.push(movieId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    broadcast();
  }
}

export function removeFromWatchlist(movieId: string): void {
  const list = getWatchlist().filter((id) => id !== movieId);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  broadcast();
}

export function isInWatchlist(movieId: string): boolean {
  return getWatchlist().includes(movieId);
}

export function getLiked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleLiked(movieId: string): boolean {
  const list = getLiked();
  const index = list.indexOf(movieId);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(movieId);
  }
  localStorage.setItem(LIKED_KEY, JSON.stringify(list));
  broadcast();
  return index < 0;
}

export function isLiked(movieId: string): boolean {
  return getLiked().includes(movieId);
}

const VIEWED_KEY = "moviemind_viewed";

export function getViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markAsViewed(movieId: string): boolean {
  const list = getViewed();
  const index = list.indexOf(movieId);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(movieId);
  }
  localStorage.setItem(VIEWED_KEY, JSON.stringify(list));
  broadcast();
  return index < 0;
}

export function isViewed(movieId: string): boolean {
  return getViewed().includes(movieId);
}

const VIEWED_GENRES_KEY = "moviemind_viewed_genres";

export function getViewedGenres(): string[] {
  try {
    const map: Record<string, string[]> = JSON.parse(localStorage.getItem(VIEWED_GENRES_KEY) || "{}");
    const allGenres = new Set<string>();
    Object.values(map).forEach((genres) => genres.forEach((g) => allGenres.add(g)));
    return [...allGenres];
  } catch {
    return [];
  }
}

export function setViewedGenres(movieId: string, genres: string[]): void {
  try {
    const map: Record<string, string[]> = JSON.parse(localStorage.getItem(VIEWED_GENRES_KEY) || "{}");
    map[movieId] = genres;
    localStorage.setItem(VIEWED_GENRES_KEY, JSON.stringify(map));
    broadcast();
  } catch {
    // ignore
  }
}

export function removeViewedGenreEntry(movieId: string): void {
  try {
    const map: Record<string, string[]> = JSON.parse(localStorage.getItem(VIEWED_GENRES_KEY) || "{}");
    delete map[movieId];
    localStorage.setItem(VIEWED_GENRES_KEY, JSON.stringify(map));
    broadcast();
  } catch {
    // ignore
  }
}

const QUIZ_KEY = "moviemind_quiz_completed";

export function getQuizCompleted(): number {
  try {
    return parseInt(localStorage.getItem(QUIZ_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function markQuizCompleted(): void {
  const count = getQuizCompleted() + 1;
  localStorage.setItem(QUIZ_KEY, JSON.stringify(count));
  broadcast();
}
