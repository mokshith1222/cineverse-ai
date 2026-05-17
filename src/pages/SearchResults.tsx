import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Film, Zap, MonitorPlay } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import AnimeCard from '../components/AnimeCard';
import TvCard from '../components/TvCard';
import SectionHeader from '../components/SectionHeader';
import { searchMovies } from '../lib/omdb';
import { searchAnime } from '../lib/jikan';
import { mapJikanAnime } from '../lib/jikanMap';
import { searchShows } from '../lib/tvmaze';
import { mapTvMazeShow } from '../lib/tvmazeMap';
import VoiceSearchButton from '../components/VoiceSearchButton';
import { buildSearchUrl, parseSearchIntent } from '../lib/smartSearch';
import type { Anime, Movie, TvShow } from '../types';

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = (params.get('q') || '').trim();
  const type = params.get('type') || '';
  const intentQuery = (params.get('intent') || '').trim();
  const intent = useMemo(() => {
    const parsed = parseSearchIntent(query);
    return {
      ...parsed,
      domain: type === 'movie' || type === 'anime' || type === 'tv' ? type : parsed.domain,
      query: intentQuery || parsed.query,
    };
  }, [intentQuery, query, type]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Anime[]>([]);
  const [shows, setShows] = useState<TvShow[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setMovies([]);
      setAnime([]);
      setShows([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      intent.domain === 'all' || intent.domain === 'movie' ? searchMovies(intent.query) : Promise.resolve({ movies: [], total: 0 }),
      intent.domain === 'all' || intent.domain === 'anime' ? searchAnime({ query: intent.query, page: 1, limit: 12 }) : Promise.resolve(null),
      intent.domain === 'all' || intent.domain === 'tv' ? searchShows(intent.query, 12) : Promise.resolve([]),
    ])
      .then(([movieRes, animeRes, tvRes]) => {
        if (cancelled) return;

        if (movieRes.status === 'fulfilled') {
          setMovies(movieRes.value.movies.slice(0, 12));
        } else {
          setMovies([]);
        }

        if (animeRes.status === 'fulfilled' && animeRes.value) {
          setAnime(animeRes.value.data.map(mapJikanAnime).slice(0, 12));
        } else {
          setAnime([]);
        }

        if (tvRes.status === 'fulfilled') {
          setShows(tvRes.value.map(row => mapTvMazeShow(row.show)).slice(0, 12));
        } else {
          setShows([]);
        }

        if (movieRes.status === 'rejected' && animeRes.status === 'rejected' && tvRes.status === 'rejected') {
          setError('Search is temporarily unavailable. Please try again.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Search is temporarily unavailable. Please try again.');
          setMovies([]);
          setAnime([]);
          setShows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [intent.domain, intent.query, query]);

  const total = useMemo(() => movies.length + anime.length + shows.length, [movies.length, anime.length, shows.length]);

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <SectionHeader
            title="Search"
            subtitle={query.length >= 2 ? `Results for "${query}"${intent.domain !== 'all' ? ` in ${intent.domain}` : ' across Movies, Anime, and TV'}` : 'Type or speak at least 2 characters to search'}
            accent="cyan"
            icon={<Search className="w-6 h-6" />}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            <div className="text-sm text-gray-500">
              {loading ? 'Searching live APIs...' : query.length >= 2 ? `${total} results found for parsed query "${intent.query}"` : 'Try: "Show me dark thriller anime".'}
            </div>
            <VoiceSearchButton
              onTranscript={text => navigate(buildSearchUrl(text))}
              className="w-fit inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900/70 px-4 py-2 text-sm font-bold text-gray-300 hover:text-white hover:border-cyan-400/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {query.length < 2 ? (
          <div className="text-center py-16 rounded-2xl border border-white/5 bg-gray-900/40 text-gray-500 text-sm">
            Enter at least 2 characters to start searching.
          </div>
        ) : null}

        {query.length >= 2 && !loading && total === 0 && !error ? (
          <div className="text-center py-16 rounded-2xl border border-white/5 bg-gray-900/40 text-gray-500 text-sm">
            No matching titles found.
          </div>
        ) : null}

        {movies.length > 0 && (
          <section>
            <SectionHeader title="Movies" subtitle="OMDb results" accent="cyan" icon={<Film className="w-5 h-5" />} viewAllTo={`/movies`} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {movies.map(movie => (
                <MovieCard key={String(movie.id)} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {anime.length > 0 && (
          <section>
            <SectionHeader title="Anime" subtitle="Jikan / MyAnimeList results" accent="orange" icon={<Zap className="w-5 h-5" />} viewAllTo="/anime" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {anime.map(item => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          </section>
        )}

        {shows.length > 0 && (
          <section>
            <SectionHeader title="TV Shows" subtitle="TVMaze results" accent="emerald" icon={<MonitorPlay className="w-5 h-5" />} viewAllTo="/tv" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {shows.map(show => (
                <TvCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        )}

        {query.length >= 2 && total > 0 && (
          <div className="text-sm text-gray-500">
            Need deeper filtering? Browse full catalogues in{' '}
            <Link to="/movies" className="text-cyan-400 hover:text-cyan-300">Movies</Link>,{' '}
            <Link to="/anime" className="text-orange-400 hover:text-orange-300">Anime</Link>, and{' '}
            <Link to="/tv" className="text-emerald-400 hover:text-emerald-300">TV</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
