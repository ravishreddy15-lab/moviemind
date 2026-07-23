import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import QuizPage from "@/pages/QuizPage";
import LoadingPage from "@/pages/LoadingPage";
import RecommendationPage from "@/pages/RecommendationPage";
import MovieDetailsPage from "@/pages/MovieDetailsPage";
import WatchlistPage from "@/pages/WatchlistPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeIn" } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={300}>
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="search" element={<AnimatedPage><SearchPage /></AnimatedPage>} />
          <Route path="quiz" element={<AnimatedPage><QuizPage /></AnimatedPage>} />
          <Route path="loading" element={<AnimatedPage><LoadingPage /></AnimatedPage>} />
          <Route path="recommendations" element={<AnimatedPage><RecommendationPage /></AnimatedPage>} />
          <Route path="movie/:id" element={<AnimatedPage><MovieDetailsPage /></AnimatedPage>} />
          <Route path="watchlist" element={<AnimatedPage><WatchlistPage /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
          <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}
