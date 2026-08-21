import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";

const messages = ["Analyzing your taste...", "Understanding genres...", "Matching actors...", "Ranking movies...", "Finding hidden gems...", "Almost done..."];
const DURATION = 8000;
const MESSAGE_INTERVAL = 1500;

export default function LoadingPage() {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => { setMessageIndex((i) => (i + 1) % messages.length); }, MESSAGE_INTERVAL);
    return () => clearInterval(messageTimer);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct * 100);
      if (pct < 1) requestAnimationFrame(frame);
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { navigate("/recommendations"); }, DURATION);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl animate-float-medium" />
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        <div className="w-24 h-24 rounded-2xl bg-purple-600/20 flex items-center justify-center animate-bounce-subtle">
          <Brain className="w-12 h-12 text-purple-400" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">MovieMind is thinking...</h2>
          <p key={messageIndex} className="text-zinc-400 text-lg h-6 animate-fade-in">{messages[messageIndex]}</p>
        </div>
        <div className="w-80 max-w-full">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-zinc-600 mt-2 text-right">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
