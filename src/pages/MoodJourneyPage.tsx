import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Play, Star, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMoodJourney, getMoodSuggestions, Movie } from "@/utils/api";

interface MoodStep { id: string; mood: string; }
interface JourneyMovie { mood: string; movie: Movie; reason: string; }

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

export default function MoodJourneyPage() {
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<MoodStep[]>([]);
  const [journey, setJourney] = useState<JourneyMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMood, setShowAddMood] = useState(false);

  useEffect(() => {
    getMoodSuggestions()
      .then((res) => {
        if (res?.moods && res.moods.length > 0) {
          setAvailableMoods(res.moods);
        } else {
          setAvailableMoods([
            "happy", "sad", "excited", "scary", "romantic", "thoughtful",
            "adventurous", "dramatic", "curious", "nostalgic", "inspired", "calm", "tense", "magical"
          ]);
        }
      })
      .catch(() => {
        setAvailableMoods([
          "happy", "sad", "excited", "scary", "romantic", "thoughtful",
          "adventurous", "dramatic", "curious", "nostalgic", "inspired", "calm", "tense", "magical"
        ]);
      });
  }, []);

  const addMood = (mood: string) => { setSelectedMoods((prev) => [...prev, { id: Date.now().toString(), mood }]); setShowAddMood(false); };
  const removeMood = (id: string) => { setSelectedMoods((prev) => prev.filter((m) => m.id !== id)); };

  const generateJourney = async () => {
    if (selectedMoods.length === 0) return;
    setLoading(true);
    try { const res = await getMoodJourney(selectedMoods.map((s) => s.mood), 2); setJourney(res.journey); }
    catch (e) { console.error("Failed to generate journey:", e); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-4 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /><span className="text-sm text-purple-400">Mood Journey</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Mood Arc</span></h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">Create a sequence of moods and we'll find the top 5 movies that match your combined mood journey</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Mood Arc</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddMood(true)} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 btn-press">
              <Plus className="w-4 h-4 mr-1" /> Add Mood
            </Button>
          </div>

          {selectedMoods.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-700 rounded-xl">
              <p className="text-zinc-500">Click "Add Mood" to start building your journey</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {selectedMoods.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={cn("relative px-4 py-3 rounded-xl text-white font-medium flex items-center gap-2 bg-gradient-to-r animate-scale-in", MOOD_COLORS[step.mood] || "from-gray-500 to-gray-400")}>
                    <span className="text-lg">{MOOD_EMOJIS[step.mood] || "🎬"}</span>
                    <span className="capitalize">{step.mood}</span>
                    <button onClick={() => removeMood(step.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 btn-press"><X className="w-3 h-3" /></button>
                  </div>
                  {index < selectedMoods.length - 1 && <ArrowRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}

          {selectedMoods.length > 0 && (
            <Button onClick={generateJourney} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 btn-press">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating your journey...</> : <><Play className="w-4 h-4 mr-2" /> Generate Movie Journey</>}
            </Button>
          )}
        </div>

        {showAddMood && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddMood(false)}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4">Select a Mood</h3>
              <div className="grid grid-cols-3 gap-3">
                {availableMoods.map((mood) => (
                  <button key={mood} onClick={() => addMood(mood)} className={cn("p-4 rounded-xl text-center transition-all hover:scale-105 bg-gradient-to-r text-white btn-press", MOOD_COLORS[mood] || "from-gray-500 to-gray-400")}>
                    <span className="text-2xl">{MOOD_EMOJIS[mood] || "🎬"}</span>
                    <p className="text-white text-sm font-medium mt-1 capitalize">{mood}</p>
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setShowAddMood(false)} className="w-full mt-4 text-zinc-400">Cancel</Button>
            </div>
          </div>
        )}

        {journey.length > 0 && (
          <section className="space-y-6 animate-fade-in-up stagger-2">
            <h2 className="text-2xl font-bold text-white">Your Movie Journey</h2>
            <p className="text-zinc-400 text-sm">Top {journey.length} movies that match your combined mood</p>
            <div className="space-y-6">
              {journey.map((item, index) => (
                <div key={index} className={cn("flex gap-4 animate-fade-in-up", `stagger-${Math.min(index + 1, 8)}`)}>
                  <div className="flex flex-col items-center">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-r", MOOD_COLORS[item.mood] || "from-gray-500 to-gray-400")}>{MOOD_EMOJIS[item.mood] || "🎬"}</div>
                    {index < journey.length - 1 && <div className="w-0.5 flex-1 bg-zinc-800 mt-2" />}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-sm text-zinc-500 mb-2 capitalize">Step {index + 1} - Feeling {item.mood}</p>
                    <Link to={`/movie/${item.movie.id}`}>
                      <div className="group bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all">
                        <div className="flex gap-4 p-4">
                          <div className="w-24 h-32 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                            {item.movie.poster ? (<img src={item.movie.poster} alt={item.movie.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-700">{item.movie.title[0]}</div>)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">{item.movie.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-zinc-500 text-sm">{item.movie.year}</span>
                              <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span className="text-sm text-zinc-400">{item.movie.rating}</span></div>
                            </div>
                            <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{item.reason}</p>
                            <div className="flex gap-1 mt-2">{item.movie.genre.slice(0, 2).map((g) => (<Badge key={g} variant="outline" className="text-xs border-zinc-700 text-zinc-400">{g}</Badge>))}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
