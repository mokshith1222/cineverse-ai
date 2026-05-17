import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { 
  Home, Movies, MovieDetail, Anime, AnimeDetail, 
  Tv, TvDetail, TvEpisodes, Trailers, OTTTracker, 
  Login, Signup, Watchlist, ReleaseCalendar, Notifications,
  SearchResults, About, Contact, Privacy, Terms, Disclaimer
} from './pages';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { OTTTrackerProvider } from './contexts/OTTTrackerContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <WatchlistProvider>
          <OTTTrackerProvider>
            <LanguageProvider>
            <BrowserRouter>
              <div className="bg-gray-950 min-h-screen">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
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
                </main>
                <Footer />
              </div>
            </BrowserRouter>
            </LanguageProvider>
          </OTTTrackerProvider>
        </WatchlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
