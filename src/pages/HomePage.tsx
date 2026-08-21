import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Brain, Sparkles, Film, ListChecks, ChevronLeft, ChevronRight, ArrowRight, Clapperboard, Eye, Zap, BarChart3, Star, Route, Loader2, X, Play, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/movie/HeroSection";
import MovieCard from "@/components/movie/MovieCard";
import { moods } from "@/data/movies";
import { cn } from "@/lib/utils";
import { getTrending, getTopRated, getGenres, Movie, getMoodJourney, getMoodSuggestions, getGamificationStats, sendChatMessage } from "@/utils/api";

const genreGradients: Record<string, string> = {
  Action: "from-red-500/20 to-orange-500/20",
  Comedy: "from-yellow-500/20 to-amber-500/20",
  Drama: "from-blue-500/20 to-indigo-500/20",
  Horror: "from-gray-700/40 to-red-900/20",
  "Sci-Fi": "from-cyan-500/20 to-blue-500/20",
  Romance: "from-pink-500/20 to-rose-500/20",
  Thriller: "from-purple-500/20 to-gray-800/20",
  Animation: "from-green-400/20 to-emerald-500/20",
  Adventure: "from-emerald-500/20 to-teal-500/20",
  Crime: "from-slate-500/20 to-zinc-700/20",
  Mystery: "from-violet-500/20 to-purple-800/20",
  Fantasy: "from-fuchsia-500/20 to-pink-500/20",
  War: "from-stone-500/20 to-amber-800/20",
  Biography: "from-teal-500/20 to-cyan-700/20",
  History: "from-amber-600/20 to-yellow-800/20",
  Family: "from-sky-400/20 to-blue-400/20",
  Music: "from-indigo-400/20 to-purple-500/20",
  Western: "from-orange-600/20 to-yellow-700/20",
};

const MOOD_COLORS: Record<string, string> = {
  happy: "from-yellow-500 to-orange-400", sad: "from-blue-600 to-blue-400", excited: "from-red-500 to-orange-500",
  scared: "from-purple-700 to-red-600", romantic: "from-pink-500 to-rose-400", thoughtful: "from-indigo-600 to-purple-500",
  adventurous: "from-green-500 to-emerald-400", dramatic: "from-red-700 to-red-500", curious: "from-cyan-500 to-blue-500",
  nostalgic: "from-amber-600 to-yellow-500", inspired: "from-yellow-400 to-orange-400", calm: "from-teal-500 to-cyan-400",
  tense: "from-red-800 to-purple-700", magical: "from-purple-500 to-pink-400",
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊", sad: "😢", excited: "🔥", scared: "😱", romantic: "💕", thoughtful: "🤔",
  adventurous: "🗺️", dramatic: "🎭", curious: "🔍", nostalgic: "🌅", inspired: "✨", calm: "🧘", tense: "😰", magical: "✨",
};

const howItWorks = [
  { icon: <Clapperboard className="w-7 h-7" />, title: "Take the Quiz", description: "Answer a few questions about your taste, mood, and preferences." },
  { icon: <Brain className="w-7 h-7" />, title: "AI Analyzes", description: "Our advanced AI processes your answers and identifies patterns that match your taste." },
  { icon: <Sparkles className="w-7 h-7" />, title: "Get Recommendations", description: "Receive personalized movie picks curated just for you." },
];

