import { Link } from "react-router-dom";
import { Film, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-purple-600/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl animate-float-medium" />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <div className="animate-float-slow"><Film className="w-16 h-16 text-zinc-700" /></div>
        <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent animate-scale-in">404</h1>
        <div className="space-y-2 animate-fade-in stagger-2">
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-zinc-400 max-w-md">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center animate-fade-in stagger-3">
          <Link to="/"><Button className="bg-purple-600 hover:bg-purple-500 text-white btn-press"><Home className="w-4 h-4 mr-2" /> Go Home</Button></Link>
          <Link to="/search"><Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 btn-press"><Search className="w-4 h-4 mr-2" /> Browse Movies</Button></Link>
        </div>
      </div>
    </div>
  );
}
