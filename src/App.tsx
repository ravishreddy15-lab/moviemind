import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
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
import MoodJourneyPage from "@/pages/MoodJourneyPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isLoggedIn = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("moviemind_user") || "{}");
      return user.loggedIn === true;
    } catch {
      return false;
    }
  }, [location.pathname]);

  const isLoginPage = location.pathname === "/login";

  return (
    <TooltipProvider delayDuration={300}>
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route element={isLoggedIn || isLoginPage ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="loading" element={<LoadingPage />} />
          <Route path="recommendations" element={<RecommendationPage />} />
          <Route path="movie/:id" element={<MovieDetailsPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="mood-journey" element={<MoodJourneyPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}
