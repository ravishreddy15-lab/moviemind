"""
MovieMind AI - Data Preprocessing & Cleaning Pipeline
=====================================================
Cleans raw IMDb CSV data into a structured, ML-ready format.
"""

import pandas as pd
import numpy as np
import re
import ast
import json
from pathlib import Path


def parse_votes(vote_str: str) -> int:
    """Convert vote strings like '1,234,567' or '17\n...' to integers."""
    if pd.isna(vote_str):
        return 0
    vote_str = str(vote_str).strip()
    vote_str = vote_str.split("\n")[0].strip()
    vote_str = vote_str.replace(",", "").replace('"', "")
    try:
        return int(float(vote_str))
    except (ValueError, TypeError):
        return 0


def parse_duration(dur_str: str) -> int:
    """Convert duration strings like '2h 30m', '30 min', '58 min' to minutes."""
    if pd.isna(dur_str):
        return 0
    dur_str = str(dur_str).strip()
    total_minutes = 0
    hours = re.search(r"(\d+)\s*h", dur_str)
    mins = re.search(r"(\d+)\s*m(?:in)?", dur_str)
    if hours:
        total_minutes += int(hours.group(1)) * 60
    if mins:
        total_minutes += int(mins.group(1))
    if total_minutes == 0 and mins:
        total_minutes = int(mins.group(1))
    return total_minutes


def parse_year(year_str: str) -> int:
    """Extract the start year from strings like '(2018– )', '(1994)', '(2015–2022)'."""
    if pd.isna(year_str):
        return 0
    year_str = str(year_str).strip().strip("()")
    match = re.search(r"(\d{4})", year_str)
    if match:
        return int(match.group(1))
    return 0


def parse_certificate(cert_str: str) -> str:
    """Clean certificate strings."""
    if pd.isna(cert_str):
        return "Not Rated"
    cert_str = str(cert_str).strip()
    valid = ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G",
             "TV-PG", "TV-14", "TV-MA", "Not Rated", "Approved", "Passed",
             "Unrated", "X"]
    for v in valid:
        if cert_str.upper() == v.upper():
            return v
    if "TV" in cert_str.upper():
        return cert_str.upper()
    return cert_str if cert_str else "Not Rated"


def parse_genres(genre_str: str) -> str:
    """Parse genre string into a clean comma-separated string."""
    if pd.isna(genre_str):
        return ""
    genres = [g.strip() for g in str(genre_str).split(",") if g.strip()]
    return ", ".join(genres)


def parse_stars(stars_str: str) -> str:
    """Parse stars string into a clean comma-separated string."""
    if pd.isna(stars_str):
        return ""
    stars_str = str(stars_str).strip()
    try:
        stars = ast.literal_eval(stars_str)
        if isinstance(stars, list):
            cleaned = [s.strip().rstrip(",").strip() for s in stars if s.strip()]
            return ", ".join(cleaned)
    except (ValueError, SyntaxError):
        pass
    stars_str = stars_str.strip("[]")
    stars = [s.strip().strip("'").strip('"').rstrip(",").strip()
             for s in stars_str.split(",")]
    return ", ".join(s for s in stars if s and len(s) > 1)


def parse_rating(rating_str) -> float:
    """Parse rating to float."""
    if pd.isna(rating_str):
        return 0.0
    try:
        return float(str(rating_str).strip())
    except (ValueError, TypeError):
        return 0.0


def load_and_clean(csv_path: str) -> pd.DataFrame:
    """Load raw CSV and clean it into ML-ready format."""
    print(f"Loading dataset from: {csv_path}")

    df = pd.read_csv(csv_path, dtype=str, on_bad_lines="skip")
    print(f"  Raw rows: {len(df)}")
    print(f"  Columns: {list(df.columns)}")

    df = df.rename(columns={
        "title": "title",
        "year": "year",
        "certificate": "certificate",
        "duration": "duration",
        "genre": "genre",
        "rating": "rating",
        "description": "description",
        "stars": "stars",
        "votes": "votes",
    })

    df["year"] = df["year"].apply(parse_year)
    df["certificate"] = df["certificate"].apply(parse_certificate)
    df["duration_minutes"] = df["duration"].apply(parse_duration)
    df["genre"] = df["genre"].apply(parse_genres)
    df["rating"] = df["rating"].apply(parse_rating)
    df["votes"] = df["votes"].apply(parse_votes)
    df["stars"] = df["stars"].apply(parse_stars)
    df["description"] = df["description"].fillna("").str.strip()

    # CSV has no director column - add empty one
    df["director"] = ""

    df = df[df["title"].notna() & (df["title"].str.strip() != "")]
    df = df.drop_duplicates(subset=["title"], keep="first")
    df = df.reset_index(drop=True)

    df["id"] = df["title"].apply(lambda t: re.sub(r"[^a-z0-9]", "-", str(t).lower()).strip("-"))

    all_genres = sorted(set(g for genres in df["genre"] for g in str(genres).split(",") if g.strip()))
    print(f"  Unique genres: {len(all_genres)}")
    print(f"  Cleaned rows: {len(df)}")
    print(f"  Movies with description: {len(df[df['description'] != ''])}")
    print(f"  Rating range: {df['rating'].min()} - {df['rating'].max()}")
    print(f"  Year range: {df['year'].min()} - {df['year'].max()}")

    return df


if __name__ == "__main__":
    csv_path = r"C:\Users\ravis\OneDrive\Desktop\IMBD.csv"
    df = load_and_clean(csv_path)

    out_path = Path(__file__).parent / "data" / "cleaned_movies.csv"
    df.to_csv(out_path, index=False)
    print(f"\nSaved cleaned data to: {out_path}")
    print(f"Shape: {df.shape}")
    print(f"\nSample rows:")
    print(df[["title", "year", "rating", "genre", "duration_minutes"]].head(10).to_string())
