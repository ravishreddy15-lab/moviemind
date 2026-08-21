import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle, Brain, Heart, MessageCircle, BarChart3, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "AI-Powered Picks", desc: "Smart recommendations based on your mood and taste" },
  { icon: Heart, title: "Personal Watchlist", desc: "Save and track movies you want to watch" },
  { icon: MessageCircle, title: "Chat Assistant", desc: "Ask our AI anything about movies" },
  { icon: BarChart3, title: "Viewing Insights", desc: "Track your watching habits and genre preferences" },
];

const ALLOWED_DOMAINS = ["gmail.com", "icloud.com", "me.com", "mac.com", "hotmail.com", "outlook.com", "live.com", "msn.com", "windowslive.com", "microsoft.com"];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailDomain = email.split("@")[1]?.toLowerCase() || "";
  const emailValid = emailFormatValid && ALLOWED_DOMAINS.includes(emailDomain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!emailFormatValid) { setEmailError("Please enter a valid email address"); return; }
    if (!ALLOWED_DOMAINS.includes(emailDomain)) { setEmailError("Invalid ID. Please enter your Gmail, Microsoft, or Apple Mail address"); return; }
    setLoading(true);
    setEmailError("");
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      localStorage.setItem("moviemind_user", JSON.stringify({ email, loggedIn: true }));
      navigate("/");
    }, 1200);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-scale-in">
          <div className="animate-bounce-subtle"><CheckCircle className="w-16 h-16 text-green-400 mx-auto" /></div>
          <h2 className="text-2xl font-bold text-white">Welcome to MovieMind!</h2>
          <p className="text-zinc-400">Redirecting you to the homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-background to-blue-600/20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <div className="flex items-center gap-3 mb-12 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold gradient-text">MovieMind</span>
              <Sparkles className="inline h-4 w-4 text-purple-400 ml-1 animate-pulse" />
            </div>
          </div>
          <div className="animate-fade-in stagger-1">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Your next favorite<br />movie is one<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">conversation away.</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-10">Discover, track, and explore over 8,000 movies with an AI that understands your taste.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={f.title} className={cn("bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-xl p-4 space-y-2 animate-fade-in-up", `stagger-${Math.min(i + 2, 8)}`)}>
                <div className="w-8 h-8 rounded-lg bg-purple-600/15 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-zinc-600 flex items-center gap-1.5 animate-fade-in stagger-6">
            <Shield className="w-3 h-3" /> Free to use &bull; No credit card required &bull; Instant access
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 overflow-hidden lg:hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-600/20 animate-bounce-subtle">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to continue your movie journey</p>
          </div>
          <div className="hidden lg:block space-y-2">
            <h2 className="text-2xl font-bold text-white">Sign in to your account</h2>
            <p className="text-zinc-400 text-sm">Welcome back — pick up where you left off</p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} placeholder="you@gmail.com"
                    className={cn("w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800 border text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 text-sm transition-colors",
                      emailError || (email && !emailValid) ? "border-red-500/50 focus:ring-red-500/50" : "border-zinc-700 focus:ring-purple-500/50")} />
                </div>
                {emailError && <p className="text-xs text-red-400 animate-fade-in">{emailError}</p>}
                {email && !emailFormatValid && !emailError && <p className="text-xs text-red-400 animate-fade-in">Please enter a valid email address</p>}
                {email && emailFormatValid && !emailValid && !emailError && <p className="text-xs text-red-400 animate-fade-in">Invalid ID. Please enter your Gmail, Microsoft, or Apple Mail address</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={!email || !password || loading || !emailValid}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (<>Sign In<ArrowRight className="w-4 h-4 ml-2" /></>)}
              </Button>
            </form>
          </div>
          <p className="text-center text-xs text-zinc-600">
            By continuing, you agree to MovieMind's{" "}
            <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
            {" "}and{" "}
            <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