const features = [
  { icon: <Brain className="w-6 h-6" />, title: "AI-Powered Recommendations", description: "Machine learning algorithms analyze your preferences for spot-on suggestions." },
  { icon: <Eye className="w-6 h-6" />, title: "Smart Mood Detection", description: "We match movies to your current mood and emotional state for perfect timing." },
  { icon: <Film className="w-6 h-6" />, title: "Genre Analysis", description: "Deep genre profiling goes beyond labels to understand sub-genres and themes." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Personalized Matching", description: "The more you use MovieMind, the smarter your recommendations become." },
  { icon: <Zap className="w-6 h-6" />, title: "Real-time Updates", description: "Stay current with trending movies and freshly released gems in real time." },
  { icon: <ListChecks className="w-6 h-6" />, title: "Watchlist Management", description: "Save, organize, and track movies you want to watch across all your devices." },
];

function HorizontalScrollRow({ title, subtitle, moviesList, viewAllLink, loading }: { title: string; subtitle?: string; moviesList: Movie[]; viewAllLink: string; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: direction === "left" ? -400 : 400, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-white">{title}</h2>{subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}</div></div>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-none w-[220px]"><div className="rounded-xl bg-zinc-800/50 animate-pulse"><div className="aspect-[2/3] bg-zinc-700/50 rounded-t-xl" /><div className="p-3 space-y-2"><div className="h-4 bg-zinc-700/50 rounded w-3/4" /><div className="h-3 bg-zinc-700/50 rounded w-1/2" /></div></div></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-white">{title}</h2>{subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:border-primary/50 hover:bg-primary/10" onClick={() => scroll("left")} aria-label="Scroll left"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:border-primary/50 hover:bg-primary/10" onClick={() => scroll("right")} aria-label="Scroll right"><ChevronRight className="w-4 h-4" /></Button>
          <Link to={viewAllLink}><Button variant="ghost" className="text-primary hover:text-primary-light ml-2">View All <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {moviesList.map((movie) => (
          <div key={movie.id} className="flex-none w-[220px] snap-start"><MovieCard movie={movie} compact /></div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [moodJourney, setMoodJourney] = useState<Array<{mood: string; movie: Movie; reason: string}>>([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{text: string; sender: "user" | "bot"}>>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, topRatedRes, genresRes, moodsRes, statsRes] = await Promise.all([getTrending(12), getTopRated(12), getGenres(), getMoodSuggestions(), getGamificationStats()]);
        setTrendingMovies(trendingRes.movies);
        setTopRatedMovies(topRatedRes.movies);
        setAllGenres(genresRes.genres);
        setAvailableMoods(moodsRes.moods);
        setUserStats(statsRes.stats);
      } catch (err) { console.error("Failed to fetch homepage data:", err); } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const addMood = (mood: string) => { if (!selectedMoods.includes(mood)) setSelectedMoods((prev) => [...prev, mood]); setShowMoodPicker(false); };
  const removeMood = (mood: string) => { setSelectedMoods((prev) => prev.filter((m) => m !== mood)); };
  const generateMoodJourney = async () => {
    if (selectedMoods.length === 0) return;
    setMoodLoading(true);
    try { const res = await getMoodJourney(selectedMoods, 2); setMoodJourney(res.journey); } catch (e) { console.error(e); } finally { setMoodLoading(false); }
  };
  const sendChat = async (text: string) => {
    if (!text.trim() || chatLoading) return;
    setChatMessages((prev) => [...prev, { text, sender: "user" }]);
    setChatInput("");
    setChatLoading(true);
    try { const res = await sendChatMessage(text); setChatMessages((prev) => [...prev, { text: res.response, sender: "bot" }]); }
    catch { setChatMessages((prev) => [...prev, { text: "Sorry, something went wrong.", sender: "bot" }]); } finally { setChatLoading(false); }
  };

  return (
    <main className="bg-background min-h-screen">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-16">
        <section className="animate-fade-in-up">
          <HorizontalScrollRow title="Trending Now" subtitle="Most popular movies this week" moviesList={trendingMovies} viewAllLink="/search" loading={loading} />
        </section>

        <section className="animate-fade-in-up stagger-2">
          <HorizontalScrollRow title="Top Rated" subtitle="Critically acclaimed masterpieces" moviesList={topRatedMovies} viewAllLink="/search" loading={loading} />
        </section>

        <section className="animate-fade-in-up stagger-3">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Popular Genres</h2>
            <p className="text-muted-foreground mt-2">Explore movies by genre and discover new favorites</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="rounded-xl bg-zinc-800/50 animate-pulse h-28" />))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allGenres.map((genre) => (
                <Link key={genre} to={`/search?genre=${encodeURIComponent(genre)}`}>
                  <Card className={cn("group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden bg-gradient-to-br", genreGradients[genre] || "from-gray-500/20 to-gray-700/20")}>
                    <CardContent className="p-5 text-center">
                      <Film className="w-8 h-8 mx-auto mb-3 text-white/70 group-hover:text-primary transition-colors" />
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{genre}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="animate-fade-in-up stagger-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-purple-400" /><h2 className="text-2xl font-bold text-white">AI Movie Chat</h2></div>
              <p className="text-muted-foreground">Ask anything about movies - get recommendations, find similar films, or compare titles. Powered by our 7,912 movie database.</p>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && <div className="text-center text-zinc-500 text-sm py-8">Try: "Recommend a sci-fi movie" or "I feel like laughing"</div>}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line", msg.sender === "user" ? "bg-purple-600 text-white rounded-br-md" : "bg-zinc-800 text-zinc-200 rounded-bl-md")}>{msg.text}</div>
                    </div>
                  ))}
                  {chatLoading && <div className="flex justify-start"><div className="bg-zinc-800 rounded-2xl rounded-bl-md px-3.5 py-2.5"><Loader2 className="h-4 w-4 text-purple-400 animate-spin" /></div></div>}
                </div>
                <div className="px-3 pb-2 flex flex-wrap gap-1.5 border-t border-zinc-800 pt-2">
                  {["Recommend a Sci-Fi movie", "I feel like laughing", "Best rated movies"].map((s) => (
                    <button key={s} onClick={() => sendChat(s)} disabled={chatLoading} className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-50">{s}</button>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }} className="flex items-center gap-2 p-3 border-t border-zinc-800">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about movies..." disabled={chatLoading} className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50" />
                  <Button type="submit" size="icon" disabled={!chatInput.trim() || chatLoading} className="bg-purple-600 hover:bg-purple-500 rounded-xl h-9 w-9"><ArrowRight className="h-4 w-4" /></Button>
                </form>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2"><Route className="w-5 h-5 text-blue-400" /><h2 className="text-2xl font-bold text-white">Mood Journey</h2></div>
              <p className="text-muted-foreground">Build a mood arc and get the top 5 movies that match your combined mood journey.</p>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {selectedMoods.map((mood) => (
                    <div key={mood} className={cn("relative px-3 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 bg-gradient-to-r animate-scale-in", MOOD_COLORS[mood] || "from-gray-500 to-gray-400")}>
                      <span>{MOOD_EMOJIS[mood]}</span><span className="capitalize">{mood}</span>
                      <button onClick={() => removeMood(mood)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {selectedMoods.length === 0 && <p className="text-zinc-500 text-sm w-full text-center py-4">Click a mood below to start</p>}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {availableMoods.map((mood) => (
                    <button key={mood} onClick={() => addMood(mood)} className={cn("p-2 rounded-lg text-center transition-all hover:scale-105 bg-gradient-to-r text-white text-xs btn-press", MOOD_COLORS[mood] || "from-gray-500 to-gray-400")}>
                      <span className="text-lg block">{MOOD_EMOJIS[mood]}</span><span className="capitalize">{mood}</span>
                    </button>
                  ))}
                </div>
                {selectedMoods.length > 0 && (
                  <Button onClick={generateMoodJourney} disabled={moodLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                    {moodLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    {moodLoading ? "Creating..." : "Generate Journey"}
                  </Button>
                )}
              </div>
              {moodJourney.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Top {moodJourney.length} movies for your mood journey</p>
                  {moodJourney.map((item, i) => (
                    <Link to={`/movie/${item.movie.id}`} key={i}>
                      <div className={cn("flex gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 hover:border-purple-500/50 transition-all group animate-fade-in-up", `stagger-${Math.min(i + 1, 8)}`)}>
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                          {item.movie.poster ? (<img src={item.movie.poster} alt={item.movie.title} className="w-full h-full object-cover" />) : (<div className={cn("w-full h-full flex items-center justify-center text-lg bg-gradient-to-r", MOOD_COLORS[item.mood] || "from-gray-500 to-gray-400")}>{MOOD_EMOJIS[item.mood]}</div>)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-500 capitalize">{item.mood}</p>
                          <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors truncate">{item.movie.title}</p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span>{item.movie.rating}</span><span>{item.movie.year}</span></div>
                          <p className="text-xs text-zinc-600 truncate mt-0.5">{item.reason}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up stagger-5">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">How It Works</h2><p className="text-muted-foreground mt-2">Three simple steps to find your next favorite movie</p></div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {howItWorks.map((item, i) => (
              <div key={item.title} className="flex items-center gap-4 md:gap-6">
                <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 text-center w-64">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
                  </CardContent>
                </Card>
                {i < howItWorks.length - 1 && <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0"><ArrowRight className="w-5 h-5 text-primary" /></div>}
              </div>
            ))}
          </div>
        </section>

        <section className="animate-fade-in-up stagger-6">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">Features</h2><p className="text-muted-foreground mt-2">Everything you need for the perfect movie night</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300 h-full group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">{feature.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="animate-fade-in-up stagger-7">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-secondary/10 overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none" />
              <div className="relative z-10">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to find your next favorite movie?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Take a quick quiz and let our AI find the perfect movies tailored just for you.</p>
                <Link to="/quiz">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 btn-press">
                    <Sparkles className="w-5 h-5 mr-2" />Start the Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {showMoodPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowMoodPicker(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add a Mood</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableMoods.map((mood) => (
                <button key={mood} onClick={() => addMood(mood)} disabled={selectedMoods.includes(mood)} className={cn("p-3 rounded-xl text-center transition-all hover:scale-105 bg-gradient-to-r text-white disabled:opacity-40 btn-press", MOOD_COLORS[mood] || "from-gray-500 to-gray-400")}>
                  <span className="text-2xl block">{MOOD_EMOJIS[mood]}</span><span className="text-xs capitalize">{mood}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setShowMoodPicker(false)} className="w-full mt-4 text-zinc-400">Cancel</Button>
          </div>
        </div>
      )}
    </main>
  );
}
