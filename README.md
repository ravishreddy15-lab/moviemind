# MovieMind — AI-Powered Movie Recommendation Platform

An intelligent, full-stack movie recommendation system that uses AI chat, mood-based journeys, and preference quizzes to deliver personalized film suggestions across a database of 8,200+ movies with real-time streaming availability.

> Developed during the **NVIDIA Intensive AI GPU Summer Internship**

---

## Features

### AI Chat Assistant
- Natural language queries for mood, genre, actors, directors, ratings
- Fuzzy matching with context-aware conversations
- Actor and director index lookups
- Movie comparison queries
- Genre synonym mapping

### Smart Recommendations
- Multi-step preference quiz (mood, genre, style, pacing, runtime)
- Match-scored personalized suggestions
- Top-rated and trending movie feeds

### Mood Journey Builder
- Construct emotional arcs with multiple moods
- Receive top 5 movies matching your combined mood sequence

### Streaming Availability
- Real-time data from TMDB API
- Supports Netflix, Prime Video, Disney+, HBO Max, Apple TV+, and more

### Watchlist & Tracking
- Watchlist, like, and viewed tracking
- Per-movie genre profiling for adaptive learning

### Gamified Profile
- 9 achievement badges (First Steps, Explorer, Night Owl, Binge Watcher, Curator, Critic, Connoisseur, Genre Master, Quiz Pro)
- Stats dashboard with progress tracking
- Reset functionality

### Performance Optimized
- Zero external animation libraries
- GPU-accelerated CSS animations
- 23% smaller JS bundle
- 10x faster build times

---

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

### Backend
- Python
- FastAPI
- TMDB API Integration
- JSON-based chat engine

### Deployment
- Railway (Backend)
- GitHub Pages / Vercel (Frontend)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/ravishreddy15-lab/moviemind.git
cd moviemind
```

#### Frontend Setup

```bash
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend will start at `http://127.0.0.1:8000`

---

## Project Structure

```
moviemind/
├── backend/
│   ├── chat_engine.py          # AI chat logic
│   ├── main.py                 # FastAPI server
│   └── data/
│       ├── movies.json         # 8,203 movies/TV shows
│       └── streaming_cache.json
├── src/
│   ├── components/
│   │   ├── chat/               # AI Chat Assistant
│   │   ├── layout/             # Navbar, Footer
│   │   ├── movie/              # MovieCard, HeroSection, etc.
│   │   └── quiz/               # Quiz components
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── QuizPage.tsx
│   │   ├── MovieDetailsPage.tsx
│   │   ├── WatchlistPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── MoodJourneyPage.tsx
│   │   ├── RecommendationPage.tsx
│   │   ├── LoadingPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── utils/
│   │   ├── api.ts              # API utilities
│   │   └── watchlist.ts        # LocalStorage management
│   ├── index.css               # Custom animations
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── package.json
└── README.md
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/movies/trending` | GET | Get trending movies |
| `/api/movies/top-rated` | GET | Get top-rated movies |
| `/api/movies/{id}` | GET | Get movie details |
| `/api/search` | GET | Search movies |
| `/api/recommendations` | GET | Get recommendations |
| `/api/movies/{id}/similar` | GET | Get similar movies |
| `/api/movies/{id}/streaming` | GET | Get streaming platforms |
| `/api/mood/journey` | POST | Generate mood journey |
| `/api/mood/suggestions` | GET | Get available moods |
| `/api/chat` | POST | Send chat message |
| `/api/genres` | GET | Get all genres |
| `/api/gamification/stats` | GET | Get user stats |

---

## Key Highlights

- **8,203** movies and TV shows in database
- **Real-time** TMDB streaming data
- **Zero** external animation libraries
- **23%** smaller bundle size
- **10x** faster builds
- **9** gamification badges

---

## License

This project is for educational purposes as part of the NVIDIA Intensive AI GPU Summer Internship.

---

## Author

**Ravi Reddy**  
NVIDIA Intensive AI GPU Summer Internship

GitHub: [ravishreddy15-lab](https://github.com/ravishreddy15-lab)
