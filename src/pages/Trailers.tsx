import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Eye, Loader2, Play, RefreshCw, Search, X } from 'lucide-react';
import TrailerCard from '../components/TrailerCard';
import SectionHeader from '../components/SectionHeader';
import { getMovieByImdbId, mapDetailToMovie, searchMovies } from '../lib/omdb';
import { fetchSeasonNow, fetchTopAnimePopular, searchAnime } from '../lib/jikan';
import { mapJikanAnime } from '../lib/jikanMap';
import { fetchAiringWindow, scheduleCountryCode } from '../lib/tvmazeSchedule';
import { getShowsPage, searchShows } from '../lib/tvmaze';
import { dedupeShows, mapTvMazeShow, trendingShowsFromSchedule } from '../lib/tvmazeMap';
import { fetchOfficialTrailerVideoId, youtubeThumbnailUrl } from '../lib/youtube';
import { featuredTrailers } from '../data/trailers';
import type { Trailer } from '../types';

const types: Array<Trailer['type'] | 'All'> = ['All', 'Movie', 'Anime', 'Series'];
const REFRESH_MS = 10 * 60 * 1000;
const MOVIE_TRAILER_SEEDS = ['2026', '2025', 'superhero', 'sci fi', 'thriller', 'animation'];

type TrailerCandidate = {
  id: string;
  title: string;
  year: string;
  type: Trailer['type'];
  imdbID?: string;
};

