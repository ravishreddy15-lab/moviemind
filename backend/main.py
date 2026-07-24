"""
MovieMind AI - FastAPI Backend Server
=====================================
Serves movie data, recommendations, search, and quiz-based suggestions
using a trained MovieRecommender model.
"""

import json
import pickle as _pickle
import random
import re
import logging
import subprocess
import threading
import time
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DIST_DIR = PROJECT_ROOT / "dist"
MODEL_PATH = BASE_DIR / "models" / "recommender.pkl"
MOVIES_JSON_PATH = BASE_DIR / "data" / "movies.json"
POSTER_CACHE_PATH = BASE_DIR / "data" / "poster_cache.json"

TMDB_API_KEY = "60b1315b3031dc9c8091011a927d17e3"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500"

app = FastAPI(
    title="MovieMind AI API",
    description="Movie recommendation engine powered by AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = None
movies_df: Optional[pd.DataFrame] = None
movies_cache: list[dict] = []
movies_by_id: dict[str, dict] = {}
poster_cache: dict[str, str] = {}


def _tmdb_curl(url: str) -> dict:
    try:
        try:
            import requests as _req
            resp = _req.get(url, timeout=10, headers={"Accept": "application/json"})
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        import urllib.parse as _up
        result = subprocess.run(
            ["curl.exe", "-s", "--max-time", "10", url],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout)
    except Exception:
        pass
    return {}


def _tmdb_search(title: str, year: int = 0) -> str:
    import urllib.parse as _up
    params = _up.urlencode({"api_key": TMDB_API_KEY, "query": title, "include_adult": "false"})
    data = _tmdb_curl(f"{TMDB_BASE_URL}/search/movie?{params}")
    results = data.get("results", [])
    if not results:
        return ""
    if year:
        for r in results:
            r_year = int(str(r.get("release_date", "0000"))[:4] or 0)
            if abs(r_year - year) <= 1:
                return r.get("poster_path", "") or ""
    return results[0].get("poster_path", "") or ""


def _tmdb_search_tv(title: str) -> str:
    import urllib.parse as _up
    params = _up.urlencode({"api_key": TMDB_API_KEY, "query": title, "include_adult": "false"})
    data = _tmdb_curl(f"{TMDB_BASE_URL}/search/tv?{params}")
    results = data.get("results", [])
    if results:
        return results[0].get("poster_path", "") or ""
    return ""


def load_poster_cache():
    global poster_cache
    try:
        if POSTER_CACHE_PATH.exists():
            with open(POSTER_CACHE_PATH, "r", encoding="utf-8-sig") as f:
                poster_cache = json.load(f)
            logger.info(f"Loaded {len(poster_cache)} cached posters.")
    except Exception as e:
        logger.error(f"Failed to load poster cache: {e}")
        poster_cache = {}


def save_poster_cache():
    try:
        POSTER_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(POSTER_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(poster_cache, f)
        logger.info(f"Saved {len(poster_cache)} poster cache entries.")
    except Exception as e:
        logger.error(f"Failed to save poster cache: {e}")


def _fetch_posters_background():
    global poster_cache
    time.sleep(2)
    movies_to_fetch = []
    for m in movies_cache:
        title = m.get("title", "")
        if title and title not in poster_cache:
            movies_to_fetch.append(m)
    if not movies_to_fetch:
        logger.info("All posters already cached.")
        return
    logger.info(f"Fetching posters for {len(movies_to_fetch)} movies...")
    fetched = 0
    for i, m in enumerate(movies_to_fetch):
        title = m.get("title", "")
        year = m.get("year", 0)
        poster_path = _tmdb_search(title, year)
        if not poster_path:
            poster_path = _tmdb_search_tv(title)
        if poster_path:
            poster_cache[title] = f"{TMDB_IMG_BASE}{poster_path}"
        else:
            poster_cache[title] = ""
        fetched += 1
        if fetched % 50 == 0:
            save_poster_cache()
            logger.info(f"Poster progress: {fetched}/{len(movies_to_fetch)}")
        time.sleep(0.15)
    save_poster_cache()
    logger.info(f"Poster fetching complete. {sum(1 for v in poster_cache.values() if v)} posters found.")
    for m in movies_cache:
        title = m.get("title", "")
        if title in poster_cache and poster_cache[title]:
            m["poster"] = poster_cache[title]
    for mid, m in movies_by_id.items():
        title = m.get("title", "")
        if title in poster_cache and poster_cache[title]:
            m["poster"] = poster_cache[title]


def load_model():
    global recommender, movies_df
    import re as _re

    def _make_slug(t):
        return _re.sub(r"[^a-z0-9]+", "-", str(t).lower()).strip("-") if t else ""

    try:
        import sys as _sys
        import importlib

        _backend_dir = str(BASE_DIR)
        if _backend_dir not in _sys.path:
            _sys.path.insert(0, _backend_dir)
        _train = importlib.import_module("train_model")

        class _PickleFix(_pickle.Unpickler):
            def find_class(self, module, name):
                if module == "__main__" and name == "MovieRecommender":
                    return getattr(_train, name)
                return super().find_class(module, name)

        with open(MODEL_PATH, "rb") as f:
            recommender = _PickleFix(f).load()
        movies_df = recommender.movies
        if "title" in movies_df.columns:
            movies_df["id"] = movies_df["title"].apply(_make_slug)
        logger.info(f"Model loaded. {len(movies_df)} movies available.")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        try:
            with open(MOVIES_JSON_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
            movies_df = pd.DataFrame(raw)
            if "title" in movies_df.columns:
                movies_df["id"] = movies_df["title"].apply(_make_slug)
            logger.info(f"Fallback: loaded {len(movies_df)} movies from JSON.")
        except Exception as e2:
            logger.error(f"Failed to load movies JSON: {e2}")
            movies_df = pd.DataFrame()

    global movies_cache, movies_by_id
    if movies_df is not None and not movies_df.empty:
        movies_cache = [movie_to_dict(row) for _, row in movies_df.iterrows()]
        movies_by_id = {m["id"]: m for m in movies_cache}
        logger.info(f"Cached {len(movies_cache)} movies.")


@app.on_event("startup")
def startup_event():
    load_model()
    load_poster_cache()
    if movies_cache:
        for m in movies_cache:
            title = m.get("title", "")
            if title in poster_cache and poster_cache[title]:
                m["poster"] = poster_cache[title]
        for mid, m in movies_by_id.items():
            title = m.get("title", "")
            if title in poster_cache and poster_cache[title]:
                m["poster"] = poster_cache[title]
    missing = sum(1 for m in movies_cache if not m.get("poster", "").startswith("https://"))
    if missing > 0:
        threading.Thread(target=_fetch_posters_background, daemon=True).start()


def movie_to_dict(row) -> dict:
    import re as _re
    import math

    if isinstance(row, dict):
        raw = row
    else:
        raw = row.to_dict()

    title = str(raw.get("title", "") or "")

    slug = _re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") if title else ""
    raw_id = raw.get("id", "")
    if isinstance(raw_id, int):
        movie_id = slug
    elif isinstance(raw_id, str) and raw_id.isdigit():
        movie_id = slug
    else:
        movie_id = str(raw_id) if raw_id else slug

    genre = raw.get("genre", [])
    if isinstance(genre, str):
        genre = [g.strip() for g in genre.split(",") if g.strip()]
    if not isinstance(genre, list):
        genre = []
    genre = [str(g) for g in genre if g]

    stars = raw.get("stars", [])
    if isinstance(stars, str):
        try:
            import ast
            stars = ast.literal_eval(stars)
        except (ValueError, SyntaxError):
            stars = [s.strip() for s in stars.strip("[]").split(",") if s.strip()]
    if isinstance(stars, list):
        cleaned_stars = []
        for s in stars:
            if isinstance(s, str):
                s = s.strip().rstrip(",").strip()
                if s:
                    cleaned_stars.append(s)
        stars = cleaned_stars
    else:
        stars = []

    votes = raw.get("votes", 0)
    if isinstance(votes, str):
        votes = int(float(votes.replace(",", "").strip() or "0"))
    if not isinstance(votes, (int, float)) or math.isnan(votes) or math.isinf(votes):
        votes = 0

    rating = raw.get("rating", 0.0)
    if isinstance(rating, str):
        try:
            rating = float(rating)
        except (ValueError, TypeError):
            rating = 0.0
    if not isinstance(rating, float) or math.isnan(rating) or math.isinf(rating):
        rating = 0.0

    year = raw.get("year", 0)
    if isinstance(year, str):
        match = _re.search(r"(\d{4})", year)
        year = int(match.group(1)) if match else 0
    if not isinstance(year, (int, float)) or math.isnan(year) or math.isinf(year):
        year = 0

    duration_minutes = raw.get("duration_minutes", 0)
    if isinstance(duration_minutes, str):
        duration_minutes = int(float(duration_minutes or "0"))
    if not isinstance(duration_minutes, (int, float)) or math.isnan(duration_minutes) or math.isinf(duration_minutes):
        duration_minutes = 0

    director = str(raw.get("director", "") or "")
    if director == "nan":
        director = ""
    language = str(raw.get("language", "") or "")
    if language == "nan":
        language = ""
    country = str(raw.get("country", "") or "")
    if country == "nan":
        country = ""
    certificate = str(raw.get("certificate", "Not Rated") or "Not Rated")
    if certificate == "nan":
        certificate = "Not Rated"
    duration = str(raw.get("duration", "") or "")
    if duration == "nan":
        duration = ""
    description = str(raw.get("description", "") or "")
    if description == "nan":
        description = ""

    poster_url = poster_cache.get(title, "")
    if not poster_url:
        poster_url = f"https://placehold.co/400x600/18181B/A78BFA?text={_re.sub(r'[^a-zA-Z0-9]', '+', title[:20])}&font=roboto"

    return {
        "id": movie_id,
        "title": title,
        "year": int(year),
        "certificate": certificate,
        "duration": duration,
        "genre": genre,
        "rating": float(rating),
        "description": description,
        "stars": stars,
        "votes": int(votes),
        "director": director,
        "language": language,
        "country": country,
        "duration_minutes": int(duration_minutes),
        "poster": poster_url,
    }


def build_reason(quiz_answers: dict, movie_dict: dict) -> str:
    reasons = []
    mood = quiz_answers.get("mood", "")
    genres = quiz_answers.get("genres", [])
    movie_length = quiz_answers.get("movie_length", "")
    release_period = quiz_answers.get("release_period", "")
    imdb_rating = quiz_answers.get("imdb_rating", "")
    family_friendly = quiz_answers.get("family_friendly", False)
    language = quiz_answers.get("language", "")
    favorite_actor = quiz_answers.get("favorite_actor", "")
    favorite_director = quiz_answers.get("favorite_director", "")
    description = quiz_answers.get("description", "")

    mood_map = {
        "excited": "thrilling and action-packed",
        "romantic": "romantic and heartfelt",
        "thoughtful": "thought-provoking and deep",
        "adventurous": "exciting and adventurous",
        "scary": "suspenseful and spine-chilling",
        "funny": "hilarious and feel-good",
        "dramatic": "emotionally powerful and dramatic",
        "curious": "mysterious and intriguing",
    }
    if mood and mood in mood_map:
        reasons.append(f"A {mood_map[mood]} pick")

    if genres:
        movie_genres = movie_dict.get("genre", [])
        matched = [g for g in genres if g in movie_genres]
        if matched:
            reasons.append(f"matches your love for {', '.join(matched)} genres")

    if movie_length and movie_length != "any":
        duration = movie_dict.get("duration_minutes", 0)
        length_map = {
            "short": (0, 90),
            "medium": (90, 130),
            "long": (130, 999),
        }
        if movie_length in length_map:
            lo, hi = length_map[movie_length]
            if lo <= duration <= hi:
                reasons.append(f"at {duration} min, fits your {movie_length} preference")

    if release_period and release_period != "any":
        year = movie_dict.get("year", 0)
        period_map = {
            "classic": (1920, 1979),
            "retro": (1980, 1999),
            "modern": (2000, 2019),
            "recent": (2020, 2030),
        }
        if release_period in period_map:
            lo, hi = period_map[release_period]
            if lo <= year <= hi:
                reasons.append(f"a {release_period} era film ({year})")

    if imdb_rating and imdb_rating != "any":
        rating = movie_dict.get("rating", 0.0)
        rating_map = {
            "good": (6.0, 10.0),
            "great": (7.0, 10.0),
            "masterpiece": (8.0, 10.0),
        }
        if imdb_rating in rating_map:
            lo, hi = rating_map[imdb_rating]
            if lo <= rating <= hi:
                reasons.append(f"rated {rating}/10 on IMDb")

    if family_friendly:
        cert = movie_dict.get("certificate", "")
        if cert in ("G", "PG", "PG-13", "TV-Y", "TV-Y7", "TV-G", "TV-PG"):
            reasons.append("family-friendly and suitable for all ages")

    if language and language.lower() != "any":
        movie_lang = movie_dict.get("language", "")
        if language.lower() in movie_lang.lower():
            reasons.append(f"in your preferred language ({language})")

    if favorite_actor:
        stars = movie_dict.get("stars", [])
        if any(favorite_actor.lower() in s.lower() for s in stars):
            reasons.append(f"starring {favorite_actor}")

    if favorite_director:
        director = movie_dict.get("director", "")
        if favorite_director.lower() in director.lower():
            reasons.append(f"directed by {favorite_director}")

    if description:
        desc_lower = description.lower()
        movie_desc = movie_dict.get("description", "").lower()
        keywords = desc_lower.split()
        overlap = sum(1 for kw in keywords if kw in movie_desc)
        if overlap >= 2:
            reasons.append("matches the vibe you described")

    if not reasons:
        reasons.append("highly rated and well-reviewed")

    return ", ".join(reasons[:3]) + "."


def build_text_reason(query_text: str, movie_dict: dict, score: float) -> str:
    parts = []
    if score > 0.7:
        parts.append("An excellent match for your search")
    elif score > 0.5:
        parts.append("A strong match for your query")
    else:
        parts.append("A related recommendation")

    movie_genres = ", ".join(movie_dict.get("genre", [])[:3])
    if movie_genres:
        parts.append(f"featuring {movie_genres}")

    rating = movie_dict.get("rating", 0)
    if rating >= 8.0:
        parts.append(f"with an outstanding {rating}/10 rating")

    return ", ".join(parts) + "."


# ── Request / Response Models ────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    query: str = ""
    genres: list[str] = Field(default_factory=list)
    mood: str = ""
    rating_min: float = 0.0
    year_min: int = 1900
    year_max: int = 2030
    duration_min: str = ""
    duration_max: str = ""
    language: str = ""
    family_friendly: bool = False
    favorite_actor: str = ""
    favorite_director: str = ""
    free_text: str = ""


class QuizRecommendRequest(BaseModel):
    mood: str = ""
    genres: list[str] = Field(default_factory=list)
    movie_length: str = ""
    release_period: str = ""
    imdb_rating: str = ""
    family_friendly: bool = False
    language: str = ""
    favorite_actor: str = ""
    favorite_director: str = ""
    description: str = ""


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/genres")
def get_genres():
    if not movies_cache:
        return {"genres": []}
    all_genres = set()
    for m in movies_cache:
        for g in m.get("genre", []):
            if g:
                all_genres.add(g)
    return {"genres": sorted(all_genres)}


@app.get("/api/movies")
def get_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    if not movies_cache:
        raise HTTPException(status_code=503, detail="Movie data not available")

    total = len(movies_cache)
    start = (page - 1) * limit
    end = min(start + limit, total)
    return {"movies": movies_cache[start:end], "total": total, "page": page, "limit": limit}


@app.get("/api/movies/{movie_id}")
def get_movie(movie_id: str):
    if not movies_by_id:
        raise HTTPException(status_code=503, detail="Movie data not available")

    movie = movies_by_id.get(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail=f"Movie '{movie_id}' not found")
    return {"movie": movie}


@app.get("/api/movies/{movie_id}/similar")
def get_similar_movies(
    movie_id: str,
    limit: int = Query(10, ge=1, le=50),
):
    if not movies_by_id:
        raise HTTPException(status_code=503, detail="Movie data not available")

    source = movies_by_id.get(movie_id)
    if not source:
        raise HTTPException(status_code=404, detail=f"Movie '{movie_id}' not found")

    if recommender is not None and movies_df is not None:
        try:
            match = movies_df[movies_df["id"] == movie_id]
            if not match.empty:
                movie_idx = match.index[0]
                similar = recommender.get_similar(movie_idx, top_n=limit)
                results = []
                for idx, score in similar:
                    if idx < len(movies_cache):
                        m = movies_cache[idx]
                        match_pct = min(99, max(78, int(score * 100)))
                        reason = build_text_reason(source["title"], m, score)
                        results.append({
                            "movie": m,
                            "match_percentage": match_pct,
                            "reason": reason,
                        })
                return {"recommendations": results}
        except Exception as e:
            logger.error(f"get_similar failed: {e}")

    source_genres = set(source.get("genre", []))
    source_year = source.get("year", 2000)
    candidates = []
    for m in movies_cache:
        if m["id"] == movie_id:
            continue
        other_genres = set(m.get("genre", []))
        genre_overlap = len(source_genres & other_genres)
        year_diff = abs(m.get("year", 2000) - source_year)
        sim = genre_overlap * 0.3 + (1.0 / (1.0 + year_diff * 0.05)) * 0.2
        if sim > 0:
            candidates.append((m, sim))
    candidates.sort(key=lambda x: x[1], reverse=True)

    results = []
    for m, score in candidates[:limit]:
        match_pct = min(99, max(78, int(score * 100)))
        reason = build_text_reason(source["title"], m, score)
        results.append({
            "movie": m,
            "match_percentage": match_pct,
            "reason": reason,
        })

    return {"recommendations": results}


@app.get("/api/trending")
def get_trending(
    limit: int = Query(20, ge=1, le=50),
):
    if not movies_cache:
        raise HTTPException(status_code=503, detail="Movie data not available")

    sorted_movies = sorted(movies_cache, key=lambda m: (m.get("votes", 0), m.get("rating", 0)), reverse=True)
    return {"movies": sorted_movies[:limit]}


@app.get("/api/top-rated")
def get_top_rated(
    limit: int = Query(20, ge=1, le=50),
):
    if not movies_cache:
        raise HTTPException(status_code=503, detail="Movie data not available")

    sorted_movies = sorted(movies_cache, key=lambda m: m.get("rating", 0), reverse=True)
    return {"movies": sorted_movies[:limit]}


@app.get("/api/search")
def search_movies(
    q: str = Query("", description="Search term"),
    genre: str = Query("", description="Filter by genre"),
    min_rating: float = Query(0.0, ge=0.0, le=10.0),
    year_from: int = Query(1900, ge=1900),
    year_to: int = Query(2030, le=2030),
    sort_by: str = Query("relevance", description="Sort by: relevance, rating, year, votes"),
):
    if not movies_cache:
        raise HTTPException(status_code=503, detail="Movie data not available")

    q_lower = q.strip().lower()

    if not q_lower and not genre and min_rating <= 0.0 and year_from <= 1900 and year_to >= 2030:
        top = sorted(movies_cache, key=lambda x: x.get("rating", 0), reverse=True)[:100]
        return {"movies": top, "total": len(movies_cache)}

    def word_match(text, word):
        return bool(re.search(r'(?<![a-zA-Z])' + re.escape(word) + r'(?![a-zA-Z])', text))

    def all_words_in_title(words_list, title):
        return all(word_match(title, w) for w in words_list)

    stop_words = {"the", "a", "an", "of", "and", "or", "in", "on", "at", "to", "for", "is", "it", "as", "by", "with"}

    filtered = []
    for m in movies_cache:
        movie_genres = [g.lower() for g in m.get("genre", [])]
        rating = m.get("rating", 0.0)
        year = m.get("year", 0)

        if genre and genre.lower() not in movie_genres:
            continue
        if rating < min_rating:
            continue
        if year < year_from or year > year_to:
            continue

        if not q_lower:
            filtered.append((m, 0.0))
            continue

        title = m.get("title", "").lower()
        all_words = q_lower.split()
        meaningful_words = [w for w in all_words if w not in stop_words]
        if not meaningful_words:
            meaningful_words = all_words

        score = 0.0
        if q_lower in title:
            score = 1.0
        elif word_match(title, " ".join(meaningful_words)):
            score = 0.95
        elif len(meaningful_words) == 1:
            if word_match(title, meaningful_words[0]):
                score = 0.6
            else:
                continue
        elif all_words_in_title(meaningful_words, title):
            score = 0.7
        else:
            continue

        filtered.append((m, score))

    if not q_lower and sort_by == "relevance":
        sort_by = "rating"

    if sort_by == "rating":
        filtered.sort(key=lambda x: x[0].get("rating", 0), reverse=True)
    elif sort_by == "year":
        filtered.sort(key=lambda x: x[0].get("year", 0), reverse=True)
    elif sort_by == "votes":
        filtered.sort(key=lambda x: x[0].get("votes", 0), reverse=True)
    else:
        filtered.sort(key=lambda x: x[1], reverse=True)

    movies = [m for m, _ in filtered[:100]]
    return {"movies": movies, "total": len(movies)}


def parse_duration_to_minutes(dur_str: str) -> int:
    if not dur_str:
        return 0
    dur_str = dur_str.strip().lower()
    if dur_str in ("short", "under 90", "under90"):
        return 75
    if dur_str in ("medium", "90 to 120", "90to120"):
        return 105
    if dur_str in ("long", "over 120", "over120"):
        return 150
    import re
    total = 0
    hours = re.search(r"(\d+)\s*h", dur_str)
    mins = re.search(r"(\d+)\s*m", dur_str)
    if hours:
        total += int(hours.group(1)) * 60
    if mins:
        total += int(mins.group(1))
    if total == 0:
        try:
            total = int(float(dur_str))
        except (ValueError, TypeError):
            total = 0
    return total


@app.post("/api/recommend")
def recommend(request: RecommendRequest):
    if movies_df is None or movies_df.empty:
        raise HTTPException(status_code=503, detail="Movie data not available")

    query_text = request.query or request.free_text or ""
    genre_filter = ",".join(request.genres) if request.genres else ""

    mood_genres = []
    mood_genre_map = {
        "excited": ["Action", "Adventure", "Thriller"],
        "romantic": ["Romance", "Drama", "Comedy"],
        "thoughtful": ["Drama", "Sci-Fi", "Mystery"],
        "adventurous": ["Adventure", "Action", "Fantasy"],
        "scary": ["Horror", "Thriller", "Mystery"],
        "funny": ["Comedy", "Animation", "Family"],
        "dramatic": ["Drama", "War", "Biography"],
        "curious": ["Mystery", "Sci-Fi", "Thriller"],
    }
    if request.mood and request.mood in mood_genre_map:
        mood_genres = mood_genre_map[request.mood]
        if not request.genres:
            genre_filter = ",".join(mood_genres)

    duration_min = parse_duration_to_minutes(request.duration_min)
    duration_max = parse_duration_to_minutes(request.duration_max)
    if duration_max == 0 and duration_min > 0:
        duration_max = 999

    family = request.family_friendly

    if recommender is not None:
        try:
            recs = recommender.get_recommendations_from_text(
                query_text=query_text,
                genre_filter=genre_filter,
                mood_genres=mood_genres,
                rating_min=request.rating_min,
                year_min=request.year_min,
                year_max=request.year_max,
                duration_min=duration_min,
                duration_max=duration_max,
                language_filter=request.language,
                family_friendly=family,
                certificate_filter="",
                top_n=20,
            )
            results = []
            for idx, score in recs:
                if idx < len(movies_cache):
                    m = movies_cache[idx]
                    match_pct = min(99, max(78, int(score * 100)))
                    reason = build_text_reason(query_text, m, score)
                    if request.favorite_actor:
                        stars = m.get("stars", [])
                        if any(request.favorite_actor.lower() in s.lower() for s in stars):
                            reason = reason.rstrip(".") + f" starring {request.favorite_actor}."
                            match_pct = min(99, match_pct + 3)
                    if request.favorite_director:
                        director = m.get("director", "")
                        if request.favorite_director.lower() in director.lower():
                            reason = reason.rstrip(".") + f" directed by {request.favorite_director}."
                            match_pct = min(99, match_pct + 3)
                    results.append({
                        "movie": m,
                        "match_percentage": match_pct,
                        "reason": reason,
                    })
            return {"recommendations": results}
        except Exception as e:
            logger.error(f"Recommend endpoint failed: {e}")

    results = []
    for m in movies_cache:
        score = 0.5
        movie_genres = set(m.get("genre", []))
        if request.genres:
            filter_set = set(request.genres)
            overlap = len(movie_genres & filter_set)
            score += overlap * 0.08
        if request.mood and request.mood in mood_genre_map:
            mood_set = set(mood_genre_map[request.mood])
            overlap = len(movie_genres & mood_set)
            score += overlap * 0.06
        if request.rating_min and m.get("rating", 0) >= request.rating_min:
            score += 0.1
        if request.year_min and m.get("year", 0) >= request.year_min:
            score += 0.05
        if request.year_max and m.get("year", 0) <= request.year_max:
            score += 0.05
        if query_text:
            q_lower = query_text.lower()
            title = m.get("title", "").lower()
            desc = m.get("description", "").lower()
            if q_lower in title:
                score += 0.3
            elif any(w in title for w in q_lower.split() if len(w) > 2):
                score += 0.15
            if any(w in desc for w in q_lower.split() if len(w) > 2):
                score += 0.1
        if request.favorite_actor:
            if any(request.favorite_actor.lower() in s.lower() for s in m.get("stars", [])):
                score += 0.2
        if request.favorite_director:
            if request.favorite_director.lower() in m.get("director", "").lower():
                score += 0.2
        if family:
            cert = m.get("certificate", "")
            if cert in ("G", "PG", "PG-13"):
                score += 0.1
        results.append((m, score))

    results.sort(key=lambda x: x[1], reverse=True)
    top = results[:20]
    response_recs = []
    for m, score in top:
        match_pct = min(99, max(78, int(score * 100)))
        reason = build_text_reason(query_text, m, score)
        if request.favorite_actor:
            if any(request.favorite_actor.lower() in s.lower() for s in m.get("stars", [])):
                reason = reason.rstrip(".") + f" starring {request.favorite_actor}."
                match_pct = min(99, match_pct + 3)
        if request.favorite_director:
            if request.favorite_director.lower() in m.get("director", "").lower():
                reason = reason.rstrip(".") + f" directed by {request.favorite_director}."
                match_pct = min(99, match_pct + 3)
        response_recs.append({
            "movie": m,
            "match_percentage": match_pct,
            "reason": reason,
        })
    return {"recommendations": response_recs}


@app.post("/api/quiz/recommend")
def quiz_recommend(request: QuizRecommendRequest):
    if movies_df is None or movies_df.empty:
        raise HTTPException(status_code=503, detail="Movie data not available")

    mood_genre_map = {
        "excited": ["Action", "Adventure", "Thriller"],
        "romantic": ["Romance", "Drama", "Comedy"],
        "thoughtful": ["Drama", "Sci-Fi", "Mystery"],
        "adventurous": ["Adventure", "Action", "Fantasy"],
        "scary": ["Horror", "Thriller", "Mystery"],
        "funny": ["Comedy", "Animation", "Family"],
        "dramatic": ["Drama", "War", "Biography"],
        "curious": ["Mystery", "Sci-Fi", "Thriller"],
    }

    mood_genres = []
    if request.mood and request.mood in mood_genre_map:
        mood_genres = mood_genre_map[request.mood]

    genres = request.genres or mood_genres
    genre_filter = ",".join(genres)

    length_map = {
        "short": (0, 90),
        "medium": (90, 130),
        "long": (130, 999),
        "any": (0, 999),
    }
    duration_min_val, duration_max_val = length_map.get(
        request.movie_length, (0, 999)
    )

    period_map = {
        "classic": (1920, 1979),
        "retro": (1980, 1999),
        "modern": (2000, 2019),
        "recent": (2020, 2030),
        "any": (1900, 2030),
    }
    year_min, year_max = period_map.get(request.release_period, (1900, 2030))

    rating_min = 0.0
    rating_map = {
        "good": 6.0,
        "great": 7.0,
        "masterpiece": 8.0,
        "any": 0.0,
    }
    if request.imdb_rating in rating_map:
        rating_min = rating_map[request.imdb_rating]

    query_text = request.description or ""
    if request.favorite_actor:
        query_text += f" {request.favorite_actor}"
    if request.favorite_director:
        query_text += f" {request.favorite_director}"

    if recommender is not None:
        try:
            recs = recommender.get_recommendations_from_text(
                query_text=query_text,
                genre_filter=genre_filter,
                mood_genres=mood_genres,
                rating_min=rating_min,
                year_min=year_min,
                year_max=year_max,
                duration_min=duration_min_val,
                duration_max=duration_max_val,
                language_filter=request.language,
                family_friendly=request.family_friendly,
                certificate_filter="",
                top_n=20,
            )
            quiz_answers = {
                "mood": request.mood,
                "genres": request.genres,
                "movie_length": request.movie_length,
                "release_period": request.release_period,
                "imdb_rating": request.imdb_rating,
                "family_friendly": request.family_friendly,
                "language": request.language,
                "favorite_actor": request.favorite_actor,
                "favorite_director": request.favorite_director,
                "description": request.description,
            }
            results = []
            seen_titles = set()
            for idx, score in recs:
                if idx < len(movies_cache):
                    m = movies_cache[idx]
                    if m["title"] in seen_titles:
                        continue
                    seen_titles.add(m["title"])
                    match_pct = min(99, max(78, int(score * 100)))
                    reason = build_reason(quiz_answers, m)
                    results.append({
                        "movie": m,
                        "match_percentage": match_pct,
                        "reason": reason,
                    })
            return {"recommendations": results}
        except Exception as e:
            logger.error(f"Quiz recommend failed: {e}")

    candidates = []
    for m in movies_cache:
        score = 0.4
        movie_genres = set(m.get("genre", []))
        if genres:
            overlap = len(movie_genres & set(genres))
            score += overlap * 0.1
        if rating_min and m.get("rating", 0) >= rating_min:
            score += 0.12
        if year_min and m.get("year", 0) >= year_min:
            score += 0.05
        if year_max and m.get("year", 0) <= year_max:
            score += 0.05
        if duration_min_val and duration_max_val:
            dur = m.get("duration_minutes", 0)
            if duration_min_val <= dur <= duration_max_val:
                score += 0.08
        if request.family_friendly:
            cert = m.get("certificate", "")
            if cert in ("G", "PG", "PG-13", "TV-Y", "TV-Y7", "TV-G", "TV-PG"):
                score += 0.08
        if request.language and request.language.lower() != "any":
            if request.language.lower() in m.get("language", "").lower():
                score += 0.1
        if request.favorite_actor:
            if any(request.favorite_actor.lower() in s.lower() for s in m.get("stars", [])):
                score += 0.25
        if request.favorite_director:
            if request.favorite_director.lower() in m.get("director", "").lower():
                score += 0.25
        if request.description:
            desc_kw = request.description.lower().split()
            movie_desc = m.get("description", "").lower()
            overlap = sum(1 for w in desc_kw if len(w) > 3 and w in movie_desc)
            score += min(0.15, overlap * 0.03)
        score += random.uniform(0, 0.05)
        candidates.append((m, score))

    candidates.sort(key=lambda x: x[1], reverse=True)
    quiz_answers = {
        "mood": request.mood,
        "genres": request.genres,
        "movie_length": request.movie_length,
        "release_period": request.release_period,
        "imdb_rating": request.imdb_rating,
        "family_friendly": request.family_friendly,
        "language": request.language,
        "favorite_actor": request.favorite_actor,
        "favorite_director": request.favorite_director,
        "description": request.description,
    }

    results = []
    seen_titles = set()
    for m, score in candidates:
        if m["title"] in seen_titles:
            continue
        seen_titles.add(m["title"])
        match_pct = min(99, max(78, int(score * 100)))
        reason = build_reason(quiz_answers, m)
        results.append({
            "movie": m,
            "match_percentage": match_pct,
            "reason": reason,
        })
        if len(results) >= 20:
            break

    return {"recommendations": results}


# ── Static File Serving (React Frontend) ────────────────────────────────────

if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve React SPA - all non-API routes return index.html."""
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
else:
    logger.warning(f"dist/ folder not found at {DIST_DIR}. Frontend not served.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
