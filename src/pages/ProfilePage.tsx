import { motion } from "framer-motion";
import { Film, Star, BarChart3, ListChecks, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { movies } from "@/data/movies";

const stats = [
  { label: "Movies Explored", value: "42", icon: Film },
  { label: "Genres Tasted", value: "8", icon: BarChart3 },
  { label: "Avg Rating", value: "7.8", icon: Star },
  { label: "Quizzes", value: "3", icon: ListChecks },
];

const topGenres = ["Sci-Fi", "Thriller", "Drama", "Action", "Comedy", "Mystery"];

const recentActivity = [
  { title: "Added Inception to Watchlist", time: "2 hours ago", icon: Film },
  { title: "Liked The Dark Knight", time: "5 hours ago", icon: Star },
  { title: "Completed Movie Quiz", time: "1 day ago", icon: ListChecks },
  { title: "Viewed Interstellar details", time: "1 day ago", icon: Film },
  { title: "Added Parasite to Watchlist", time: "2 days ago", icon: Film },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-600/20">
            ME
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Movie Explorer</h1>
            <p className="text-zinc-400 text-sm mt-1">Cinema enthusiast since 2024</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center space-y-2"
            >
              <stat.icon className="w-5 h-5 text-purple-400 mx-auto" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Top Genres</h2>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((genre) => (
              <Badge key={genre} variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 px-3 py-1 text-sm">
                {genre}
              </Badge>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-4 px-5 py-4",
                  i < recentActivity.length - 1 && "border-b border-zinc-800"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.title}</p>
                  <p className="text-xs text-zinc-500">{activity.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Settings className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Account Settings</p>
              <p className="text-xs text-zinc-500">Manage your preferences and account details</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
