"""
MovieMind AI - Human-Like Conversational Chat Engine
====================================================
A conversational, context-aware movie assistant that feels
natural and engaging - like chatting with a film-buff friend.

Features:
- Genre detection with 100+ synonyms
- Multi-genre combination detection
- Confirmation flow ("Would you like recommendations?")
- Top 3 results with streaming platform info
- Mood, director, actor, year, comparison queries
- Context-aware follow-ups
"""

import re
import random
from typing import Optional


GENRE_SYNONYMS: dict[str, list[str]] = {
    "Action": [
        "action", "fight", "fighting", "explosions", "explosive", "combat",
        "martial arts", "car chase", "stunts", "hero", "heroes", "superhero",
        "adrenaline", "fast-paced", "high-octane", "intense", "battle",
        "warrior", "gunfight", "shootout",
    ],
    "Comedy": [
        "comedy", "funny", "humor", "humour", "laugh", "laughing", "hilarious",
        "lighthearted", "silly", "goofy", "witty", "satire", "parody",
        "slapstick", "romantic comedy", "rom-com", "sitcom", "amusing",
        "entertaining", "comical", "joke", "jokes",
    ],
    "Drama": [
        "drama", "dramatic", "emotional", "touching", "moving", "powerful",
        "deep", "meaningful", "serious", "intense drama", "tearjerker",
        "heart-wrenching", "poignant", "gripping", "realistic",
    ],
    "Horror": [
        "horror", "scary", "scared", "terrifying", "frightening", "creepy", "spooky",
        "haunted", "horror movie", "slasher", "gore", "gory", "blood",
        "bloody", "jump scare", "jump scares", "nightmare", "demon",
        "ghost", "zombie", "undead", "monster", "paranormal", "disturbing",
        "unsettling", "eerie", "macabre", "sinister", "chilling",
    ],
    "Sci-Fi": [
        "sci-fi", "sci fi", "science fiction", "space", "alien", "aliens",
        "futuristic", "cyberpunk", "dystopia", "dystopian", "robot",
        "robots", "android", "spaceship", "time travel", "time machine",
        "extraterrestrial", "ufo", "galaxy", "planet", "astronaut",
        "technology", "future",
    ],
    "Thriller": [
        "thriller", "suspense", "suspenseful", "tense", "edge of seat",
        "edge-of-seat", "gripping", "nail-biting", "twist", "twists",
        "mystery thriller", "psychological", "paranoia", "chase",
        "cat and mouse", "mind-bending",
    ],
    "Romance": [
        "romance", "romantic", "love", "love story", "love story",
        "dating", "date night", "cuddle", "sweet", "heartwarming",
        "relationship", "chemistry", "passion", "valentine", "wedding",
        "boyfriend", "girlfriend", "husband", "wife", "couple",
    ],
    "Animation": [
        "animation", "animated", "cartoon", "anime", "pixar", "disney",
        "dreamworks", "stop motion", "2d animation", "3d animation",
        "cgi", "family friendly", "kids",
    ],
    "Adventure": [
        "adventure", "adventurous", "exploration", "quest", "journey",
        "treasure", "explorer", "expedition", "travel", "discovery",
        "swashbuckling", "epic adventure",
    ],
    "Mystery": [
        "mystery", "detective", "whodunit", "crime", "investigation",
        "investigative", "clue", "clues", "puzzle", "puzzling",
        "unsolved", "true crime", "forensic",
    ],
    "Fantasy": [
        "fantasy", "magical", "magic", "wizard", "witch", "dragon",
        "fairy tale", "mythical", "mythology", "supernatural",
        "enchanted", "kingdom", "medieval", "lord", "sword",
    ],
    "Crime": [
        "crime", "criminal", "heist", "robbery", "mafia", "gangster",
        "mob", "cartel", "underworld", "mobster", "thief", "thieves",
        "con artist", "corruption", "police", "detective",
    ],
    "Biography": [
        "biography", "biopic", "based on a true story", "true story",
        "real life", "real person", "historical figure", "life story",
        "memoir",
    ],
    "History": [
        "history", "historical", "period piece", "period drama",
        "ancient", "medieval", "vintage", "classic era", "war era",
    ],
    "War": [
        "war", "military", "army", "battlefield", "soldier", "soldiers",
        "warfare", "wwii", "world war", "combat", "army", "navy",
        "frontline", "trench",
    ],
    "Musical": [
        "musical", "music", "singing", "songs", "dance", "dancing",
        "broadway", "concert", "band", "rock opera",
    ],
    "Western": [
        "western", "cowboy", "cowboys", "wild west", "outlaw",
        "saloon", "sheriff", "frontier", "gunslinger",
    ],
    "Documentary": [
        "documentary", "docu", "real events", "non-fiction", "educational",
        "informative", "nature documentary", "true events",
    ],
}

GENRE_NAMES = set(GENRE_SYNONYMS.keys())

GENRE_KEYWORD_TO_NAME: dict[str, str] = {}
for genre_name, synonyms in GENRE_SYNONYMS.items():
    for syn in synonyms:
        GENRE_KEYWORD_TO_NAME[syn] = genre_name


def _detect_genres(text: str) -> list[str]:
    text_lower = text.lower().strip()
    found_genres: list[str] = []

    for syn, genre_name in sorted(GENRE_KEYWORD_TO_NAME.items(), key=lambda x: -len(x[0])):
        if syn in text_lower and genre_name not in found_genres:
            found_genres.append(genre_name)
            text_lower = text_lower.replace(syn, " ", 1)

    return found_genres


def _is_yes(text: str) -> bool:
    text = text.lower().strip()
    return any(text == w or text.startswith(w) for w in [
        "yes", "yeah", "yep", "yup", "sure", "ok", "okay", "sounds good",
        "let's do it", "lets do it", "go for it", "absolutely", "definitely",
        "of course", "why not", "yes please", "yes!", "please", "hit me",
        "do it", "y", "ya", "yas", "ofc",
    ])


def _is_no(text: str) -> bool:
    text = text.lower().strip()
    return any(text == w or text.startswith(w) for w in [
        "no", "nah", "nope", "not really", "not really", "naw", "nahh",
        "no thanks", "no thank you", "pass", "skip", "n", "noo", "nooo",
    ])


