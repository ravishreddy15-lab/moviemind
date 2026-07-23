import pandas as pd
import numpy as np
import pickle
import json
import time
import warnings
from pathlib import Path
from data_preprocessing import load_and_clean

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack, csr_matrix

warnings.filterwarnings("ignore")


class MovieRecommender:
    def __init__(self):
        self.tfidf = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            sublinear_tf=True,
        )
        self.scaler = MinMaxScaler()
        self.movies = None
        self.feature_matrix = None
        self.similarity_matrix = None
        self.genre_list = []
        self.top_directors = []
        self.top_actors = []
        self.genre_columns = []
        self.director_columns = []
        self.actor_columns = []
        self.numerical_columns = []

    def _extract_genres(self, movies):
        all_genres = set()
        for g in movies["genre"]:
            if isinstance(g, str):
                for genre in g.split(","):
                    genre = genre.strip()
                    if genre:
                        all_genres.add(genre)
        self.genre_list = sorted(all_genres)
        for genre in self.genre_list:
            col = f"genre_{genre}"
            self.genre_columns.append(col)
            movies[col] = movies["genre"].apply(
                lambda x: 1 if isinstance(x, str) and genre in [g.strip() for g in x.split(",")] else 0
            )
        return movies

    def _extract_directors(self, movies, top_n=500):
        director_counts = {}
        for d in movies["director"]:
            if isinstance(d, str) and d.strip():
                director_counts[d.strip()] = director_counts.get(d.strip(), 0) + 1
        sorted_dirs = sorted(director_counts.items(), key=lambda x: x[1], reverse=True)
        self.top_directors = [d[0] for d in sorted_dirs[:top_n]]
        for director in self.top_directors:
            col = f"director_{director}"
            self.director_columns.append(col)
            movies[col] = movies["director"].apply(
                lambda x: 1 if isinstance(x, str) and x.strip() == director else 0
            )
        return movies

    def _extract_actors(self, movies, top_n=200):
        actor_counts = {}
        for stars in movies["stars"]:
            if isinstance(stars, str):
                for actor in stars.split(","):
                    actor = actor.strip()
                    if actor:
                        actor_counts[actor] = actor_counts.get(actor, 0) + 1
        sorted_actors = sorted(actor_counts.items(), key=lambda x: x[1], reverse=True)
        self.top_actors = [a[0] for a in sorted_actors[:top_n]]
        for actor in self.top_actors:
            col = f"actor_{actor}"
            self.actor_columns.append(col)
            movies[col] = movies["stars"].apply(
                lambda x: 1 if isinstance(x, str) and actor in [a.strip() for a in x.split(",")] else 0
            )
        return movies

    def _prepare_numerical_features(self, movies):
        numerical_features = []
        self.numerical_columns = []
        if "rating" in movies.columns:
            self.numerical_columns.append("rating")
            numerical_features.append(movies["rating"].fillna(0).values.reshape(-1, 1))
        if "duration_minutes" in movies.columns:
            self.numerical_columns.append("duration_minutes")
            numerical_features.append(movies["duration_minutes"].fillna(0).values.reshape(-1, 1))
        if "year" in movies.columns:
            self.numerical_columns.append("year")
            numerical_features.append(movies["year"].fillna(0).values.reshape(-1, 1))
        if "votes" in movies.columns:
            self.numerical_columns.append("votes")
            numerical_features.append(movies["votes"].fillna(0).values.reshape(-1, 1))
        if numerical_features:
            num_array = np.hstack(numerical_features)
            num_scaled = self.scaler.fit_transform(num_array)
            return num_scaled
        return None

    def _build_feature_matrix(self, movies):
        print("Building feature matrix...")
        start = time.time()

        desc_filled = movies["description"].fillna("").replace("", "no description available")
        tfidf_matrix = self.tfidf.fit_transform(desc_filled)
        print(f"  TF-IDF matrix: {tfidf_matrix.shape}")

        genre_data = movies[self.genre_columns].values if self.genre_columns else None
        print(f"  Genre features: {len(self.genre_columns)} genres")

        director_data = movies[self.director_columns].values if self.director_columns else None
        print(f"  Director features: {len(self.director_columns)} directors")

        actor_data = movies[self.actor_columns].values if self.actor_columns else None
        print(f"  Actor features: {len(self.actor_columns)} actors")

        num_scaled = self._prepare_numerical_features(movies)
        print(f"  Numerical features: {len(self.numerical_columns)} features")

        tfidf_weighted = tfidf_matrix * 5

        if genre_data is not None:
            genre_sparse = csr_matrix(genre_data * 3)
        else:
            genre_sparse = csr_matrix((len(movies), 0))

        if num_scaled is not None:
            num_sparse = csr_matrix(num_scaled * 2)
        else:
            num_sparse = csr_matrix((len(movies), 0))

        if director_data is not None:
            director_sparse = csr_matrix(director_data * 2)
        else:
            director_sparse = csr_matrix((len(movies), 0))

        if actor_data is not None:
            actor_sparse = csr_matrix(actor_data * 1.5)
        else:
            actor_sparse = csr_matrix((len(movies), 0))

        self.feature_matrix = hstack([
            tfidf_weighted,
            genre_sparse,
            num_sparse,
            director_sparse,
            actor_sparse,
        ]).tocsr()

        elapsed = time.time() - start
        print(f"  Feature matrix built in {elapsed:.2f}s: {self.feature_matrix.shape}")

    def train(self, movies):
        self.movies = movies.copy()
        self.movies = self._extract_genres(self.movies)
        self.movies = self._extract_directors(self.movies)
        self.movies = self._extract_actors(self.movies)
        self._build_feature_matrix(self.movies)
        self._compute_similarity()
        print("Training complete!")

    def _compute_similarity(self):
        print("Computing similarity matrix...")
        start = time.time()
        self.similarity_matrix = cosine_similarity(self.feature_matrix)
        elapsed = time.time() - start
        print(f"  Similarity matrix computed in {elapsed:.2f}s: {self.similarity_matrix.shape}")

    def get_similar(self, movie_idx, top_n=10):
        if movie_idx < 0 or movie_idx >= len(self.movies):
            return []
        sim_scores = list(enumerate(self.similarity_matrix[movie_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [s for s in sim_scores if s[0] != movie_idx]
        top_scores = sim_scores[:top_n]
        return [(idx, score) for idx, score in top_scores]

    def generate_recommendation_reason(self, movie, query_genres=None, director=None, mood_genres=None, rating_min=None):
        reasons = []

        if query_genres:
            movie_genres = [g.strip() for g in movie.get("genre", "").split(",")]
            matching = [g for g in query_genres if g in movie_genres]
            if matching:
                genre_str = ", ".join(matching)
                if rating_min and movie.get("rating", 0) >= rating_min:
                    reasons.append(f"Recommended because you like {genre_str} and prefer highly rated films")
                else:
                    reasons.append(f"Recommended because you like {genre_str}")

        if director and isinstance(director, str) and director.strip():
            movie_director = movie.get("director", "")
            if isinstance(movie_director, str) and director.strip() in movie_director:
                reasons.append(f"Perfect match based on your interest in {director.strip()}'s style of filmmaking")

        if mood_genres:
            movie_genres = [g.strip() for g in movie.get("genre", "").split(",")]
            mood_matching = [g for g in mood_genres if g in movie_genres]
            if mood_matching:
                genre = mood_matching[0]
                mood_str = ", ".join(mood_genres[:2])
                reasons.append(f"This {genre} film aligns with your mood preference for {mood_str}")

        if not reasons:
            movie_genres = [g.strip() for g in movie.get("genre", "").split(",") if g.strip()]
            if movie_genres:
                reasons.append(f"A well-reviewed {movie_genres[0]} movie you might enjoy")
            else:
                reasons.append("A great movie based on your preferences")

        return reasons[0] if reasons else "A movie you might enjoy"

    def get_recommendations_from_text(
        self,
        query_text="",
        genre_filter=None,
        mood_genres=None,
        rating_min=None,
        year_min=None,
        year_max=None,
        duration_min=None,
        duration_max=None,
        language_filter=None,
        family_friendly=False,
        certificate_filter=None,
        top_n=10,
    ):
        if self.movies is None or self.similarity_matrix is None:
            return []

        mask = pd.Series([True] * len(self.movies), index=self.movies.index)

        if rating_min is not None:
            mask &= self.movies["rating"] >= rating_min
        if year_min is not None:
            mask &= self.movies["year"] >= year_min
        if year_max is not None:
            mask &= self.movies["year"] <= year_max
        if duration_min is not None:
            mask &= self.movies["duration_minutes"] >= duration_min
        if duration_max is not None:
            mask &= self.movies["duration_minutes"] <= duration_max
        if certificate_filter and isinstance(certificate_filter, str) and certificate_filter.strip():
            mask &= self.movies["certificate"].str.lower() == certificate_filter.strip().lower()
        if family_friendly:
            safe_certificates = ["U", "UA", "PG", "G", "PG-13"]
            mask &= self.movies["certificate"].isin(safe_certificates)

        candidate_indices = self.movies.index[mask].tolist()

        if genre_filter and isinstance(genre_filter, list) and len(genre_filter) > 0:
            genre_mask = pd.Series([False] * len(self.movies), index=self.movies.index)
            for genre in genre_filter:
                genre_mask |= self.movies[f"genre_{genre}"] == 1
            candidate_indices = [i for i in candidate_indices if i in self.movies.index[genre_mask]]

        if not candidate_indices:
            return []

        if query_text and query_text.strip():
            query_vec = self.tfidf.transform([query_text])
            query_dense = query_vec.toarray() * 5
            n_features = self.feature_matrix.shape[1]
            genre_start = self.tfidf.max_features if hasattr(self.tfidf, "max_features") and self.tfidf.max_features else self.feature_matrix.shape[1]
            genre_end = genre_start + len(self.genre_columns)
            num_end = genre_end + len(self.numerical_columns)
            dir_end = num_end + len(self.director_columns)
            act_end = dir_end + len(self.actor_columns)

            padded = np.zeros((1, n_features))
            tfidf_cols = min(query_dense.shape[1], n_features)
            padded[0, :tfidf_cols] = query_dense[0, :tfidf_cols]

            query_sparse = csr_matrix(padded)
            query_sim = cosine_similarity(query_sparse, self.feature_matrix).flatten()

            scored = [(idx, query_sim[idx]) for idx in candidate_indices]
        else:
            if genre_filter and isinstance(genre_filter, list) and len(genre_filter) > 0:
                genre_scores = np.zeros(len(self.movies))
                for idx in candidate_indices:
                    movie_genres = [g.strip() for g in self.movies.at[idx, "genre"].split(",") if g.strip()]
                    overlap = len(set(movie_genres) & set(genre_filter))
                    genre_scores[idx] = overlap / max(len(genre_filter), 1)
                    genre_scores[idx] += self.movies.at[idx, "rating"] / 10.0 * 0.5
                scored = [(idx, genre_scores[idx]) for idx in candidate_indices]
            else:
                avg_ratings = self.movies.loc[candidate_indices, "rating"].mean()
                scored = [(idx, self.movies.at[idx, "rating"] / 10.0) for idx in candidate_indices]

        scored.sort(key=lambda x: x[1], reverse=True)
        top_results = scored[:top_n]

        recommendations = []
        for idx, score in top_results:
            movie = self.movies.loc[idx].to_dict()
            movie["id"] = int(idx)
            movie["similarity_score"] = float(score)
            movie["match_percentage"] = round(float(score) * 100, 1)
            if movie["match_percentage"] > 100:
                movie["match_percentage"] = 100.0
            movie["reason"] = self.generate_recommendation_reason(
                movie,
                query_genres=genre_filter,
                director=query_text,
                mood_genres=mood_genres,
                rating_min=rating_min,
            )
            recommendations.append(movie)

        return recommendations

    def recommend_from_quiz(self, quiz_answers):
        if self.movies is None or self.similarity_matrix is None:
            return []

        genre_preferences = quiz_answers.get("genres", [])
        mood = quiz_answers.get("mood", "")
        min_rating = quiz_answers.get("min_rating", 0)
        era = quiz_answers.get("era", "")
        favorite_director = quiz_answers.get("director", "")
        pace = quiz_answers.get("pace", "")
        length_preference = quiz_answers.get("length", "")

        query_parts = []
        if mood:
            query_parts.append(mood)
        if pace:
            query_parts.append(pace)

        query_text = " ".join(query_parts) if query_parts else ""

        year_min = None
        year_max = None
        if era == "classic":
            year_max = 1980
        elif era == "retro":
            year_min = 1980
            year_max = 2000
        elif era == "modern":
            year_min = 2000
        elif era == "recent":
            year_min = 2020

        duration_min = None
        duration_max = None
        if length_preference == "short":
            duration_max = 90
        elif length_preference == "medium":
            duration_min = 80
            duration_max = 130
        elif length_preference == "long":
            duration_min = 120

        recommendations = self.get_recommendations_from_text(
            query_text=query_text,
            genre_filter=genre_preferences if genre_preferences else None,
            mood_genres=[mood] if mood else None,
            rating_min=min_rating if min_rating > 0 else None,
            year_min=year_min,
            year_max=year_max,
            duration_min=duration_min,
            duration_max=duration_max,
            family_friendly=False,
            top_n=10,
        )

        for rec in recommendations:
            match_score = rec.get("match_percentage", 0)
            genre_match_boost = 0
            if genre_preferences:
                movie_genres = [g.strip() for g in rec.get("genre", "").split(",")]
                overlap = len(set(movie_genres) & set(genre_preferences))
                genre_match_boost = (overlap / len(genre_preferences)) * 20

            rec["match_percentage"] = round(min(match_score + genre_match_boost, 100), 1)

            reason_parts = []
            if genre_preferences:
                movie_genres = [g.strip() for g in rec.get("genre", "").split(",")]
                matching = [g for g in genre_preferences if g in movie_genres]
                if matching:
                    reason_parts.append(f"Matches your interest in {', '.join(matching)}")
            if mood:
                reason_parts.append(f"Fits your mood for {mood}")
            if favorite_director and isinstance(favorite_director, str) and favorite_director.strip():
                movie_dir = rec.get("director", "")
                if isinstance(movie_dir, str) and favorite_director.strip() in movie_dir:
                    reason_parts.append(f"Directed by your favorite {favorite_director.strip()}")
            if min_rating and rec.get("rating", 0) >= min_rating:
                reason_parts.append(f"Rated {rec.get('rating', 'N/A')} which meets your minimum of {min_rating}")

            if reason_parts:
                rec["reason"] = ". ".join(reason_parts) + "."
            else:
                rec["reason"] = self.generate_recommendation_reason(
                    rec,
                    query_genres=genre_preferences,
                    director=favorite_director,
                    mood_genres=[mood] if mood else None,
                    rating_min=min_rating if min_rating > 0 else None,
                )

        recommendations.sort(key=lambda x: x.get("match_percentage", 0), reverse=True)
        return recommendations

    def get_trending(self, top_n=10):
        if self.movies is None:
            return []
        trending = self.movies.nlargest(top_n, "votes")
        results = []
        for idx, row in trending.iterrows():
            movie = row.to_dict()
            movie["id"] = int(idx)
            results.append(movie)
        return results

    def get_top_rated(self, top_n=10):
        if self.movies is None:
            return []
        min_votes = self.movies["votes"].quantile(0.7)
        eligible = self.movies[self.movies["votes"] >= min_votes]
        top = eligible.nlargest(top_n, "rating")
        results = []
        for idx, row in top.iterrows():
            movie = row.to_dict()
            movie["id"] = int(idx)
            results.append(movie)
        return results

    def search_movies(self, query, top_n=10):
        if self.movies is None or not query or not query.strip():
            return []
        query_lower = query.strip().lower()
        title_matches = self.movies[
            self.movies["title"].str.lower().str.contains(query_lower, na=False, regex=False)
        ]
        director_matches = self.movies[
            self.movies["director"].str.lower().str.contains(query_lower, na=False, regex=False)
        ]
        genre_matches = self.movies[
            self.movies["genre"].str.lower().str.contains(query_lower, na=False, regex=False)
        ]
        actor_matches = self.movies[
            self.movies["stars"].str.lower().str.contains(query_lower, na=False, regex=False)
        ]
        combined = pd.concat([title_matches, director_matches, genre_matches, actor_matches])
        combined = combined[~combined.index.duplicated(keep="first")]
        combined = combined.sort_values("rating", ascending=False).head(top_n)
        results = []
        for idx, row in combined.iterrows():
            movie = row.to_dict()
            movie["id"] = int(idx)
            results.append(movie)
        return results

    def evaluate(self):
        if self.movies is None or self.similarity_matrix is None:
            print("Model not trained. Cannot evaluate.")
            return

        print("\n" + "=" * 60)
        print("MODEL EVALUATION METRICS")
        print("=" * 60)

        print("\n--- Average Similarity Scores for Top-N Recommendations ---")
        sample_size = min(100, len(self.movies))
        sample_indices = np.random.choice(len(self.movies), sample_size, replace=False)
        for n in [5, 10, 20]:
            similarities = []
            for idx in sample_indices:
                sim_scores = list(enumerate(self.similarity_matrix[idx]))
                sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
                sim_scores = [s for s in sim_scores if s[0] != idx]
                top_n = sim_scores[:n]
                avg_sim = np.mean([s[1] for s in top_n]) if top_n else 0
                similarities.append(avg_sim)
            avg = np.mean(similarities)
            print(f"  Top-{n:2d}: avg similarity = {avg:.4f}")

        print("\n--- Genre Consistency ---")
        genre_match_counts = []
        for idx in sample_indices:
            movie_genres = set(g.strip() for g in self.movies.at[idx, "genre"].split(",") if g.strip())
            if not movie_genres:
                continue
            sim_scores = list(enumerate(self.similarity_matrix[idx]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            sim_scores = [s for s in sim_scores if s[0] != idx][:5]
            matches = 0
            for other_idx, _ in sim_scores:
                other_genres = set(g.strip() for g in self.movies.at[other_idx, "genre"].split(",") if g.strip())
                if movie_genres & other_genres:
                    matches += 1
            genre_match_counts.append(matches / max(len(sim_scores), 1))
        avg_genre_consistency = np.mean(genre_match_counts) if genre_match_counts else 0
        print(f"  Genre consistency (share >= 1 genre): {avg_genre_consistency * 100:.1f}%")

        print("\n--- Sample Recommendations (10 random movies, top 5 each) ---")
        eval_indices = np.random.choice(len(self.movies), min(10, len(self.movies)), replace=False)
        for idx in eval_indices:
            movie_title = self.movies.at[idx, "title"]
            movie_genres = self.movies.at[idx, "genre"]
            similar = self.get_similar(idx, top_n=5)
            print(f"\n  [{movie_title}] (genres: {movie_genres})")
            for rank, (sim_idx, sim_score) in enumerate(similar, 1):
                sim_title = self.movies.at[sim_idx, "title"]
                sim_genre = self.movies.at[sim_idx, "genre"]
                print(f"    {rank}. {sim_title} (score: {sim_score:.4f}, genres: {sim_genre})")

        print("\n--- Coverage ---")
        unique_movies = set()
        coverage_sample = np.random.choice(len(self.movies), min(50, len(self.movies)), replace=False)
        for idx in coverage_sample:
            similar = self.get_similar(idx, top_n=10)
            for sim_idx, _ in similar:
                unique_movies.add(sim_idx)
        coverage = len(unique_movies) / len(self.movies) * 100
        print(f"  Unique movies in any recommendation list: {len(unique_movies)} / {len(self.movies)}")
        print(f"  Coverage: {coverage:.1f}%")

        print("\n" + "=" * 60)
        print("EVALUATION COMPLETE")
        print("=" * 60)


def _row_to_dict(row, idx):
    movie = {}
    movie["id"] = int(idx)
    movie["title"] = str(row.get("title", ""))
    movie["year"] = int(row["year"]) if pd.notna(row.get("year")) else 0
    movie["certificate"] = str(row.get("certificate", "")) if pd.notna(row.get("certificate")) else ""
    movie["duration"] = str(row.get("duration", "")) if pd.notna(row.get("duration")) else ""
    movie["genre"] = str(row.get("genre", "")) if pd.notna(row.get("genre")) else ""
    movie["rating"] = float(row["rating"]) if pd.notna(row.get("rating")) else 0.0
    movie["description"] = str(row.get("description", "")) if pd.notna(row.get("description")) else ""
    movie["stars"] = str(row.get("stars", "")) if pd.notna(row.get("stars")) else ""
    movie["votes"] = int(row["votes"]) if pd.notna(row.get("votes")) else 0
    movie["director"] = str(row.get("director", "")) if pd.notna(row.get("director")) else ""
    movie["language"] = ""
    movie["country"] = ""
    movie["duration_minutes"] = int(row["duration_minutes"]) if pd.notna(row.get("duration_minutes")) else 0
    return movie


if __name__ == "__main__":
    csv_path = r"C:\Users\ravis\OneDrive\Desktop\IMBD.csv"
    models_dir = Path(__file__).parent / "models"
    data_dir = Path(__file__).parent / "data"

    models_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("MOVIEMIND - Model Training Pipeline")
    print("=" * 60)

    print("\nStep 1: Loading and cleaning data...")
    start = time.time()
    movies_df = load_and_clean(csv_path)
    elapsed = time.time() - start
    print(f"  Loaded {len(movies_df)} movies in {elapsed:.2f}s")

    print("\nStep 2: Training recommender model...")
    start = time.time()
    recommender = MovieRecommender()
    recommender.train(movies_df)
    elapsed = time.time() - start
    print(f"  Training completed in {elapsed:.2f}s")

    print("\nStep 3: Running evaluation...")
    recommender.evaluate()

    print("\nStep 4: Saving model...")
    model_path = models_dir / "recommender.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(recommender, f)
    print(f"  Model saved to {model_path}")

    print("\nStep 5: Exporting movies to JSON...")
    movies_list = []
    for idx, row in recommender.movies.iterrows():
        movies_list.append(_row_to_dict(row, idx))
    json_path = data_dir / "movies.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(movies_list, f, ensure_ascii=False, indent=2)
    print(f"  {len(movies_list)} movies exported to {json_path}")

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)
