import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Film, Info } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import SectionHeader from '../components/SectionHeader';
import SortDropdown from '../components/SortDropdown';
import TipsModal from '../components/TipsModal';
import Seo from '../components/Seo';
import { discoverTvdbMovies, fetchTrendingMovies, getMovieByImdbId, mapDetailToMovie, searchMovies } from '../lib/omdb';
import { trendingMovies } from '../data/movies';
import type { Movie } from '../types';

const sortOptions = ['Title', 'Year (Newest)', 'Year (Oldest)', 'Rating'];
const REFRESH_MS = 10 * 60 * 1000;
const MOVIE_DISCOVERY_SEEDS = [
  '2026',
  '2025',
  'latest',
  'new release',
  'festival',
  'superhero',
  'sci fi',
  'thriller',
  'animation',
  'action',
  'horror',
  'drama',
];

function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-xl bg-gray-900 border border-white/5 overflow-hidden animate-pulse">
          <div className="h-2/3 bg-white/5" />
          <div className="p-3 space-y-2">
            <div className="h-3 rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function dedupeMovies(rows: Movie[]): Movie[] {
  const seen = new Set<string | number>();
  return rows.filter(row => {
    const key = row.imdbID || row.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchLiveMovieDiscovery(): Promise<Movie[]> {
  const seedOffset = Math.floor(Date.now() / REFRESH_MS);
  const seeds = [
    MOVIE_DISCOVERY_SEEDS[seedOffset % MOVIE_DISCOVERY_SEEDS.length],
    MOVIE_DISCOVERY_SEEDS[(seedOffset + 3) % MOVIE_DISCOVERY_SEEDS.length],
    MOVIE_DISCOVERY_SEEDS[(seedOffset + 7) % MOVIE_DISCOVERY_SEEDS.length],
  ];
  const tvdbPage = seedOffset % 12;

  console.debug('[Movies] Loading discovery movies', { seeds, tvdbPage });
  const tvdbDiscovery = await discoverTvdbMovies(tvdbPage).catch(err => {
    console.warn('[Movies] TVDB discovery failed', err);
    return [];
  });
  if (tvdbDiscovery.length >= 8) {
    return tvdbDiscovery.slice(0, 24);
  }

  const searches = await Promise.allSettled(seeds.map((seed, index) => searchMovies(seed, 1 + ((seedOffset + index) % 2))));
  const failedSearches = searches.filter(r => r.status === 'rejected');
  if (failedSearches.length > 0) {
    console.warn('[Movies] Some OMDb discovery searches failed', { failed: failedSearches.length });
  }

  const discovered = dedupeMovies([
    ...tvdbDiscovery,
    ...(
    searches
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof searchMovies>>> => r.status === 'fulfilled')
      .flatMap(r => r.value.movies)
    ),
  ]).filter(movie => movie.poster && movie.poster !== 'https://placehold.co/400x600/111827/6b7280/png?text=No+Poster');

  const tvdbRows = discovered.filter(movie => String(movie.imdbID || '').startsWith('tvdb-'));
  if (tvdbRows.length >= 8) {
    return tvdbRows.slice(0, 24);
  }

  const ids = discovered
    .map(movie => movie.imdbID)
    .filter(id => id && !String(id).startsWith('tvdb-'))
    .slice(0, 24) as string[];

  if (ids.length === 0) {
    console.warn('[Movies] Discovery search returned no IDs, falling back to curated trending list');
    const curated = await fetchTrendingMovies();
    return curated.length > 0 ? curated : trendingMovies;
  }

  const details = await Promise.allSettled(ids.map(id => getMovieByImdbId(id, 'short')));
  const failedDetails = details.filter(r => r.status === 'rejected');
  if (failedDetails.length > 0) {
    console.warn('[Movies] Some OMDb detail requests failed', { failed: failedDetails.length });
  }

  const rows = dedupeMovies(
    details
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getMovieByImdbId>>> => r.status === 'fulfilled')
      .map(r => mapDetailToMovie(r.value)),
  );
  if (rows.length === 0) {
    console.warn('[Movies] Detail lookup returned no valid rows, falling back to curated trending list');
    const curated = await fetchTrendingMovies();
    return curated.length > 0 ? curated : trendingMovies;
  }
  return rows;
}

