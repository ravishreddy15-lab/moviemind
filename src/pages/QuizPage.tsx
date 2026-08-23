import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";
import MoodSelector from "@/components/quiz/MoodSelector";
import GenreSelector from "@/components/quiz/GenreSelector";
import ProgressBar from "@/components/quiz/ProgressBar";
import { cn } from "@/lib/utils";

type QuizStep = "mood" | "genres" | "style" | "pace" | "length";

const styleOptions = [
  { id: "blockbuster", label: "Blockbuster Spectacle", description: "Big budgets, special effects, and thrilling action sequences.", emoji: "🎬" },
  { id: "indie", label: "Indie Gem", description: "Unique storytelling, artistic vision, and authentic performances.", emoji: "🎭" },
  { id: "classic", label: "Timeless Classic", description: "Proven masterpieces that have stood the test of time.", emoji: "🏆" },
  { id: "hidden", label: "Hidden Gem", description: "Under-the-radar films waiting to be discovered.", emoji: "💎" },
];

const paceOptions = [
  { id: "fast", label: "Fast-Paced", description: "Quick cuts, constant action, and edge-of-your-seat thrills.", emoji: "⚡" },
  { id: "moderate", label: "Moderate", description: "A balanced mix of action and character development.", emoji: "🎬" },
  { id: "slow", label: "Slow Burn", description: "Deliberate pacing, deep character studies, and building tension.", emoji: "🔥" },
  { id: "varied", label: "No Preference", description: "Open to any pacing style if the story is compelling.", emoji: "✨" },
];

const lengthOptions = [
  { id: "short", label: "Under 90 min", description: "Quick, concise storytelling.", emoji: "⏱️" },
  { id: "medium", label: "90-120 min", description: "Standard feature length.", emoji: "🕐" },
  { id: "long", label: "2+ hours", description: "Epic, immersive experiences.", emoji: "⏳" },
  { id: "any", label: "Any Length", description: "Duration doesn't matter.", emoji: "🔄" },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizData, setQuizData] = useState({
    mood: "" as string,
    genres: [] as string[],
    style: "",
    pace: "",
    length: "",
  });

  const steps: QuizStep[] = ["mood", "genres", "style", "pace", "length"];
  const totalSteps = steps.length;

  const updateQuizData = (key: string, value: any) => {
    setQuizData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGenre = (genre: string) => {
    setQuizData((prev) => {
      const exists = prev.genres.includes(genre);
      if (exists) {
        return { ...prev, genres: prev.genres.filter((g) => g !== genre) };
      } else if (prev.genres.length < 5) {
        return { ...prev, genres: [...prev.genres, genre] };
      }
      return prev;
    });
  };

  const [submitting, setSubmitting] = useState(false);

  const canProceed = () => {
    const step = steps[currentStep];
    if (step === "mood") return quizData.mood !== "";
    if (step === "genres") return quizData.genres.length > 0;
    if (step === "style") return quizData.style !== "";
    if (step === "pace") return quizData.pace !== "";
    if (step === "length") return quizData.length !== "";
    return false;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setSubmitting(true);
      const params = new URLSearchParams();
      if (quizData.mood) params.set("mood", quizData.mood);
      if (quizData.genres.length) params.set("genres", quizData.genres.join(","));
      if (quizData.style) params.set("style", quizData.style);
      if (quizData.pace) params.set("pace", quizData.pace);
      if (quizData.length) params.set("length", quizData.length);
      navigate(`/recommendations?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Perfect Movie</h1>
          <p className="text-muted-foreground">Tell us what you're in the mood for and we'll find the perfect match</p>
        </div>

        <div className="mb-8 animate-fade-in-up stagger-1">
          <ProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />
        </div>

        <div className="animate-fade-in-up stagger-2">
          {steps[currentStep] === "mood" && (
            <QuizCard title="What's your current mood?" description="Select the mood that fits you right now" stepNumber={1} totalSteps={totalSteps}>
              <MoodSelector
                selectedMood={quizData.mood}
                onSelect={(mood) => updateQuizData("mood", mood)}
              />
            </QuizCard>
          )}

          {steps[currentStep] === "genres" && (
            <QuizCard title="Pick your favorite genres" description="Choose up to 5 genres" stepNumber={2} totalSteps={totalSteps}>
              <GenreSelector
                selectedGenres={quizData.genres}
                onToggle={toggleGenre}
              />
            </QuizCard>
          )}

          {steps[currentStep] === "style" && (
            <QuizCard title="What kind of movie experience?" description="Choose your preferred style" stepNumber={3} totalSteps={totalSteps}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {styleOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateQuizData("style", option.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-200 btn-press",
                      quizData.style === option.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/50 bg-card/50 hover:bg-card"
                    )}
                  >
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </QuizCard>
          )}

          {steps[currentStep] === "pace" && (
            <QuizCard title="What pacing do you prefer?" description="How fast should the movie move?" stepNumber={4} totalSteps={totalSteps}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paceOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateQuizData("pace", option.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-200 btn-press",
                      quizData.pace === option.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/50 bg-card/50 hover:bg-card"
                    )}
                  >
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </QuizCard>
          )}

          {steps[currentStep] === "length" && (
            <QuizCard title="How long should the movie be?" description="Pick your preferred runtime" stepNumber={5} totalSteps={totalSteps}>
              <div className="grid grid-cols-2 gap-4">
                {lengthOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateQuizData("length", option.id)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all duration-200 btn-press",
                      quizData.length === option.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/50 bg-card/50 hover:bg-card"
                    )}
                  >
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-medium text-white text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </QuizCard>
          )}
        </div>

        <div className="flex justify-between mt-8 animate-fade-in-up stagger-3">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0} className="text-muted-foreground hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()} className="bg-primary hover:bg-primary-dark text-white px-8 btn-press">
            {currentStep === totalSteps - 1 ? "Get Recommendations" : "Next"}
            {currentStep < totalSteps - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
