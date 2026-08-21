import { useState, useEffect } from "react";
import { Award, Bookmark, Heart, Eye, TrendingUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWatchlist, getLiked, getViewed, getViewedGenres, getQuizCompleted } from "@/utils/watchlist";

function getUserEmail(): string {
  try {
    const user = JSON.parse(localStorage.getItem("moviemind_user") || "{}");
    return user.email || "guest";
  } catch { return "guest"; }
}

const BADGE_DEFS = [
  { id: "first_steps", name: "First Steps", icon: "🎬", req: 1, key: "viewed", desc: "View your first movie" },
  { id: "explorer", name: "Explorer", icon: "🧭", req: 10, key: "viewed", desc: "View 10 movies" },
  { id: "night_owl", name: "Night Owl", icon: "🦉", req: 25, key: "viewed", desc: "View 25 movies" },
  { id: "binge_watcher", name: "Binge Watcher", icon: "🍿", req: 50, key: "viewed", desc: "View 50 movies" },
  { id: "curator", name: "Curator", icon: "📋", req: 5, key: "watchlist", desc: "Add 5 movies to watchlist" },
  { id: "critic", name: "Critic", icon: "⭐", req: 5, key: "liked", desc: "Like 5 movies" },
  { id: "connoisseur", name: "Connoisseur", icon: "🏆", req: 15, key: "liked", desc: "Like 15 movies" },
  { id: "genre_master", name: "Genre Master", icon: "🎭", req: 15, key: "genres", desc: "Explore 15 genres" },
  { id: "quiz_pro", name: "Quiz Pro", icon: "📝", req: 1, key: "quiz", desc: "Complete a quiz" },
];

export default function ProfilePage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const loadData = () => {
    setWatchlist(getWatchlist());
    setLiked(getLiked());
    setViewed(getViewed());
    setGenres(getViewedGenres());
    setQuizzesCompleted(getQuizCompleted());
    setUserEmail(getUserEmail());
  };

  const resetAllData = () => {
    localStorage.removeItem("moviemind_watchlist");
    localStorage.removeItem("moviemind_liked");
    localStorage.removeItem("moviemind_viewed");
    localStorage.removeItem("moviemind_viewed_genres");
    localStorage.removeItem("moviemind_quiz_completed");
    window.dispatchEvent(new Event("moviemind-data-changed"));
    loadData();
  };

  useEffect(() => {
    loadData();
    window.addEventListener("moviemind-data-changed", loadData);
    document.addEventListener("visibilitychange", loadData);
    return () => { window.removeEventListener("moviemind-data-changed", loadData); document.removeEventListener("visibilitychange", loadData); };
  }, []);

  const earnedBadges = BADGE_DEFS.filter((b) => {
    if (b.key === "viewed") return viewed.length >= b.req;
    if (b.key === "watchlist") return watchlist.length >= b.req;
    if (b.key === "liked") return liked.length >= b.req;
    if (b.key === "genres") return genres.length >= b.req;
    if (b.key === "quiz") return quizzesCompleted >= b.req;
    return false;
  });

  const statItems = [
    { label: "Watchlist", value: watchlist.length, icon: Bookmark, color: "text-purple-400" },
    { label: "Liked", value: liked.length, icon: Heart, color: "text-red-400" },
    { label: "Viewed", value: viewed.length, icon: Eye, color: "text-blue-400" },
    { label: "Badges", value: earnedBadges.length, icon: Award, color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex flex-col items-center text-center space-y-4 animate-fade-in-down">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-600/20">
            {userEmail[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Movie Explorer</h1>
            <p className="text-zinc-400 text-sm mt-1">{userEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center space-y-2 transition-all duration-200">
              <stat.icon className={cn("w-5 h-5 mx-auto", stat.color)} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <section className="space-y-4 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Badges</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {BADGE_DEFS.map((b) => {
              const earned = earnedBadges.some((e) => e.id === b.id);
              const progress = b.key === "viewed" ? viewed.length : b.key === "watchlist" ? watchlist.length : b.key === "liked" ? liked.length : b.key === "genres" ? genres.length : b.key === "quiz" ? quizzesCompleted : 0;
              return (
                <div key={b.id} className={cn("p-4 rounded-xl text-center space-y-2 border transition-all duration-200",
                  earned ? "bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30" : "bg-zinc-900/50 border-zinc-800 opacity-50")}>
                  <span className="text-3xl">{b.icon}</span>
                  <p className="text-xs font-semibold text-white">{b.name}</p>
                  <p className="text-[10px] text-zinc-500">{b.desc}</p>
                  {earned ? (<span className="text-[10px] text-green-400 font-medium">Earned</span>) : (
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (progress / b.req) * 100)}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Activity</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Movies Viewed", value: viewed.length, color: "bg-blue-500", max: 50 },
              { label: "Movies Liked", value: liked.length, color: "bg-red-500", max: 15 },
              { label: "Watchlist Size", value: watchlist.length, color: "bg-purple-500", max: 15 },
              { label: "Badges Earned", value: earnedBadges.length, color: "bg-yellow-500", max: BADGE_DEFS.length, display: `${earnedBadges.length} / ${BADGE_DEFS.length}` },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{item.label}</span>
                  <span className="text-lg font-bold text-white">{item.display || item.value}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className={cn("h-2 rounded-full transition-all duration-500", item.color)} style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center animate-fade-in-up stagger-4">
          <button onClick={() => { if (window.confirm("Reset all badges, watchlist, liked, and viewed data? This cannot be undone.")) resetAllData(); }}
            className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium transition-all btn-press">
            <RotateCcw className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
