import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookMarked,
  Clock,
  Film,
  Loader2,
  MonitorPlay,
  Play,
  Search,
  Star,
  Tv,
  Zap,
} from 'lucide-react';
import HeroSection, { FeaturedHeroItem } from '../components/HeroSection';
import TrailerCard from '../components/TrailerCard';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';
import EditorialCollectionCard from '../components/EditorialCollectionCard';
import TrendingMoviesShowcase from '../components/TrendingMoviesShowcase';
import TrendingAnimeShowcase from '../components/TrendingAnimeShowcase';
import TrendingTvShowcase from '../components/TrendingTvShowcase';
import UpcomingEpisodesSection from '../components/UpcomingEpisodesSection';
import MovieCard from '../components/MovieCard';
import HomeSEOContent from '../components/HomeSEOContent';
import AnimeCard from '../components/AnimeCard';
import TvCard from '../components/TvCard';
import VoiceSearchButton from '../components/VoiceSearchButton';
import {
  JikanApiError,
  fetchTopAnimePopular,
  searchAnime,
} from '../lib/jikan';
import { mapJikanAnime } from '../lib/jikanMap';
import {
  getMovieByImdbId,
  mapDetailToMovie,
  searchMovies,
} from '../lib/omdb';
import { TvMazeApiError, getShowsPage, searchShows } from '../lib/tvmaze';
import {
  dedupeShows,
  isSameLocalDay,
  mapTvMazeShow,
  trendingShowsFromSchedule,
} from '../lib/tvmazeMap';
import {
  fetchAiringWindow,
  formatLocalYmd,
  scheduleCountryCode,
} from '../lib/tvmazeSchedule';
import {
  WatchmodeTitleDetails,
  WatchmodeSourceListItem,
  detectAvailableRegion,
  fetchSourcesList,
  fetchTitleDetails,
  listTitles,
} from '../lib/watchmode';
import {
  fetchOfficialTrailerVideoId,
  youtubeThumbnailUrl,
} from '../lib/youtube';
import { trendingMovies as fallbackMovies } from '../data/movies';
import { featuredTrailers } from '../data/trailers';
import { buildSearchUrl } from '../lib/smartSearch';
import AdSlot from '../components/ads/AdSlot';
import { fetchHomeCms } from '../cms/sanityClient';
import { fallbackCmsHome } from '../cms/fallbackContent';
import { isFeatureEnabled } from '../config/platform';
import { buildMoodRecommendations, type DiscoveryMood } from '../features/aiRecommendations';
import { getRotatedEditorialCollections } from '../data/editorialCollections';
import type { CmsHomePayload } from '../cms/types';
import type { Anime, Movie, Trailer, TvAiringRow, TvShow } from '../types';

const REFRESH_MS = 10 * 60 * 1000;
const MOVIE_SEEDS = ['2026', 'marvel', 'mission', 'detective', 'space', 'dragon', 'kingdom'];

type Suggestion = {
  id: string | number;
  title: string;
  subtitle: string;
  poster: string;
  href: string;
  kind: 'Movie' | 'Anime' | 'TV';
};

function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function uniqueById<T extends { id: string | number }>(items: T[]): T[] {
  const seen = new Set<string | number>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function fetchLiveTrendingMovies(): Promise<Movie[]> {
  const seed = MOVIE_SEEDS[Math.floor(Date.now() / REFRESH_MS) % MOVIE_SEEDS.length];
  console.debug('[Home] Loading trending movies', { seed });
  const search = await searchMovies(seed, 1);
  const ids = search.movies.map(m => m.imdbID).filter(Boolean).slice(0, 12) as string[];
  if (ids.length === 0) {
    console.warn('[Home] Trending movie search returned no IDs');
    return fallbackMovies;
  }
  const details = await Promise.allSettled(ids.map(id => getMovieByImdbId(id, 'short')));
  const failed = details.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn('[Home] Some trending movie details failed', { failed: failed.length });
  }
  const rows = details
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getMovieByImdbId>>> => r.status === 'fulfilled')
    .map(r => mapDetailToMovie(r.value))
    .sort((a, b) => b.rating - a.rating);
  return rows.length > 0 ? rows : fallbackMovies;
}