class MovieChatEngine:
    def __init__(self, movies_cache: list[dict], streaming_cache: dict = None):
        self.movies = movies_cache
        self.streaming_cache = streaming_cache or {}
        self.pending_genre_confirm: Optional[list[str]] = None
        self.last_movie_context: Optional[dict] = None

        self.movies_by_title: dict[str, dict] = {}
        for m in movies_cache:
            t = m.get("title", "").lower().strip()
            if t:
                self.movies_by_title[t] = m

        self.genre_index: dict[str, list[dict]] = {}
        for movie in movies_cache:
            raw_genre = movie.get("genre", "")
            if isinstance(raw_genre, str):
                genres = [g.strip() for g in raw_genre.split(",") if g.strip()]
            elif isinstance(raw_genre, list):
                genres = raw_genre
            else:
                genres = []
            movie["_genres_list"] = genres
            for g in genres:
                gl = g.lower()
                if gl not in self.genre_index:
                    self.genre_index[gl] = []
                self.genre_index[gl].append(movie)

        self.director_index: dict[str, list[dict]] = {}
        for m in movies_cache:
            d = m.get("director", "").strip()
            if d:
                dl = d.lower()
                if dl not in self.director_index:
                    self.director_index[dl] = []
                self.director_index[dl].append(m)

        self.actor_index: dict[str, list[dict]] = {}
        for m in movies_cache:
            stars_raw = m.get("stars", "")
            if isinstance(stars_raw, str):
                stars = [s.strip() for s in stars_raw.split(",") if s.strip()]
            elif isinstance(stars_raw, list):
                stars = stars_raw
            else:
                stars = []
            for s in stars:
                sl = s.lower()
                if sl not in self.actor_index:
                    self.actor_index[sl] = []
                if m not in self.actor_index[sl]:
                    self.actor_index[sl].append(m)

        self.year_index: dict[str, list[dict]] = {}
        for m in movies_cache:
            y = str(m.get("year", ""))
            if y and y != "0":
                if y not in self.year_index:
                    self.year_index[y] = []
                self.year_index[y].append(m)

        self.pending_genre_confirm: Optional[list[str]] = None
        self.conversation_history: list[str] = []

    def _get_streaming_for_movie(self, movie_id) -> list[dict]:
        mid_str = str(movie_id)
        if mid_str in self.streaming_cache:
            return self.streaming_cache[mid_str]
        return []

    def _format_streaming(self, platforms: list[dict]) -> str:
        if not platforms:
            return ""
        seen = set()
        names = []
        for p in platforms:
            name = p.get("platform", "")
            ptype = p.get("type", "")
            if name and name not in seen:
                seen.add(name)
                if ptype:
                    names.append(f"{name} ({ptype})")
                else:
                    names.append(name)
        if not names:
            return ""
        max_show = 3
        shown = names[:max_show]
        extra = len(names) - max_show
        result = ", ".join(shown)
        if extra > 0:
            result += f" +{extra} more"
        return result

    def _format_movie_with_streaming(self, m: dict, idx: int) -> str:
        genres_str = ", ".join(m.get("_genres_list", [])[:3])
        platforms = self._get_streaming_for_movie(m.get("id", ""))
        streaming_str = self._format_streaming(platforms)
        line = f"  {idx}. **{m['title']}** ({m.get('year', 'N/A')}) — {m.get('rating', 0)}/10 | {genres_str}"
        if streaming_str:
            line += f"\n       Stream on: {streaming_str}"
        return line

    def _is_fuzzy_movie(self, text: str) -> Optional[dict]:
        text = text.lower().strip()

        skip_words = set()
        for synonyms in GENRE_SYNONYMS.values():
            for s in synonyms:
                skip_words.add(s)
        skip_words.update(["best", "good", "top", "great", "movie", "movies", "film", "films",
                           "recommend", "suggest", "find", "watch", "show", "give", "tell",
                           "about", "like", "with", "from", "some", "something", "rated",
                           "directed", "starring", "featuring", "info", "details", "describe",
                           "yes", "yeah", "yep", "sure", "ok", "okay", "no", "nah", "nope",
                           "hello", "hi", "hey", "bye", "thanks", "sorry", "cool", "nice",
                           "who", "what", "where", "when", "why", "how", "which",
                           "does", "did", "do", "can", "could", "would", "should",
                           "the", "a", "an", "is", "are", "was", "were", "be", "been",
                           "i", "me", "my", "we", "you", "he", "she", "it", "they",
                           "that", "this", "those", "these", "of", "for", "by", "to",
                           "directed", "made", "created", "starred", "acted", "appeared"])

        for title in self.movies_by_title:
            t_len = len(title.split())
            if t_len >= 2 and title in text:
                return self.movies_by_title[title]

        words = text.split()
        meaningful_words = [w for w in words if len(w) > 2 and w not in skip_words]
        if meaningful_words:
            search_phrase = " ".join(meaningful_words)
            best_match = None
            best_score = 0
            for title, movie in self.movies_by_title.items():
                if search_phrase in title:
                    score = len(search_phrase) / len(title) * 100
                    if score > best_score:
                        best_score = score
                        best_match = movie
            if best_match and best_score > 40:
                return best_match

        import re as _re
        for title in self.movies_by_title:
            if len(title) <= 4 and title not in skip_words:
                if _re.search(r'\b' + _re.escape(title) + r'\b', text):
                    return self.movies_by_title[title]

        for title in self.movies_by_title:
            t_len = len(title.split())
            if t_len >= 3 and title in text:
                return self.movies_by_title[title]

        if meaningful_words:
            for word in meaningful_words:
                if len(word) < 5:
                    continue
                for title, movie in self.movies_by_title.items():
                    if word in title:
                        return movie
        return None

    def process_message(self, message: str, conversation_history: list[dict] = None) -> str:
        msg = message.lower().strip()

        if self.pending_genre_confirm is not None:
            if _is_yes(msg):
                return self._handle_genre_confirm_yes()
            elif _is_no(msg):
                return self._handle_genre_confirm_no()
            else:
                new_genres = _detect_genres(msg)
                if new_genres:
                    self.pending_genre_confirm = new_genres
                    return self._ask_genre_confirmation(new_genres)
                self.pending_genre_confirm = None

        if self._is_greeting(msg):
            return self._handle_greeting(msg)
        if self._is_thanks(msg):
            return self._handle_thanks()
        if self._is_goodbye(msg):
            return self._handle_goodbye()
        if self._is_bot_identity(msg):
            return self._handle_bot_identity()
        if self._is_how_are_you(msg):
            return self._handle_how_are_you()
        if self._is_joke_request(msg):
            return self._handle_joke()
        if self._is_help(msg):
            return self._handle_help()

        if _is_yes(msg):
            if self.last_movie_context:
                ctx = self.last_movie_context
                self.last_movie_context = None
                return self._handle_similar_from_context(ctx)
            return self._handle_general_query(msg)
        if _is_no(msg):
            self.last_movie_context = None
            return self._handle_general_query(msg)

        if self._is_year_query(msg):
            return self._handle_year_query(msg)
        if self._is_director_query(msg):
            return self._handle_director_query(msg)
        if self._is_actor_query(msg):
            return self._handle_actor_query(msg)
        if self._is_rating_query(msg):
            return self._handle_rating_query(msg)
        if self._is_comparison_query(msg):
            return self._handle_comparison_query(msg)

        if self._is_recommendation_request(msg):
            return self._handle_recommendation_request(msg)

        detected = _detect_genres(msg)
        if len(detected) >= 1:
            self.pending_genre_confirm = detected
            return self._ask_genre_confirmation(detected)

        if self._is_mood_query(msg):
            return self._handle_mood_query(msg)

        if self._is_specific_movie(msg):
            return self._handle_specific_movie(msg)

        if self._is_movie_request(msg):
            return self._handle_movie_request(msg)
        if self._is_fact_query(msg):
            return self._handle_fact_query(msg)

        keyword_movies = self._keyword_search(msg)
        if keyword_movies:
            return keyword_movies

        return self._handle_general_query(msg)

    def _ask_genre_confirmation(self, genres: list[str]) -> str:
        if len(genres) == 1:
            g = genres[0]
            count = len(self.genre_index.get(g.lower(), []))
            return random.choice([
                f"Great choice! I found {count} **{g}** movies in my database. Would you like me to recommend the top ones?",
                f"**{g}** it is! I've got plenty of those. Want me to pick the best {g} movies for you?",
                f"Nice! I know lots of great {g} films. Shall I recommend some?",
                f"**{g}** — solid pick! Want me to show you the top-rated {g} movies?",
            ])
        else:
            genre_str = ", ".join(genres[:-1]) + " & " + genres[-1]
            combined_count = len(set(
                m["title"] for g in genres for m in self.genre_index.get(g.lower(), [])
            ))
            return random.choice([
                f"I love that combo! Found {combined_count} movies that match **{genre_str}**. Would you like me to recommend the top ones?",
                f"**{genre_str}** — great combination! I have {combined_count} movies in those genres. Want me to pick the best for you?",
                f"Nice mix! {genre_str} gives us {combined_count} options. Shall I recommend the top picks?",
                f"**{genre_str}** it is! {combined_count} movies match. Want me to show the top-rated ones?",
            ])

    def _handle_genre_confirm_yes(self) -> str:
        genres = self.pending_genre_confirm
        self.pending_genre_confirm = None
        self.conversation_history = []
        if not genres:
            return "Sure! What genres are you interested in?"

        all_movies: dict[str, dict] = {}
        for g in genres:
            for m in self.genre_index.get(g.lower(), []):
                key = m.get("title", "")
                if key and key not in all_movies:
                    all_movies[key] = m

        scored = []
        for m in all_movies.values():
            genre_overlap = sum(1 for g in genres if g.lower() in [x.lower() for x in m.get("_genres_list", [])])
            rating = m.get("rating", 0)
            votes = m.get("votes", 0)
            score = genre_overlap * 10 + rating * 2 + min(votes / 100000, 5)
            scored.append((m, score))

        scored.sort(key=lambda x: -x[1])
        top3 = [m for m, _ in scored[:3]]

        if not top3:
            return "Hmm, I couldn't find movies matching those exact genres. Try a different combination!"

        genre_str = ", ".join(genres[:-1]) + " & " + genres[-1] if len(genres) > 1 else genres[0]
        lines = [f"Here are my top **{genre_str}** picks:\n"]
        for i, m in enumerate(top3, 1):
            lines.append(self._format_movie_with_streaming(m, i))
        lines.append("")
        lines.append(random.choice([
            "Want details on any of these? Or would you like more recommendations?",
            "Interested in any of these? I can tell you more about them!",
            "Like what you see? Ask me about any of these movies!",
            "Want me to recommend more, or tell you about a specific one?",
        ]))
        self.last_movie_context = top3[0] if top3 else None
        return "\n".join(lines)

    def _handle_genre_confirm_no(self) -> str:
        self.pending_genre_confirm = None
        return random.choice([
            "No problem! What genres are you in the mood for instead?",
            "Got it! Tell me what you're interested in — any genre, mood, or even a specific movie!",
            "Sure thing! What would you prefer? I can suggest by genre, mood, or director!",
            "Alright! What kind of movie are you looking for? Just tell me!",
        ])

    def _is_greeting(self, msg: str) -> bool:
        greetings = ["hello", "hi", "hey", "howdy", "greetings", "good morning",
                      "good evening", "good afternoon", "sup", "yo", "what's up",
                      "hola", "hiya", "heya"]
        return any(msg.startswith(g) or msg == g for g in greetings)

    def _handle_greeting(self, msg: str) -> str:
        time_greetings = {
            "good morning": random.choice([
                "Good morning! Ready to find an amazing movie to start your day?",
                "Morning! Hope you're having a great day. What kind of movie are you in the mood for?",
            ]),
            "good evening": random.choice([
                "Good evening! Perfect time to settle in with a great movie. What are you in the mood for?",
                "Evening! Ready for a cozy movie night? Tell me what you're feeling!",
            ]),
            "good afternoon": random.choice([
                "Good afternoon! Afternoon movie session? I like your style!",
                "Hey there! Afternoon movie time? I've got tons of great suggestions!",
            ]),
        }
        for key, resp in time_greetings.items():
            if key in msg:
                return resp

        return random.choice([
            "Hey there! I'm MovieMind AI, your personal movie guide. I know over 8,000 movies. What are you in the mood for?",
            "Hi! Great to see you! I can recommend movies based on your mood, favorite genres, or find films similar to ones you love. What's up?",
            "Hello! Ready to discover your next favorite movie? Tell me how you're feeling, what genre you like, or ask me about any movie!",
            "Hey! Welcome to MovieMind! I'm like having a movie buff friend in your pocket. Ask me anything!",
        ])

    def _is_thanks(self, msg: str) -> bool:
        return any(w in msg for w in ["thank", "thanks", "thx", "ty", "tysm", "appreciate"])

    def _handle_thanks(self) -> str:
        return random.choice([
            "You're welcome! Happy to help you find something great to watch.",
            "Anytime! That's what I'm here for. Let me know if you need anything else!",
            "No problem at all! Hope you love whatever you pick.",
            "Of course! Enjoy the movie, and come back anytime!",
            "Glad I could help! Don't hesitate to ask if you want more suggestions!",
        ])

    def _is_goodbye(self, msg: str) -> bool:
        return any(w in msg for w in ["bye", "goodbye", "see you", "later", "gtg", "gotta go", "cya"])

    def _handle_goodbye(self) -> str:
        return random.choice([
            "Bye! Enjoy your movie and come back anytime you need recommendations!",
            "See you later! Hope you find the perfect film.",
            "Take care! Come back when you're ready for your next movie adventure!",
            "Goodbye! Enjoy your movie night!",
        ])

    def _is_bot_identity(self, msg: str) -> bool:
        patterns = [r"who are you", r"what are you", r"your name", r"what's your name",
                    r"tell me about yourself", r"what can you do", r"are you (a |an )?(bot|ai|human)"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_bot_identity(self) -> str:
        return random.choice([
            "I'm MovieMind AI! Think of me as your personal movie expert. I have access to over 8,000 movies and TV shows, and I can help you find the perfect film based on your mood, genre preferences, or anything else!",
            "I'm MovieMind AI - your friendly neighborhood movie guide! I know a LOT about movies (8,000+ titles) and I love helping people discover great films. Ask me for recommendations, movie info, or just chat about cinema!",
            "Great question! I'm MovieMind AI, an intelligent movie assistant. I can recommend films based on your mood, find similar movies, give detailed info about any film, compare movies side-by-side, and even tell you where to stream them!",
        ])

    def _is_how_are_you(self, msg: str) -> bool:
        patterns = [r"how are you", r"how('s| is) it going", r"how do you do", r"what('s| is) up",
                    r"how('s| is) everything", r"you doing (ok|good|alright|fine)"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_how_are_you(self) -> str:
        return random.choice([
            "I'm doing great, thanks for asking! Always in the mood to talk about movies. How about you?",
            "I'm fantastic! Just been browsing through my database of 8,000+ movies. What about you?",
            "Living my best AI life! I'm here and ready to help you find an amazing movie.",
            "All good over here! More importantly, how are YOU doing? Need a movie recommendation?",
        ])

    def _is_joke_request(self, msg: str) -> bool:
        patterns = [r"tell me a joke", r"make me laugh", r"joke", r"funny", r"something funny",
                    r"humor", r"make me smile"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_joke(self) -> str:
        jokes = [
            "Why don't scientists trust atoms? Because they make up everything!\n\nSpeaking of trust, have you seen *12 Angry Men*? It's all about convincing 11 jurors!",
            "What do you call a fake noodle? An impasta!\n\nBut if you want real drama, check out *The Godfather*.",
            "I told my wife she was drawing her eyebrows too high. She looked surprised!\n\nWant to see some really surprised faces? Watch *The Sixth Sense*!",
            "Why did the movie get an award? Because it was outstanding in its field!\n\nWant to see some actually outstanding movies?",
            "I'm reading a book about anti-gravity. It's impossible to put down!\n\nSpeaking of impossible to put down, have you watched *Inception*?",
            "What's a movie about a fish with no eyes? A fsh!\n\nOkay, I'll stick to movie recs. What genre are you into?",
        ]
        return random.choice(jokes)

    def _is_help(self, msg: str) -> bool:
        return any(w in msg for w in ["help", "what can you", "how do", "guide", "instructions"])

    def _handle_help(self) -> str:
        return ("Here's everything I can do!\n\n"
                "**Get Recommendations:**\n"
                '  - "Recommend a movie" or "What should I watch?"\n'
                '  - "I feel like a comedy" (mood-based)\n'
                '  - "Best horror movies" (genre-based)\n'
                '  - "scary" or "funny" or "action" (single genre)\n'
                '  - "action and comedy" (multi-genre combo)\n\n'
                "**Find Similar Movies:**\n"
                '  - "Something like Inception"\n'
                '  - "Movies similar to The Dark Knight"\n\n'
                "**Learn About Movies:**\n"
                '  - "Tell me about Interstellar"\n'
                '  - "Who directed Inception?"\n'
                '  - "Movies with Leonardo DiCaprio"\n'
                '  - "Best movies from 2023"\n\n'
                "**Compare:**\n"
                '  - "Inception vs The Matrix"\n'
                '  - "Which is better, Titanic or Avatar?"\n\n'
                "**Just Chat:**\n"
                '  - "Tell me a joke"\n'
                '  - "How are you?"\n\n'
                "Just talk to me naturally - I'll figure out what you need!")

    def _is_year_query(self, msg: str) -> bool:
        patterns = [r"(from|in|of) (\d{4})", r"best (movies? )?(\d{4})",
                    r"(\d{4}) (movies?|films?)", r"movies? released (in|during) (\d{4})",
                    r"what came out (in|during) (\d{4})"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_year_query(self, msg: str) -> str:
        year_match = re.search(r"\b(19|20)\d{2}\b", msg)
        if year_match:
            year = year_match.group()
            movies = self.year_index.get(year, [])
            movies = sorted(movies, key=lambda x: x.get("rating", 0), reverse=True)[:7]
            if movies:
                lines = [f"Great year! Here are the best movies from **{year}**:\n"]
                for i, m in enumerate(movies, 1):
                    lines.append(self._format_movie_with_streaming(m, i))
                lines.append("\nWant to explore another year or genre?")
                return "\n".join(lines)
            return f"I don't have many movies from {year}. Try another year or ask for a genre!"
        return "Which year are you interested in? Try \"best movies from 2023\" or \"movies from the 90s\"!"

    def _is_director_query(self, msg: str) -> bool:
        patterns = [r"(who |what )?(directed?|made|created?)", r"director of", r"films? by",
                    r"movies? by", r"directed by"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_director_query(self, msg: str) -> str:
        movie = self._is_fuzzy_movie(msg)
        if movie:
            genres = ", ".join(movie.get("_genres_list", []))
            director = movie.get("director", "N/A")
            stars_raw = movie.get("stars", "")
            if isinstance(stars_raw, str):
                stars = ", ".join(stars_raw.split(",")[:5])
            else:
                stars = ", ".join(stars_raw[:5]) if stars_raw else "N/A"
            platforms = self._get_streaming_for_movie(movie.get("id", ""))
            streaming_str = self._format_streaming(platforms)
            streaming_line = f"\n**Streaming:** {streaming_str}" if streaming_str else ""
            return (f"**{movie['title']}** ({movie.get('year', 'N/A')})\n"
                    f"{'='*40}\n"
                    f"**Director:** {director}\n"
                    f"**Rating:** {movie.get('rating', 0)}/10 ({movie.get('votes', 0):,} votes)\n"
                    f"**Duration:** {movie.get('duration', 'N/A')}\n"
                    f"**Genres:** {genres}{streaming_line}\n"
                    f"**Cast:** {stars}\n\n"
                    f"{movie.get('description', 'No description available.')}")

        for name, movies in self.director_index.items():
            if name in msg:
                movies = sorted(movies, key=lambda x: x.get("rating", 0), reverse=True)[:5]
                display_name = name.title()
                lines = [f"**{display_name}** has directed some incredible films:\n"]
                for i, m in enumerate(movies, 1):
                    lines.append(self._format_movie_with_streaming(m, i))
                lines.append("\nWant to know more about any of these?")
                return "\n".join(lines)
        return "Which director are you interested in? Try \"movies by Christopher Nolan\" or \"films by Steven Spielberg\"!"

    def _is_actor_query(self, msg: str) -> bool:
        patterns = [r"(movies?|films?) (with|starring|featuring|by) \w", r"who (starred?|acted|appeared)",
                    r"(starred|acted|appeared) in", r"filmography", r"acted by"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_actor_query(self, msg: str) -> str:
        for name, movies in self.actor_index.items():
            if name in msg:
                movies = sorted(movies, key=lambda x: x.get("rating", 0), reverse=True)[:5]
                display_name = name.title()
                lines = [f"**{display_name}** has been in some incredible films:\n"]
                for i, m in enumerate(movies, 1):
                    lines.append(self._format_movie_with_streaming(m, i))
                lines.append("\nWant details on any of these?")
                return "\n".join(lines)

        movie = self._is_fuzzy_movie(msg)
        if movie:
            genres = ", ".join(movie.get("_genres_list", []))
            stars_raw = movie.get("stars", "")
            if isinstance(stars_raw, str):
                stars = ", ".join(stars_raw.split(",")[:5])
            else:
                stars = ", ".join(stars_raw[:5]) if stars_raw else "N/A"
            director = movie.get("director", "N/A")
            platforms = self._get_streaming_for_movie(movie.get("id", ""))
            streaming_str = self._format_streaming(platforms)
            streaming_line = f"\n**Streaming:** {streaming_str}" if streaming_str else ""
            return (f"**{movie['title']}** ({movie.get('year', 'N/A')})\n"
                    f"{'='*40}\n"
                    f"**Rating:** {movie.get('rating', 0)}/10 ({movie.get('votes', 0):,} votes)\n"
                    f"**Duration:** {movie.get('duration', 'N/A')}\n"
                    f"**Director:** {director}\n"
                    f"**Cast:** {stars}\n"
                    f"**Genres:** {genres}{streaming_line}\n\n"
                    f"{movie.get('description', 'No description available.')}")

        return "Which actor or actress are you curious about? Try \"movies with Tom Hanks\" or \"films starring Scarlett Johansson\"!"

    def _is_rating_query(self, msg: str) -> bool:
        patterns = [r"best.?rated", r"highest.?rated", r"top.?rated", r"best movies",
                    r"best films", r"greatest (movies?|films?)", r"masterpieces?",
                    r"must.?watch", r"10/10", r"perfect (movie|film|score)",
                    r"top (10|5|20|25)", r"all.?time best", r"best of all",
                    r"best movie", r"give me the best", r"show me the best",
                    r"what are the best", r"list.*(best|top|great)"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_rating_query(self, msg: str = "") -> str:
        top = sorted(self.movies, key=lambda x: x.get("rating", 0), reverse=True)[:10]
        lines = ["Here are the **highest rated** movies in my database:\n"]
        for i, m in enumerate(top, 1):
            lines.append(self._format_movie_with_streaming(m, i))
        lines.append("\nThese are all critically acclaimed. Want to explore a specific genre?")
        return "\n".join(lines)

    def _is_movie_request(self, msg: str) -> bool:
        patterns = [r"recommend", r"suggest", r"what.*watch", r"find.*movie",
                    r"give.*recommendation", r"movie.*for me", r"film.*suggest",
                    r"looking for.*movie", r"need.*movie", r"want.*watch",
                    r"what should i watch", r"pick.*movie", r"choose.*movie",
                    r"something to watch", r"movie night", r"tonight.*watch",
                    r"any (good|great|nice|cool) movie", r"what.*good",
                    r"give me.*movie", r"show me.*movie", r"what('s| is) a good"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_movie_request(self, msg: str) -> str:
        mood = self._detect_mood(msg)
        if mood:
            return self._handle_mood_query(msg)

        detected = _detect_genres(msg)
        if detected:
            self.pending_genre_confirm = detected
            return self._ask_genre_confirmation(detected)

        top_movies = sorted(self.movies, key=lambda x: x.get("rating", 0), reverse=True)[:5]
        lines = ["Here are some highly rated movies you might enjoy:\n"]
        for i, m in enumerate(top_movies, 1):
            lines.append(self._format_movie_with_streaming(m, i))
        lines.append("\nTell me more about what you're looking for and I'll narrow it down!")
        return "\n".join(lines)

    def _is_mood_query(self, msg: str) -> bool:
        mood_words = {
            "happy": ["happy", "cheerful", "feel-good", "uplifting", "fun", "lighthearted",
                       "good mood", "great day", "celebrate", "joy", "smile", "awesome day",
                       "fantastic", "wonderful", "great", "amazing", "in a good mood"],
            "sad": ["sad", "down", "depressed", "heartbroken", "crying", "upset", "bad day",
                     "feeling low", "lonely", "miss someone", "tearjerker", "heartbreaking",
                     "devastated", "miserable", "gloomy", "melancholy", "heartache", "grief",
                     "broken heart", "feeling sad", "feeling down", "feeling low"],
            "excited": ["excited", "pumped", "thrilled", "adrenaline", "intense", "wild",
                         "hyped", "ready for action", "energized", "pumped up"],
            "scary": ["scary", "horror", "creepy", "terrified", "spooky", "fright",
                       "nightmare", "haunted", "frightening", "terrifying", "chilling",
                       "spine-chilling", "bone-chilling"],
            "romantic": ["romantic", "love", "date night", "cuddle", "sweet", "heartwarming",
                          "romance", "valentine", "love story", "love movie"],
            "thoughtful": ["thoughtful", "deep", "meaningful", "philosophy", "think", "brain",
                            "intellectual", "profound", "thought-provoking", "mind-bending"],
            "bored": ["bored", "boring", "nothing to do", "entertain me", "kill time",
                       "something to watch", "nothing to watch", "stuck at home"],
            "nostalgic": ["nostalgic", "old school", "classic", "retro", "throwback",
                           "childhood", "90s", "80s", "growing up", "remember when"],
        }
        for words in mood_words.values():
            if any(w in msg for w in words):
                return True
        return False

    def _detect_mood(self, msg: str) -> Optional[str]:
        mood_map = {
            "happy": ["happy", "cheerful", "feel-good", "uplifting", "fun", "lighthearted",
                       "good mood", "smile", "joy", "great day", "awesome", "fantastic",
                       "wonderful", "amazing", "in a good mood", "celebrate"],
            "sad": ["sad", "down", "depressed", "heartbroken", "crying", "upset", "bad day",
                     "feeling low", "lonely", "miss someone", "devastated", "miserable",
                     "gloomy", "melancholy", "heartache", "grief", "broken heart",
                     "feeling sad", "feeling down"],
            "excited": ["excited", "pumped", "thrilled", "adrenaline", "intense", "wild",
                         "hyped", "energized", "pumped up"],
            "scary": ["scary", "creepy", "terrified", "spooky", "fright", "nightmare",
                       "haunted", "frightening", "terrifying", "chilling"],
            "romantic": ["romantic", "love", "date night", "cuddle", "sweet", "heartwarming",
                          "romance", "valentine", "love story"],
            "thoughtful": ["thoughtful", "deep", "meaningful", "philosophy", "intellectual",
                            "profound", "thought-provoking", "mind-bending"],
            "bored": ["bored", "boring", "nothing to do", "entertain me", "kill time",
                       "something to watch", "nothing to watch", "stuck at home"],
            "nostalgic": ["nostalgic", "old school", "classic", "retro", "throwback",
                           "childhood", "90s", "80s", "growing up"],
        }
        for mood, keywords in mood_map.items():
            if any(k in msg for k in keywords):
                return mood
        return None

    def _handle_mood_query(self, msg: str) -> str:
        mood = self._detect_mood(msg)
        if not mood:
            return "Tell me how you're feeling and I'll suggest the perfect movie!"

        mood_to_genres = {
            "happy": ["Comedy", "Animation", "Family"],
            "sad": ["Comedy", "Animation", "Family"],
            "excited": ["Action", "Adventure", "Thriller"],
            "scary": ["Horror", "Thriller"],
            "romantic": ["Romance", "Comedy"],
            "thoughtful": ["Drama", "Sci-Fi", "Mystery"],
            "bored": ["Action", "Comedy", "Adventure"],
            "nostalgic": ["Comedy", "Animation", "Romance"],
        }
        genres = mood_to_genres.get(mood, ["Comedy", "Animation"])

        all_movies: dict[str, dict] = {}
        for g in genres:
            for m in self.genre_index.get(g.lower(), []):
                key = m.get("title", "")
                if key and key not in all_movies:
                    all_movies[key] = m

        top = sorted(all_movies.values(), key=lambda x: x.get("rating", 0), reverse=True)[:5]

        mood_responses = {
            "happy": [
                "Love that positive energy! Here are some feel-good movies to keep the good vibes going:",
                "Great mood = great movie time! These picks will keep you smiling:",
                "Awesome! When you're already feeling great, these movies make it even better:",
                "Happy you're happy! Here are some films that match your good vibes:",
            ],
            "sad": [
                "I'm sorry you're feeling down. Sometimes a good laugh or a heartwarming story can help. Here are some picks to lift your spirits:",
                "Tough days happen to everyone. These movies are guaranteed to make you feel a little better:",
                "Sending good vibes your way! Whether you want to laugh it off or feel comforted, I've got you:",
                "Hey, we all have those days. Here are some feel-good movies that might brighten things up:",
                "I hear you. Here are some comforting, uplifting movies that might turn your day around:",
            ],
            "excited": [
                "Let's go! Here are some heart-pounding picks to match that energy:",
                "Now we're talking! These movies will keep that adrenaline pumping:",
                "I love the enthusiasm! Buckle up for these intense picks:",
                "That's the spirit! Here are some edge-of-your-seat movies for you:",
            ],
            "scary": [
                "Ooh, ready to be scared? I respect the courage! Here are some terrifying picks:",
                "You like it dark, huh? These horror films will definitely keep the lights on tonight:",
                "Brave! Here are some genuinely creepy movies that'll mess with your head:",
                "Horror fan spotted! These films are seriously unsettling:",
            ],
            "romantic": [
                "Aww! Here are some beautiful love stories that'll make your heart full:",
                "Love is in the air! These romantic films are absolute gems:",
                "Perfect for date night or just embracing the feels! Check these out:",
                "Nothing beats a great love story. Here are some of my favorites:",
            ],
            "thoughtful": [
                "I love a movie that makes you think. These are real mind-benders:",
                "For the deep thinker in you! These films will stay with you long after the credits:",
                "Time to engage the brain. Here are some thought-provoking masterpieces:",
                "Great taste! These movies will challenge how you see the world:",
            ],
            "bored": [
                "Boredom ends now! Here are some movies that'll hook you from the start:",
                "Say no more! These films are guaranteed to keep you glued to the screen:",
                "I've got just the cure for boredom. These picks are seriously entertaining:",
                "Let's fix that! Here are some gripping movies you won't be able to stop watching:",
            ],
            "nostalgic": [
                "Taking it back! Here are some classic gems that'll bring back the memories:",
                "Nostalgia mode activated! These films are timeless for a reason:",
                "Love the throwback vibes! Here are some classics that still hold up today:",
                "Sometimes the old ones really are the best. Check these out!",
            ],
        }

        resp = random.choice(mood_responses.get(mood, ["Here are some picks:"]))
        lines = [f"{resp}\n"]
        for i, m in enumerate(top, 1):
            lines.append(self._format_movie_with_streaming(m, i))
        lines.append("\nWant more options or details on any of these?")
        return "\n".join(lines)

    def _is_specific_movie(self, msg: str) -> bool:
        return self._is_fuzzy_movie(msg) is not None

    def _handle_specific_movie(self, msg: str) -> str:
        movie = self._is_fuzzy_movie(msg)
        if movie:
            genres = ", ".join(movie.get("_genres_list", []))
            stars_raw = movie.get("stars", "")
            if isinstance(stars_raw, str):
                stars = ", ".join(stars_raw.split(",")[:3])
            else:
                stars = ", ".join(stars_raw[:3]) if stars_raw else "N/A"
            director = movie.get("director", "N/A")
            desc = movie.get("description", "No description available.")

            platforms = self._get_streaming_for_movie(movie.get("id", ""))
            streaming_str = self._format_streaming(platforms)
            streaming_line = f"\n\n**Where to watch:** {streaming_str}" if streaming_str else ""

            self.last_movie_context = movie
            return random.choice([
                (f"**{movie['title']}** ({movie.get('year', 'N/A')})\n"
                 f"{movie.get('rating', 0)}/10 | {movie.get('duration', 'N/A')} | {movie.get('certificate', 'N/A')}\n\n"
                 f"**Director:** {director}\n"
                 f"**Cast:** {stars}\n"
                 f"**Genres:** {genres}\n\n"
                 f"{desc}{streaming_line}\n\n"
                 f"Want me to find similar movies or tell you more?"),
                (f"Oh, **{movie['title']}** is a fantastic choice!\n"
                 f"Rated {movie.get('rating', 0)}/10 | {movie.get('duration', 'N/A')}\n\n"
                 f"Directed by {director}, starring {stars}\n"
                 f"Genres: {genres}\n\n"
                 f"{desc}{streaming_line}\n\n"
                 f"Want similar recommendations?"),
            ])
        return "Hmm, I couldn't find that exact movie. Try the exact title or ask about a popular movie!"

    def _handle_similar_from_context(self, ctx: dict) -> str:
        source_genres = set(ctx.get("_genres_list", []))
        similar = []
        for m in self.movies:
            if m.get("title", "").lower() == ctx.get("title", "").lower():
                continue
            other_genres = set(m.get("_genres_list", []))
            overlap = len(source_genres & other_genres)
            if overlap > 0:
                similar.append((m, overlap))
        similar.sort(key=lambda x: (-x[1], -x[0].get("rating", 0)))
        if not similar:
            return f"I don't have many movies similar to **{ctx['title']}** right now. Try asking about a different genre or mood!"

        top5 = [m for m, _ in similar[:5]]
        lines = [f"Since you liked **{ctx['title']}**, here are similar movies:\n"]
        for i, m in enumerate(top5, 1):
            lines.append(self._format_movie_with_streaming(m, i))
        lines.append("\nWant details on any of these, or something different?")
        return "\n".join(lines)

    def _is_recommendation_request(self, msg: str) -> bool:
        patterns = [r"something like", r"similar to", r"movies? like", r"films? like",
                    r"reminds me of", r"same vibe", r"same style",
                    r"if i (liked|love|enjoyed)", r"movies? (similar|related)"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_recommendation_request(self, msg: str) -> str:
        movie = self._is_fuzzy_movie(msg)
        if movie:
            source_genres = set(movie.get("_genres_list", []))
            similar = []
            for m in self.movies:
                if m["title"].lower() == movie["title"].lower():
                    continue
                other_genres = set(m.get("_genres_list", []))
                overlap = len(source_genres & other_genres)
                if overlap > 0:
                    similar.append((m, overlap))
            similar.sort(key=lambda x: (-x[1], -x[0].get("rating", 0)))
            if similar:
                lines = [f"If you loved **{movie['title']}**, you'll probably enjoy these:\n"]
                for i, (m, _) in enumerate(similar[:5], 1):
                    lines.append(self._format_movie_with_streaming(m, i))
                lines.append("\nThey share similar themes. Want more suggestions?")
                self.last_movie_context = similar[0][0]
                return "\n".join(lines)
        return "Tell me a movie you enjoyed and I'll suggest similar ones! For example: \"Something like Inception\""

    def _is_comparison_query(self, msg: str) -> bool:
        return any(w in msg for w in ["better", "compare", "vs", "versus", "which is better"])

    def _handle_comparison_query(self, msg: str) -> str:
        separators = [" vs ", " versus ", " or ", " compare ", " better, ", " better "]
        parts = None
        for sep in separators:
            if sep in msg:
                parts = [p.strip() for p in msg.split(sep, 1)]
                break
        if not parts:
            parts = re.split(r'\s+(?:vs|versus|or)\s+', msg, maxsplit=1)

        found = []
        if parts and len(parts) == 2:
            for part in parts:
                movie = self._is_fuzzy_movie(part)
                if movie:
                    found.append(movie)
        if len(found) < 2:
            for title, movie in self.movies_by_title.items():
                if title in msg:
                    found.append(movie)
            found = list(dict.fromkeys(found))

        if len(found) >= 2:
            m1, m2 = found[0], found[1]
            winner = m1 if m1.get("rating", 0) >= m2.get("rating", 0) else m2
            loser = m2 if winner == m1 else m1
            diff = abs(m1.get("rating", 0) - m2.get("rating", 0))
            g1 = ", ".join(m1.get("_genres_list", [])[:2])
            g2 = ", ".join(m2.get("_genres_list", [])[:2])

            p1 = self._format_streaming(self._get_streaming_for_movie(m1.get("id", "")))
            p2 = self._format_streaming(self._get_streaming_for_movie(m2.get("id", "")))
            p1_line = f"\n  Stream: {p1}" if p1 else ""
            p2_line = f"\n  Stream: {p2}" if p2 else ""

            return random.choice([
                (f"**{m1['title']}** vs **{m2['title']}**\n\n"
                 f"{m1['title']}: {m1.get('rating', 0)}/10 ({m1.get('votes', 0):,} votes) | {g1}{p1_line}\n"
                 f"{m2['title']}: {m2.get('rating', 0)}/10 ({m2.get('votes', 0):,} votes) | {g2}{p2_line}\n\n"
                 f"**{winner['title']}** edges it out! {'Very close call!' if diff < 0.5 else 'Both are worth watching!'}"),
                (f"Great matchup!\n\n"
                 f"**{m1['title']}**: {m1.get('rating', 0)}/10{p1_line}\n"
                 f"**{m2['title']}**: {m2.get('rating', 0)}/10{p2_line}\n\n"
                 f"**Winner: {winner['title']}** {'by a hair!' if diff < 0.5 else '!'}"),
            ])
        if len(found) == 1:
            return f"I found **{found[0]['title']}** but not the other movie. Give me both titles to compare!"
        return "Tell me two movies to compare! For example: \"Inception vs The Matrix\""

    def _is_fact_query(self, msg: str) -> bool:
        patterns = [r"tell me about", r"what.*about", r"info.*on", r"details.*of",
                    r"who directed", r"who starred", r"describe", r"explain"]
        return any(re.search(p, msg) for p in patterns)

    def _handle_fact_query(self, msg: str) -> str:
        movie = self._is_fuzzy_movie(msg)
        if movie:
            genres = ", ".join(movie.get("_genres_list", []))
            stars_raw = movie.get("stars", "")
            if isinstance(stars_raw, str):
                stars = ", ".join(stars_raw.split(",")[:5])
            else:
                stars = ", ".join(stars_raw[:5]) if stars_raw else "N/A"
            director = movie.get("director", "N/A")

            platforms = self._get_streaming_for_movie(movie.get("id", ""))
            streaming_str = self._format_streaming(platforms)
            streaming_line = f"\n**Streaming:** {streaming_str}" if streaming_str else ""

            return random.choice([
                (f"**{movie['title']}** ({movie.get('year', 'N/A')})\n"
                 f"{'='*40}\n"
                 f"Rating: {movie.get('rating', 0)}/10 ({movie.get('votes', 0):,} votes)\n"
                 f"Duration: {movie.get('duration', 'N/A')}\n"
                 f"Certificate: {movie.get('certificate', 'N/A')}\n"
                 f"Language: {movie.get('language', 'N/A')}{streaming_line}\n\n"
                 f"**Director:** {director}\n"
                 f"**Cast:** {stars}\n"
                 f"**Genres:** {genres}\n\n"
                 f"{movie.get('description', 'No description available.')}"),
                (f"Here's the full scoop on **{movie['title']}**:\n\n"
                 f"Directed by {director} | {movie.get('year', 'N/A')} | {movie.get('duration', 'N/A')}\n"
                 f"Rating: {movie.get('rating', 0)}/10 with {movie.get('votes', 0):,} votes{streaming_line}\n"
                 f"Cast: {stars}\n"
                 f"Genres: {genres}\n\n"
                 f"{movie.get('description', 'No description available.')}"),
            ])
        return "I'd love to tell you about a movie! Which one are you curious about?"

    def _keyword_search(self, msg: str) -> Optional[str]:
        stop_words = {"a", "an", "the", "is", "are", "was", "were", "be", "been",
                       "being", "have", "has", "had", "do", "does", "did", "will",
                       "would", "could", "should", "may", "might", "can", "shall",
                       "i", "me", "my", "we", "you", "he", "she", "it", "they",
                       "what", "which", "who", "whom", "this", "that", "these",
                       "those", "am", "some", "any", "all", "no", "not", "very",
                       "just", "also", "too", "so", "and", "or", "but", "if",
                       "then", "than", "about", "for", "from", "with", "into",
                       "of", "on", "at", "to", "in", "by", "as", "up", "out",
                       "movie", "movies", "film", "films", "show", "watch",
                       "recommend", "suggest", "find", "give", "tell", "want",
                       "need", "like", "love", "good", "great", "best", "top",
                       "really", "something", "things", "type",
                       "yes", "yeah", "yep", "yup", "sure", "ok", "okay",
                       "nah", "nope", "nah", "cool", "nice", "awesome",
                       "hello", "hi", "hey", "bye", "thanks", "sorry"}
        words = [w.strip(".,!?;:'\"") for w in msg.lower().split()]
        keywords = [w for w in words if len(w) > 2 and w not in stop_words]

        if not keywords:
            return None

        scored: list[tuple[dict, float]] = []
        for m in self.movies:
            title_lower = m.get("title", "").lower()
            desc_lower = m.get("description", "").lower()
            genres_str = " ".join(m.get("_genres_list", [])).lower()
            director_lower = m.get("director", "").lower()
            stars_str = m.get("stars", "").lower() if isinstance(m.get("stars", ""), str) else " ".join(m.get("stars", [])).lower()

            score = 0.0
            for kw in keywords:
                if kw in title_lower:
                    score += 15
                if kw in genres_str:
                    score += 8
                if kw in director_lower:
                    score += 10
                if kw in stars_str:
                    score += 10
                if kw in desc_lower:
                    score += 3

            if score > 0:
                score += m.get("rating", 0) * 0.5
                scored.append((m, score))

        if not scored:
            return None

        scored.sort(key=lambda x: -x[1])
        top5 = [m for m, _ in scored[:5]]

        lines = [f"Here are some movies related to your query:\n"]
        for i, m in enumerate(top5, 1):
            lines.append(self._format_movie_with_streaming(m, i))
        lines.append("\nWant details on any of these, or something different?")
        return "\n".join(lines)

    def _handle_general_query(self, msg: str) -> str:
        if _is_yes(msg):
            return random.choice([
                "Great! I'd love to help! Tell me a bit about what you're in the mood for:\n\n"
                "  - How are you feeling right now? (happy, sad, excited, bored...)\n"
                "  - Any genre you like? (comedy, action, horror, sci-fi...)\n"
                "  - A favorite actor or director?\n"
                "  - A movie you loved recently?\n\n"
                "Just tell me and I'll find the perfect match!",

                "Awesome! Let's find you something great! You can tell me:\n\n"
                "  - Your mood (I'm feeling happy, sad, excited...)\n"
                "  - A genre (action, comedy, horror, romance...)\n"
                "  - A favorite actor or director\n"
                "  - A movie you enjoyed\n\n"
                "I'll take it from there!",

                "Let's do it! I can recommend based on:\n\n"
                "  - How you're feeling\n"
                "  - A genre or combo (try \"action comedy\" or \"scary\")\n"
                "  - A favorite actor or director\n"
                "  - A movie you loved\n\n"
                "What sounds good?",
            ])

        if _is_no(msg):
            return random.choice([
                "No worries! I'm here whenever you need movie help.",
                "All good! Come back anytime you want movie suggestions.",
                "Sure thing! Just let me know if you change your mind.",
            ])
        if any(w in msg for w in ["ok", "okay", "cool", "nice", "awesome", "great", "sweet", "perfect"]):
            return random.choice([
                "Awesome! Need anything else? I'm here to help!",
                "Great! Let me know if you want more recommendations!",
                "Glad you like it! What else can I help with?",
            ])

        return random.choice([
            "I'm not quite sure what you mean, but I'm great at finding movies! Try:\n\n"
            "  - \"Recommend something funny\"\n"
            "  - \"Tell me about Inception\"\n"
            "  - \"scary\" or \"action comedy\"\n"
            "  - \"Best horror movies\"\n"
            "  - \"Top rated movies\"\n\n"
            "Just talk to me naturally!",

            "Hmm, I might not have caught that. But I'm a movie expert! Try:\n\n"
            "  - \"Recommend something funny\"\n"
            "  - \"Tell me about Inception\"\n"
            "  - \"Best horror movies\"\n"
            "  - \"Movies like The Dark Knight\"\n"
            "  - \"Top rated movies\"\n\n"
            "Or just tell me how you're feeling!",

            "I might not have understood, but I love helping with movies!\n\n"
            "Try asking about:\n"
            "  - A specific movie title\n"
            "  - Your mood right now\n"
            "  - A genre you enjoy\n"
            "  - Movies similar to something you've seen\n\n"
            "I'm all ears!",
        ])
