import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AmbientBackdrop from './components/AmbientBackdrop';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { OTTTrackerProvider } from './contexts/OTTTrackerContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/system/ErrorBoundary';
import CookieConsent from './components/CookieConsent';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Anime = lazy(() => import('./pages/Anime'));
const AnimeDetail = lazy(() => import('./pages/AnimeDetail'));
const Tv = lazy(() => import('./pages/Tv'));
const TvDetail = lazy(() => import('./pages/TvDetail'));
const TvEpisodes = lazy(() => import('./pages/TvEpisodes'));
const Trailers = lazy(() => import('./pages/Trailers'));
const OTTTracker = lazy(() => import('./pages/OTTTracker'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const ReleaseCalendar = lazy(() => import('./pages/ReleaseCalendar'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const EditorialPicks = lazy(() => import('./pages/EditorialPicks'));
const WeeklyPicks = lazy(() => import('./pages/WeeklyPicks'));

function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
      <div className="h-10 w-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-950 text-white flex flex-col">
      <Helmet>
        <title>CineVerse AI - Your Entertainment Universe</title>
        <meta
          name="description"
          content="Discover movies, anime, TV shows, and AI-powered recommendations on CineVerse AI. Your ultimate guide to streaming."
        />
        <meta name="keywords" content="movies, anime, OTT, AI entertainment, CineVerse AI, streaming tracker, editorial reviews" />
        <meta property="og:title" content="CineVerse AI" />
        <meta property="og:description" content="AI powered entertainment platform" />
      </Helmet>
      <AmbientBackdrop />
      {!isAuthPage && <Navbar />}
      <main className={`relative z-10 flex-1 flex flex-col min-h-[110vh] ${isAuthPage ? '' : 'pt-16 md:pt-20'}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.995 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            <Suspense fallback={<RouteLoader />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/editorial-picks" element={<EditorialPicks />} />
                <Route path="/weekly-picks" element={<WeeklyPicks />} />
                <Route path="/disclaimer" element={<Disclaimer />} />

                <Route path="/movies/:imdbID" element={<MovieDetail />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/anime/:malId" element={<AnimeDetail />} />
                <Route path="/anime" element={<Anime />} />
                <Route path="/tv/:showId/episodes" element={<TvEpisodes />} />
                <Route path="/tv/:showId" element={<TvDetail />} />
                <Route path="/tv" element={<Tv />} />
                <Route path="/calendar" element={<ReleaseCalendar />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/search" element={<SearchResults />} />
                <Route
                  path="/watchlist"
                  element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trailers"
                  element={
                    <ProtectedRoute>
                      <Trailers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ott"
                  element={
                    <ProtectedRoute>
                      <OTTTracker />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <WatchlistProvider>
            <OTTTrackerProvider>
              <LanguageProvider>
                <BrowserRouter>
                  <MotionConfig reducedMotion="user">
                    <AppShell />
                  </MotionConfig>
                </BrowserRouter>
              </LanguageProvider>
            </OTTTrackerProvider>
          </WatchlistProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