function titlePoster(title: WatchmodeTitleDetails): string {
  return title.posterMedium || title.posterLarge || title.poster || 'https://placehold.co/400x600/111827/6b7280/png?text=No+Poster';
}

function providerBadges(
  title: WatchmodeTitleDetails,
  region: string,
  sourcesById: Map<number, WatchmodeSourceListItem>,
): WatchmodeSourceListItem[] {
  const seen = new Set<number>();
  return (title.sources || [])
    .filter(s => s.type === 'sub' && (!region || s.region === region))
    .map(s => sourcesById.get(s.source_id))
    .filter((s): s is WatchmodeSourceListItem => Boolean(s))
    .filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    })
    .slice(0, 3);
}

function movieHero(movie: Movie): FeaturedHeroItem {
  return {
    id: `movie-${movie.id}`,
    title: movie.title,
    poster: movie.poster,
    backdrop: movie.backdrop || movie.poster,
    rating: movie.rating,
    year: movie.year,
    genre: movie.genre,
    description: movie.description,
    duration: movie.duration,
    href: movie.imdbID ? `/movies/${movie.imdbID}` : '/movies',
    browseHref: '/movies',
    browseLabel: 'Browse movies',
    label: 'Trending Movie',
  };
}

function animeHero(anime: Anime): FeaturedHeroItem {
  return {
    id: `anime-${anime.id}`,
    title: anime.title,
    poster: anime.poster,
    backdrop: anime.backdrop || anime.poster,
    rating: anime.rating,
    year: anime.year,
    genre: anime.genre,
    description: anime.description,
    duration: anime.episodes > 0 ? `${anime.episodes} eps` : anime.status,
    href: `/anime/${anime.id}`,
    browseHref: '/anime',
    browseLabel: 'Browse anime',
    label: 'Trending Anime',
  };
}

function tvHero(show: TvShow): FeaturedHeroItem {
  return {
    id: `tv-${show.id}`,
    title: show.title,
    poster: show.poster,
    backdrop: show.backdrop || show.poster,
    rating: show.rating,
    year: show.year,
    genre: show.genre,
    description: show.description,
    duration: show.runtimeMinutes ? `${show.runtimeMinutes}m` : show.status,
    href: `/tv/${show.id}`,
    browseHref: '/tv',
    browseLabel: 'Browse TV',
    label: 'Trending TV',
  };
}

function ottHero(title: WatchmodeTitleDetails): FeaturedHeroItem {
  return {
    id: `ott-${title.id}`,
    title: title.title,
    poster: titlePoster(title),
    backdrop: title.backdrop || titlePoster(title),
    rating: title.user_rating ? Number(title.user_rating.toFixed(1)) : 0,
    year: title.year || 0,
    genre: title.genre_names || [],
    description: title.plot_overview || 'Streaming availability is pulled live from Watchmode.',
    duration: formatRuntime(title.runtime_minutes),
    href: title.type === 'movie' && title.imdb_id ? `/movies/${title.imdb_id}` : '/ott',
    browseHref: '/ott',
    browseLabel: 'Browse OTT',
    label: 'Streaming Now',
  };
}

function HomeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = (value = query) => {
    const q = value.trim();
    if (q.length < 2) return;
    navigate(buildSearchUrl(q));
  };

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        searchMovies(q),
        searchAnime({ query: q, page: 1, limit: 4 }),
        searchShows(q, 4),
      ]);
      if (cancelled) return;

      const next: Suggestion[] = [];
      const [movieRes, animeRes, tvRes] = results;

      if (movieRes.status === 'fulfilled') {
        next.push(...movieRes.value.movies.slice(0, 4).map(m => ({
          id: `m-${m.id}`,
          title: m.title,
          subtitle: `${m.year || ''} Movie`.trim(),
          poster: m.poster,
          href: m.imdbID ? `/movies/${m.imdbID}` : `/search?q=${encodeURIComponent(q)}`,
          kind: 'Movie' as const,
        })));
      }

      if (animeRes.status === 'fulfilled') {
        next.push(...animeRes.value.data.map(mapJikanAnime).slice(0, 3).map(a => ({
          id: `a-${a.id}`,
          title: a.title,
          subtitle: `${a.year || ''} Anime`.trim(),
          poster: a.poster,
          href: `/anime/${a.id}`,
          kind: 'Anime' as const,
        })));
      }

      if (tvRes.status === 'fulfilled') {
        next.push(...tvRes.value.map(r => mapTvMazeShow(r.show)).slice(0, 3).map(s => ({
          id: `t-${s.id}`,
          title: s.title,
          subtitle: `${s.year || ''} TV Show`.trim(),
          poster: s.poster,
          href: `/tv/${s.id}`,
          kind: 'TV' as const,
        })));
      }

      setSuggestions(next.slice(0, 8));
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="border-y border-white/5 bg-gray-900/55 backdrop-blur-md">
      <form
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Try: "Show me dark thriller anime"'
            className="w-full bg-gray-950/70 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 text-white placeholder-gray-500 rounded-2xl pl-12 pr-40 py-4 outline-none transition-all"
          />
          <VoiceSearchButton
            onTranscript={text => {
              setQuery(text);
              submit(text);
            }}
            className="absolute right-24 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-cyan-400/30 flex items-center justify-center transition-all"
          />
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 text-gray-950 text-sm font-black transition-colors"
          >
            Search
          </button>
        </div>

        {(suggestions.length > 0 || loading) && (
          <div className="absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 top-[calc(100%-0.75rem)] z-30 rounded-2xl border border-white/10 bg-gray-950/98 shadow-2xl shadow-black/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                Searching live APIs...
              </div>
            ) : suggestions.map(item => (
              <Link
                key={item.id}
                to={item.href}
                className="flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors"
              >
                <img src={item.poster} alt={`${item.title} poster`} loading="lazy" className="w-10 h-14 rounded-lg object-cover bg-gray-900" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                </div>
                <span className="ml-auto text-[10px] uppercase font-black text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2 py-1 rounded-lg">
                  {item.kind}
                </span>
              </Link>
            ))}
            {!loading && (
              <button
                type="button"
                onClick={() => submit()}
                className="w-full p-3 text-left text-sm font-bold text-cyan-400 hover:bg-cyan-400/10 transition-colors"
              >
                View all results for "{query.trim()}"
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

function OttContentSection({
  titles,
  region,
  sources,
  loading,
  error,
}: {
  titles: WatchmodeTitleDetails[];
  region: string;
  sources: WatchmodeSourceListItem[];
  loading: boolean;
  error: string | null;
}) {
  const sourcesById = useMemo(() => new Map(sources.map(s => [s.id, s])), [sources]);

  return (
    <section>
      <SectionHeader
        title="Trending OTT Content"
        subtitle={`Popular streaming titles from Watchmode${region ? ` (${region})` : ''}`}
        viewAllTo="/ott"
        accent="blue"
        icon={<BookMarked className="w-5 h-5" />}
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 text-amber-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : titles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {titles.slice(0, 6).map(title => {
            const badges = providerBadges(title, region, sourcesById);
            const href = title.type === 'movie' && title.imdb_id ? `/movies/${title.imdb_id}` : '/ott';
            const rating = title.user_rating ? Number(title.user_rating.toFixed(1)) : null;
            return (
              <Link
                key={title.id}
                to={href}
                className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 hover:scale-105 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <img src={titlePoster(title)} alt={title.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/45 to-transparent opacity-90" />
                <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
                  {badges.map(source => (
                    <span key={source.id} className="flex items-center gap-1 rounded-md bg-black/65 border border-white/10 px-1.5 py-1 text-[9px] font-black uppercase text-white backdrop-blur-md">
                      {source.logo_100px ? <img src={source.logo_100px} alt={`${source.name} logo`} loading="lazy" className="w-3.5 h-3.5 rounded-sm" /> : null}
                      <span className="truncate max-w-[5rem]">{source.name}</span>
                    </span>
                  ))}
                </div>
                {rating !== null && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-semibold">{rating}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2">{title.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    {title.year ? <span>{title.year}</span> : null}
                    <span className="uppercase text-blue-300">{title.type === 'movie' ? 'Movie' : 'TV'}</span>
                    {title.runtime_minutes ? (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>{formatRuntime(title.runtime_minutes)}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-gray-900/40 p-6 text-sm text-gray-500">
          No Watchmode titles are available right now.
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [cms, setCms] = useState<CmsHomePayload>(fallbackCmsHome);
  const [mood, setMood] = useState<DiscoveryMood>('epic');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesErr, setMoviesErr] = useState<string | null>(null);

  const [animeLoading, setAnimeLoading] = useState(true);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [animeErr, setAnimeErr] = useState<string | null>(null);

  const [tvLoading, setTvLoading] = useState(true);
  const [tvTrendingShows, setTvTrendingShows] = useState<TvShow[]>([]);
  const [tvWeekRows, setTvWeekRows] = useState<TvAiringRow[]>([]);
  const [tvErr, setTvErr] = useState<string | null>(null);

  const [ottLoading, setOttLoading] = useState(true);
  const [ottTitles, setOttTitles] = useState<WatchmodeTitleDetails[]>([]);
  const [ottSources, setOttSources] = useState<WatchmodeSourceListItem[]>([]);
  const [ottRegion, setOttRegion] = useState('IN');
  const [ottErr, setOttErr] = useState<string | null>(null);

  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [trailersLoading, setTrailersLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHomeCms().then(payload => {
      if (cancelled) return;
      setCms(payload);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMovies = useCallback(async () => {
    setMoviesLoading(true);
    setMoviesErr(null);
    try {
      const rows = await fetchLiveTrendingMovies();
      console.debug('[Home] Trending movies loaded', { count: rows.length });
      setMovies(rows);
      if (rows.length === 0) setMoviesErr('OMDb returned no live movie results.');
    } catch (err) {
      console.error('[Home] Trending movie load failed', err);
      setMovies(fallbackMovies);
      setMoviesErr('Live OMDb movies are unavailable right now, showing curated picks.');
    } finally {
      setMoviesLoading(false);
    }
  }, []);

  const loadAnime = useCallback(async () => {
    setAnimeLoading(true);
    setAnimeErr(null);
    try {
      const res = await fetchTopAnimePopular(12);
      setPopularAnime(res.data.map(mapJikanAnime));
    } catch (err) {
      setPopularAnime([]);
      setAnimeErr(err instanceof JikanApiError ? err.message : 'Popular anime could not be loaded.');
    } finally {
      setAnimeLoading(false);
    }
  }, []);

  const loadTv = useCallback(async () => {
    const country = scheduleCountryCode();
    setTvLoading(true);
    setTvErr(null);
    try {
      const [weekRes, pageRes] = await Promise.allSettled([
        fetchAiringWindow(country, 0, 7),
        getShowsPage(Math.floor(Date.now() / REFRESH_MS) % 10),
      ]);

      const catalogue = pageRes.status === 'fulfilled' ? pageRes.value.map(mapTvMazeShow) : [];
      if (weekRes.status === 'fulfilled') {
        const rows = weekRes.value;
        setTvWeekRows(rows);
        const today = formatLocalYmd(new Date());
        const todayFiltered = rows.filter(r => isSameLocalDay(r.episode, today));
        let trending = trendingShowsFromSchedule(todayFiltered.length > 0 ? todayFiltered : rows, 12);
        if (trending.length < 6 && catalogue.length > 0) {
          trending = dedupeShows([...trending, ...catalogue]).slice(0, 12);
        }
        setTvTrendingShows(trending);
      } else {
        setTvWeekRows([]);
        setTvTrendingShows(dedupeShows(catalogue).slice(0, 12));
        setTvErr(weekRes.reason instanceof TvMazeApiError ? weekRes.reason.message : 'TV schedules unavailable.');
      }
    } finally {
      setTvLoading(false);
    }
  }, []);

  const loadOtt = useCallback(async () => {
    setOttLoading(true);
    setOttErr(null);
    try {
      const region = await detectAvailableRegion();
      setOttRegion(region);
      const [sources, list] = await Promise.all([
        fetchSourcesList(region, 'sub'),
        listTitles({
          types: 'movie,tv_series',
          regions: region,
          sort_by: 'popularity_desc',
          source_types: 'sub',
          limit: 24,
          page: 1,
        }),
      ]);

      setOttSources(sources);
      const ids = (list.titles || []).map(t => t.id).slice(0, 12);
      const details = await Promise.allSettled(ids.map(id => fetchTitleDetails(id, region, true)));
      const rows = details
        .filter((r): r is PromiseFulfilledResult<WatchmodeTitleDetails> => r.status === 'fulfilled')
        .map(r => r.value);
      setOttTitles(rows);
      if (rows.length === 0) setOttErr('Watchmode returned no streamable titles for this region.');
    } catch (err) {
      setOttTitles([]);
      setOttErr(err instanceof Error ? err.message : 'Could not reach Watchmode.');
    } finally {
      setOttLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
    loadAnime();
    loadTv();
    loadOtt();

    const timer = window.setInterval(() => {
      loadMovies();
      loadAnime();
      loadTv();
      loadOtt();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadAnime, loadMovies, loadOtt, loadTv]);

  useEffect(() => {
    if (cms.featuredTrailers.length > 0) {
      setTrailers(cms.featuredTrailers.slice(0, 3));
      setTrailersLoading(false);
      return;
    }

    const trailerSource = [
      ...movies.slice(0, 3).map(item => ({ title: item.title, year: String(item.year || ''), type: 'Movie' as const, imdbID: item.imdbID })),
      ...popularAnime.slice(0, 2).map(item => ({ title: item.title, year: String(item.year || ''), type: 'Anime' as const })),
      ...tvTrendingShows.slice(0, 1).map(item => ({ title: item.title, year: String(item.year || ''), type: 'Series' as const })),
    ];

    if (trailerSource.length === 0) {
      setTrailers([]);
      return;
    }

    let cancelled = false;
    setTrailersLoading(true);
    Promise.allSettled(
      trailerSource.map(async (item, index) => {
        const youtubeId = await fetchOfficialTrailerVideoId(item);
        if (!youtubeId) return null;
        return {
          id: index + 1,
          title: `${item.title} Official Trailer`,
          thumbnail: youtubeThumbnailUrl(youtubeId, 'hq'),
          youtubeId,
          type: item.type,
          releaseDate: item.year || 'Latest',
          views: 'Live',
        } satisfies Trailer;
      }),
    ).then(results => {
      if (cancelled) return;
      const rows = results
        .filter((r): r is PromiseFulfilledResult<Trailer | null> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter((item): item is Trailer => Boolean(item))
        .slice(0, 3);
      console.debug('[Home] Featured trailers loaded', { count: rows.length });
      setTrailers(rows.length > 0 ? rows : featuredTrailers.slice(0, 3));
    }).finally(() => {
      if (!cancelled) setTrailersLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [cms.featuredTrailers, movies, popularAnime, tvTrendingShows]);

  const heroItems = useMemo(() => uniqueById<FeaturedHeroItem>([
    ...cms.hero,
    ...movies.slice(0, 2).map(movieHero),
    ...popularAnime.slice(0, 1).map(animeHero),
    ...tvTrendingShows.slice(0, 1).map(tvHero),
    ...ottTitles.slice(0, 1).map(ottHero),
    ...cms.editorPicks.slice(0, 1),
  ]), [cms.editorPicks, cms.hero, movies, ottTitles, popularAnime, tvTrendingShows]);

  const moodRecommendations = useMemo(
    () => buildMoodRecommendations(mood, { movies, anime: popularAnime, tv: tvTrendingShows }),
    [mood, movies, popularAnime, tvTrendingShows],
  );

  const homepageAd = cms.adSlots.find(slot => slot.placement === 'homepage-inline');

  const anyLoading = moviesLoading || animeLoading || tvLoading || ottLoading;

  return (
    <div className="bg-gray-950 min-h-screen">
      <Seo
        title="CineVerse AI - Your Entertainment Universe"
        description="Discover movies, anime, TV shows, trailers, ratings and AI-powered entertainment recommendations."
        image={cms.seo.image}
        url="https://cineverse-ai-gules.vercel.app"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'CineVerse AI',
          url: 'https://cineverse-ai-gules.vercel.app',
          description: 'Discover movies, anime, TV shows, trailers, ratings and AI-powered entertainment recommendations.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://cineverse-ai-gules.vercel.app/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <HeroSection items={heroItems} loading={anyLoading && heroItems.length === 0} />
      <HomeSearch />

      <div className="border-b border-white/5 bg-gray-900/45 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Live Movies', value: movies.length, icon: Film },
              { label: 'Anime Loaded', value: popularAnime.length, icon: Zap },
              { label: 'TV Airings', value: tvWeekRows.length || tvTrendingShows.length, icon: Tv },
              { label: `OTT ${ottRegion}`, value: ottTitles.length, icon: BookMarked },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-center gap-3 text-center">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-2xl font-black text-cyan-400">{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {cms.banners.filter(banner => banner.visible && banner.placement === 'homepage').map(banner => (
          <Link
            key={banner.id}
            to={banner.href || '/about'}
            className="block overflow-hidden rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-5 transition-all hover:border-cyan-300/40 hover:bg-cyan-400/15"
          >
            <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Managed in Sanity</p>
            <h2 className="mt-2 text-2xl font-black text-white">{banner.title}</h2>
            {banner.subtitle ? <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-400">{banner.subtitle}</p> : null}
          </Link>
        ))}

        <AdSlot slot={homepageAd} />

        <TrendingMoviesShowcase
          movies={movies}
          loading={moviesLoading}
          error={moviesErr}
          subtitle="Fresh OMDb results refreshed automatically"
        />

        <TrendingAnimeShowcase
          anime={popularAnime}
          loading={animeLoading}
          error={animeErr}
        />

        <TrendingTvShowcase shows={tvTrendingShows} loading={tvLoading} error={tvErr} />

        <OttContentSection
          titles={ottTitles}
          region={ottRegion}
          sources={ottSources}
          loading={ottLoading}
          error={ottErr}
        />

        {isFeatureEnabled('aiRecommendations') && (
          <section>
            <SectionHeader
              title="AI Mood Picks"
              subtitle="Config-ready recommendation scoring that can be swapped for OpenAI, embeddings, or Supabase vector search"
              accent="emerald"
              icon={<Zap className="w-5 h-5" />}
            />
            <div className="mb-5 flex flex-wrap gap-2">
              {(['epic', 'cozy', 'dark', 'funny', 'mind-bending'] as DiscoveryMood[]).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMood(option)}
                  className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                    mood === option
                      ? 'border-emerald-300 bg-emerald-400 text-gray-950'
                      : 'border-white/10 bg-gray-900/60 text-gray-500 hover:border-emerald-300/40 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {moodRecommendations.map(item => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group flex gap-4 rounded-xl border border-white/5 bg-gray-900/50 p-3 transition-all hover:border-emerald-300/30 hover:bg-gray-900"
                >
                  <img src={item.poster} alt="" loading="lazy" className="h-24 w-16 rounded-lg object-cover bg-gray-950" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{item.type}</span>
                    <h3 className="mt-1 truncate font-black text-white group-hover:text-emerald-100">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.reason}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader
            title="Editorial Discovery Studio"
            subtitle={`Rotating weekly editorial picks — week ${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 52}`}
            accent="blue"
            icon={<Star className="w-5 h-5" />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {getRotatedEditorialCollections().map((collection, index) => (
              <EditorialCollectionCard key={collection.title} collection={collection} index={index} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Quick Picks"
            subtitle="A cross-platform mix from live movie, anime, and TV APIs"
            viewAllTo="/search"
            accent="emerald"
            icon={<MonitorPlay className="w-5 h-5" />}
          />
          {anyLoading && heroItems.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {movies.slice(0, 2).map(movie => <MovieCard key={`pick-m-${movie.id}`} movie={movie} />)}
              {popularAnime.slice(0, 2).map(item => <AnimeCard key={`pick-a-${item.id}`} anime={item} />)}
              {tvTrendingShows.slice(0, 2).map(show => <TvCard key={`pick-t-${show.id}`} show={show} />)}
            </div>
          )}
        </section>

        <UpcomingEpisodesSection rows={tvWeekRows} loading={tvLoading} error={tvErr} limit={6} />

        <section>
          <SectionHeader
            title="Featured Trailers"
            subtitle="Client-managed YouTube embeds with cached fallback support"
            viewAllTo="/trailers"
            accent="blue"
            icon={<Play className="w-5 h-5" />}
          />
          {trailersLoading && trailers.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : trailers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trailers.map(trailer => (
                <TrailerCard key={trailer.id} trailer={trailer} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-gray-900/40 p-6 text-sm text-gray-500">
              Trailer lookups will appear here when the YouTube API key is available.
            </div>
          )}
        </section>
        
        <HomeSEOContent />
      </div>
    </div>
  );
}
