import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import QuizCard from "@/components/quiz/QuizCard";
import ProgressBar from "@/components/quiz/ProgressBar";
import MoodSelector from "@/components/quiz/MoodSelector";
import GenreSelector from "@/components/quiz/GenreSelector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getQuizRecommendations, QuizAnswers } from "@/utils/api";

const TOTAL_STEPS = 10;

const movieLengths = ["<90 min", "90-120 min", "120-150 min", "No Preference"];
const releasePeriods = ["Classic", "1990s", "2000s", "2010s", "Latest"];
const imdbRatings = ["7+", "8+", "9+", "Any"];
const familyFriendly = ["Yes", "No"];
const languages = ["English", "Hindi", "Korean", "Japanese", "Any"];

const stepTitles: Record<number, { title: string; description: string }> = {
  0: { title: "How are you feeling?", description: "Pick the mood that matches what you're looking for" },
  1: { title: "Pick your genres", description: "Choose the genres that excite you most" },
  2: { title: "Movie length preference", description: "How long do you want your movie to be?" },
  3: { title: "Release period", description: "What era of movies do you prefer?" },
  4: { title: "IMDb Rating threshold", description: "What's the minimum rating you'd accept?" },
  5: { title: "Family friendly?", description: "Should the movie be suitable for all ages?" },
  6: { title: "Preferred language", description: "What language do you prefer watching in?" },
  7: { title: "Favorite actor", description: "Optional — mention an actor you love" },
  8: { title: "Favorite director", description: "Optional — mention a director you admire" },
  9: { title: "Tell us more", description: "Describe the kind of movie experience you're craving" },
};

interface LocalQuizAnswers {
  mood: string | null;
  genres: string[];
  movieLength: string | null;
  releasePeriod: string | null;
  imdbRating: string | null;
  familyFriendly: string | null;
  language: string | null;
  actor: string;
  director: string;
  freeText: string;
}

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<LocalQuizAnswers>({
    mood: null,
    genres: [],
    movieLength: null,
    releasePeriod: null,
    imdbRating: null,
    familyFriendly: null,
    language: null,
    actor: "",
    director: "",
    freeText: "",
  });

  const goNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitting(true);
      try {
        const apiAnswers: QuizAnswers = {
          mood: answers.mood || "",
          genres: answers.genres,
          movie_length: answers.movieLength || "",
          release_period: answers.releasePeriod || "",
          imdb_rating: answers.imdbRating || "",
          family_friendly: answers.familyFriendly === "Yes",
          language: answers.language || "",
          favorite_actor: answers.actor,
          favorite_director: answers.director,
          description: answers.freeText,
        };
        const result = await getQuizRecommendations(apiAnswers);
        navigate("/recommendations", { state: { recommendations: result.recommendations } });
      } catch (err) {
        console.error("Failed to get recommendations:", err);
        navigate("/recommendations", { state: { recommendations: [] } });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const renderStep = () => {
    const info = stepTitles[currentStep];

    switch (currentStep) {
      case 0:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <MoodSelector
              selectedMood={answers.mood}
              onSelect={(mood) => setAnswers((a) => ({ ...a, mood }))}
            />
          </QuizCard>
        );
      case 1:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <GenreSelector
              selectedGenres={answers.genres}
              onToggle={(genre) =>
                setAnswers((a) => ({
                  ...a,
                  genres: a.genres.includes(genre)
                    ? a.genres.filter((g) => g !== genre)
                    : [...a.genres, genre],
                }))
              }
            />
          </QuizCard>
        );
      case 2:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <div className="grid grid-cols-2 gap-3">
              {movieLengths.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAnswers((a) => ({ ...a, movieLength: opt }))}
                  className={cn(
                    "rounded-xl p-4 border text-sm font-medium transition-all duration-200 cursor-pointer",
                    answers.movieLength === opt
                      ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/30"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                  )}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </QuizCard>
        );
      case 3:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {releasePeriods.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAnswers((a) => ({ ...a, releasePeriod: opt }))}
                  className={cn(
                    "rounded-xl p-4 border text-sm font-medium transition-all duration-200 cursor-pointer",
                    answers.releasePeriod === opt
                      ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/30"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                  )}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </QuizCard>
        );
      case 4:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <div className="grid grid-cols-2 gap-3">
              {imdbRatings.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAnswers((a) => ({ ...a, imdbRating: opt }))}
                  className={cn(
                    "rounded-xl p-4 border text-sm font-medium transition-all duration-200 cursor-pointer",
                    answers.imdbRating === opt
                      ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/30"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                  )}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </QuizCard>
        );
      case 5:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <div className="grid grid-cols-2 gap-4">
              {familyFriendly.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAnswers((a) => ({ ...a, familyFriendly: opt }))}
                  className={cn(
                    "rounded-xl p-6 border text-base font-semibold transition-all duration-200 cursor-pointer",
                    answers.familyFriendly === opt
                      ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/30"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                  )}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </QuizCard>
        );
      case 6:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAnswers((a) => ({ ...a, language: opt }))}
                  className={cn(
                    "rounded-xl p-4 border text-sm font-medium transition-all duration-200 cursor-pointer",
                    answers.language === opt
                      ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/30"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
                  )}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </QuizCard>
        );
      case 7:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <Input
              placeholder="e.g., Leonardo DiCaprio"
              value={answers.actor}
              onChange={(e) => setAnswers((a) => ({ ...a, actor: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </QuizCard>
        );
      case 8:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <Input
              placeholder="e.g., Christopher Nolan"
              value={answers.director}
              onChange={(e) => setAnswers((a) => ({ ...a, director: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </QuizCard>
        );
      case 9:
        return (
          <QuizCard title={info.title} description={info.description} stepNumber={currentStep + 1} totalSteps={TOTAL_STEPS}>
            <Textarea
              placeholder="Describe what you want... e.g., 'A mind-bending thriller with plot twists' or 'A heartwarming animated film for date night'"
              value={answers.freeText}
              onChange={(e) => setAnswers((a) => ({ ...a, freeText: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Mind-bending thriller",
                "Feel-good comedy",
                "Epic adventure",
                "Emotional drama",
                "Date night movie",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setAnswers((a) => ({ ...a, freeText: prompt }))}
                  className="text-xs text-zinc-500 border border-zinc-700 rounded-full px-3 py-1 hover:text-purple-400 hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </QuizCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <div className="pt-4">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0 || submitting}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={goNext}
            disabled={submitting}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6"
          >
            {currentStep === TOTAL_STEPS - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {submitting ? "Generating..." : "Generate Recommendations"}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