function dedupeCandidates(candidates: TrailerCandidate[]): TrailerCandidate[] {
  const seen = new Set<string>();
  return candidates.filter(candidate => {
    const key = `${candidate.type}:${candidate.imdbID || candidate.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function movieCandidates(): Promise<TrailerCandidate[]> {
  const seed = MOVIE_TRAILER_SEEDS[Math.floor(Date.now() / REFRESH_MS) % MOVIE_TRAILER_SEEDS.length];
  const search = await searchMovies(seed, 1);
  const ids = search.movies.map(movie => movie.imdbID).filter(Boolean).slice(0, 8) as string[];
  const details = await Promise.allSettled(ids.map(id => getMovieByImdbId(id, 'short')));
  return details
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getMovieByImdbId>>> => r.status === 'fulfilled')
    .map(r => mapDetailToMovie(r.value))
    .map(movie => ({
      id: `movie-${movie.imdbID || movie.id}`,
      title: movie.title,
      year: String(movie.year || ''),
      type: 'Movie' as const,
      imdbID: movie.imdbID,
    }));
}

async function animeCandidates(): Promise<TrailerCandidate[]> {
  const [seasonal, popular] = await Promise.allSettled([
    fetchSeasonNow(6),
    fetchTopAnimePopular(6),
  ]);
  return [
    ...(seasonal.status === 'fulfilled' ? seasonal.value.data.map(mapJikanAnime) : []),
    ...(popular.status === 'fulfilled' ? popular.value.data.map(mapJikanAnime) : []),
  ].slice(0, 8).map(anime => ({
    id: `anime-${anime.id}`,
    title: anime.title,
    year: String(anime.year || ''),
    type: 'Anime' as const,
  }));
}

async function seriesCandidates(): Promise<TrailerCandidate[]> {
  const country = scheduleCountryCode();
  const rotatingPage = Math.floor(Date.now() / REFRESH_MS) % 20;
  const [airing, catalogue] = await Promise.allSettled([
    fetchAiringWindow(country, 0, 7),
    getShowsPage(rotatingPage),
  ]);

  const airingShows = airing.status === 'fulfilled'
    ? trendingShowsFromSchedule(airing.value, 8)
    : [];
  const catalogueShows = catalogue.status === 'fulfilled'
    ? catalogue.value.map(mapTvMazeShow)
    : [];

  return dedupeShows([...airingShows, ...catalogueShows]).slice(0, 8).map(show => ({
    id: `series-${show.id}`,
    title: show.title,
    year: String(show.year || ''),
    type: 'Series' as const,
  }));
}

async function fetchDynamicTrailers(): Promise<Trailer[]> {
  const candidateResults = await Promise.allSettled([
    movieCandidates(),
    animeCandidates(),
    seriesCandidates(),
  ]);

  const failedCandidateSources = candidateResults.filter(r => r.status === 'rejected');
  if (failedCandidateSources.length > 0) {
    console.warn('[Trailers] Some candidate sources failed', { failed: failedCandidateSources.length });
  }

  const candidates = dedupeCandidates(
    candidateResults
      .filter((r): r is PromiseFulfilledResult<TrailerCandidate[]> => r.status === 'fulfilled')
      .flatMap(r => r.value),
  ).slice(0, 18);

  console.debug('[Trailers] Candidate titles loaded', { count: candidates.length });
  if (candidates.length === 0) return featuredTrailers;

  const trailerResults = await Promise.allSettled(
    candidates.map(async (candidate, index) => {
      const youtubeId = await fetchOfficialTrailerVideoId({
        title: candidate.title,
        year: candidate.year,
        imdbID: candidate.imdbID,
      });
      if (!youtubeId) return null;
      return {
        id: index + 1,
        title: `${candidate.title} Official Trailer`,
        thumbnail: youtubeThumbnailUrl(youtubeId, 'hq'),
        youtubeId,
        type: candidate.type,
        releaseDate: candidate.year || 'Latest',
        views: 'Live',
      } satisfies Trailer;
    }),
  );

  const rows = trailerResults
    .filter((r): r is PromiseFulfilledResult<Trailer | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((trailer): trailer is Trailer => Boolean(trailer));
  return rows.length > 0 ? rows : featuredTrailers;
}

async function resolveTrailers(candidates: TrailerCandidate[], limit = 12): Promise<Trailer[]> {
  const trailerResults = await Promise.allSettled(
    dedupeCandidates(candidates).slice(0, limit).map(async (candidate, index) => {
      const youtubeId = await fetchOfficialTrailerVideoId({
        title: candidate.title,
        year: candidate.year,
        imdbID: candidate.imdbID,
      });
      if (!youtubeId) return null;
      return {
        id: index + 1,
        title: `${candidate.title} Official Trailer`,
        thumbnail: youtubeThumbnailUrl(youtubeId, 'hq'),
        youtubeId,
        type: candidate.type,
        releaseDate: candidate.year || 'Latest',
        views: 'Live',
      } satisfies Trailer;
    }),
  );

  return trailerResults
    .filter((r): r is PromiseFulfilledResult<Trailer | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((trailer): trailer is Trailer => Boolean(trailer));
}

async function searchTrailerResults(query: string): Promise<Trailer[]> {
  console.debug('[Trailers] Searching trailer candidates', { query });
  const [moviesRes, animeRes, tvRes] = await Promise.allSettled([
    searchMovies(query, 1),
    searchAnime({ query, page: 1, limit: 6 }),
    searchShows(query, 6),
  ]);

  const failedSources = [moviesRes, animeRes, tvRes].filter(r => r.status === 'rejected');
  if (failedSources.length > 0) {
    console.warn('[Trailers] Some trailer search sources failed', { query, failed: failedSources.length });
  }

  const candidates: TrailerCandidate[] = [
    ...(moviesRes.status === 'fulfilled' ? moviesRes.value.movies.slice(0, 6).map(movie => ({
      id: `movie-${movie.imdbID || movie.id}`,
      title: movie.title,
      year: String(movie.year || ''),
      type: 'Movie' as const,
      imdbID: movie.imdbID,
    })) : []),
    ...(animeRes.status === 'fulfilled' ? animeRes.value.data.map(mapJikanAnime).slice(0, 6).map(anime => ({
      id: `anime-${anime.id}`,
      title: anime.title,
      year: String(anime.year || ''),
      type: 'Anime' as const,
    })) : []),
    ...(tvRes.status === 'fulfilled' ? tvRes.value.slice(0, 6).map(hit => mapTvMazeShow(hit.show)).map(show => ({
      id: `series-${show.id}`,
      title: show.title,
      year: String(show.year || ''),
      type: 'Series' as const,
    })) : []),
  ];

  console.debug('[Trailers] Search candidates resolved', { query, count: candidates.length });
  const rows = await resolveTrailers(candidates, 12);
  if (rows.length > 0) return rows;

  const normalized = query.toLowerCase();
  return featuredTrailers.filter(trailer =>
    trailer.title.toLowerCase().includes(normalized)
    || trailer.type.toLowerCase().includes(normalized),
  );
}

export default function Trailers() {
  const [activeType, setActiveType] = useState<Trailer['type'] | 'All'>('All');
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Trailer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrailers = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const rows = await fetchDynamicTrailers();
      console.debug('[Trailers] Dynamic trailers loaded', { count: rows.length });
      setTrailers(rows);
      if (rows.length === 0) {
        setError('No YouTube trailer matches were found. Check VITE_YOUTUBE_API_KEY and API quota.');
      } else if (rows === featuredTrailers) {
        setError('Live YouTube trailer lookup is unavailable right now, showing curated trailers.');
      }
    } catch (err) {
      console.error('[Trailers] Falling back to curated trailers after discovery failure', err);
      setTrailers(featuredTrailers);
      setError('Live YouTube trailer lookup is unavailable right now, showing curated trailers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrailers();
    const timer = window.setInterval(() => loadTrailers(true), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadTrailers]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);

    searchTrailerResults(debouncedQuery)
      .then(rows => {
        if (cancelled) return;
        console.debug('[Trailers] Search trailers loaded', { query: debouncedQuery, count: rows.length });
      setSearchResults(rows);
        if (rows.length === 0) setSearchError('No official trailer matches were found for that search.');
        else if (rows.some(row => featuredTrailers.some(fallback => fallback.youtubeId === row.youtubeId))) {
          setSearchError('Live YouTube lookup is unavailable right now, showing curated matching trailers.');
        }
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[Trailers] Trailer search failed', { query: debouncedQuery, error: err });
        const normalized = debouncedQuery.toLowerCase();
        const fallbackRows = featuredTrailers.filter(trailer =>
          trailer.title.toLowerCase().includes(normalized)
          || trailer.type.toLowerCase().includes(normalized),
        );
        setSearchResults(fallbackRows);
        setSearchError(fallbackRows.length > 0
          ? 'Live YouTube lookup is unavailable right now, showing curated matching trailers.'
          : err instanceof Error ? err.message : 'Trailer search failed.');
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const searching = debouncedQuery.length >= 2;
  const trailerSource = searching ? searchResults : trailers;

  const filtered = useMemo(
    () => trailerSource.filter(t => activeType === 'All' || t.type === activeType),
    [activeType, trailerSource],
  );

  const spotlight = filtered[0];

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader
            title="Trailers"
            subtitle="Fresh official trailer lookups from YouTube for live movie, anime, and TV trends"
            accent="blue"
            icon={<Play className="w-6 h-6" />}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 relative z-10">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search official trailers across movies, anime, and TV..."
                className="w-full bg-gray-900/70 border border-white/10 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 text-white placeholder-gray-500 text-sm rounded-xl pl-10 pr-10 py-3 outline-none transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  aria-label="Clear trailer search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-300 ${
                    activeType === type
                      ? 'bg-blue-500 border-blue-400 text-gray-950 shadow-lg shadow-blue-500/20'
                      : 'bg-gray-900/50 border-white/10 text-gray-500 hover:text-white hover:border-white/20 backdrop-blur-sm'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => loadTrailers(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/70 border border-white/10 text-sm font-bold text-gray-300 hover:text-white hover:border-blue-400/30 disabled:opacity-50 transition-colors"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {searchError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertCircle className="w-4 h-4" />
            {searchError}
          </div>
        )}

        {loading || searchLoading ? (
          <div className="space-y-10">
            {!searching && <div className="aspect-video max-h-[500px] rounded-3xl bg-gray-900 border border-white/5 animate-pulse" />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {!searching && activeType === 'All' && spotlight && (
              <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Spotlight</p>
                <div className="relative rounded-3xl overflow-hidden aspect-video max-h-[500px] shadow-2xl shadow-black/50 border border-white/5">
                  <iframe
                    src={`https://www.youtube.com/embed/${spotlight.youtubeId}`}
                    title={spotlight.title}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-8 sm:p-12 bg-gradient-to-t from-gray-950/95 to-transparent">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-blue-500 text-gray-950 text-[10px] font-black uppercase rounded shadow-lg">Featured</span>
                      <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase rounded border border-white/10">{spotlight.type}</span>
                    </div>
                    <h2 className="text-white text-2xl sm:text-4xl font-black mt-1 leading-tight tracking-tight max-w-2xl">{spotlight.title}</h2>
                    <div className="flex items-center gap-4 mt-4 text-gray-400 text-sm font-medium">
                      <span>{spotlight.releaseDate}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {spotlight.views} source</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-500 text-sm font-medium">
                Showing <span className="text-white font-bold">{filtered.length}</span> {searching ? `results for "${debouncedQuery}"` : activeType === 'All' ? 'live trailers' : `${activeType} trailers`}
              </p>
              {refreshing && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((trailer, index) => (
                  <div key={trailer.youtubeId} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                    <TrailerCard trailer={trailer} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 rounded-3xl border-2 border-dashed border-white/5 bg-gray-900/20">
                <Play className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500 font-medium">No trailers found in this category.</p>
                <button onClick={() => setActiveType('All')} className="mt-4 text-blue-400 text-sm font-bold hover:underline">Clear filter</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