export default function Movies() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState('Title');
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [trending, setTrending] = useState<Movie[] | null>(null);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setTrendingLoading(true);
      setTrendingError(null);
      try {
        const rows = await fetchLiveMovieDiscovery();
        if (!cancelled) {
          console.debug('[Movies] Discovery loaded', { count: rows.length });
          setTrending(rows.length > 0 ? rows : null);
          setTrendingError(rows.length === 0 ? 'No trending titles loaded from OMDb.' : null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Movies] Discovery failed', err);
          setTrending(trendingMovies);
          setTrendingError('Live OMDb movies are unavailable right now, showing curated picks.');
        }
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      setTotalResults(0);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);

    searchMovies(debouncedQuery)
      .then(({ movies, total }) => {
        if (!cancelled) {
          console.debug('[Movies] Search loaded', { query: debouncedQuery, count: movies.length, total });
          setSearchResults(movies);
          setTotalResults(total);
          setSearchError(movies.length === 0 ? `No OMDb results found for "${debouncedQuery}".` : null);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[Movies] Search failed', { query: debouncedQuery, error: err });
          setSearchResults([]);
          setTotalResults(0);
          const fallback = trendingMovies.filter(movie =>
            movie.title.toLowerCase().includes(debouncedQuery.toLowerCase())
            || movie.genre.some(genre => genre.toLowerCase().includes(debouncedQuery.toLowerCase())),
          );
          setSearchResults(fallback);
          setTotalResults(fallback.length);
          setSearchError(fallback.length > 0
            ? 'Live OMDb search is unavailable right now, showing curated matching picks.'
            : err instanceof Error ? err.message : 'Search failed.');
        }
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const searching = debouncedQuery.length >= 2;

  const finalResults = useMemo(() => {
    const base = searching ? searchResults : trending ?? [];
    const copy = [...base];
    if (!searching && sort === 'Title') return copy;

    copy.sort((a, b) => {
      if (sort === 'Rating') return (b.rating || 0) - (a.rating || 0);
      if (sort === 'Year (Newest)') return (b.year || 0) - (a.year || 0);
      if (sort === 'Year (Oldest)') return (a.year || 0) - (b.year || 0);
      return a.title.localeCompare(b.title);
    });
    return copy;
  }, [searchResults, trending, searching, sort]);

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <Seo
        title="Movies | CineVerse AI"
        description="Search, sort, and discover premium movie recommendations with live metadata, curated trending titles, and editorial discovery context."
      />
      <div className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <SectionHeader
            title="Movies"
            subtitle="Search the Open Movie Database — tap a poster for full details"
            accent="cyan"
            icon={<Film className="w-6 h-6" />}
          />

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search movies (min. 2 characters)..."
                className="w-full bg-gray-900/50 border border-white/10 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 text-white placeholder-gray-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2">
              <SortDropdown
                options={sortOptions}
                selected={sort}
                onSelect={setSort}
                disabled={searchLoading}
              />
              <button
                type="button"
                onClick={() => setIsTipsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Tips
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
        <section>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {searching ? 'Search Results' : 'Trending Now'}
                {searching && <span className="text-cyan-400 text-sm font-medium bg-cyan-400/10 px-2 py-0.5 rounded-lg border border-cyan-400/20">{totalResults}</span>}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {searching 
                  ? `Showing top matches for "${debouncedQuery}" sorted by ${sort.toLowerCase()}`
                  : `Currently popular titles from OMDb metadata`
                }
              </p>
            </div>
            {searchLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold animate-pulse">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Updating Results…
              </div>
            )}
          </div>

          {searchError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 animate-shake">
              <Info className="w-4 h-4" />
              {searchError}
            </div>
          )}

          {!searching && trendingError && (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm mb-6">
              <Info className="w-4 h-4" />
              {trendingError}
            </div>
          )}

          {(trendingLoading && !searching) || (searchLoading && finalResults.length === 0) ? (
            <MovieGridSkeleton count={searching ? 6 : 12} />
          ) : finalResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 relative z-0">
              {finalResults.map(movie => (
                <MovieCard key={String(movie.id)} movie={movie} />
              ))}
            </div>
          ) : !searchLoading ? (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-gray-900/20">
              <Film className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-20" />
              <p className="text-gray-400 font-medium">No movies found matching your criteria</p>
              <button 
                onClick={() => setQuery('')}
                className="mt-4 text-cyan-400 text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <TipsModal 
        isOpen={isTipsOpen} 
        onClose={() => setIsTipsOpen(false)} 
      />
    </div>
  );
}
