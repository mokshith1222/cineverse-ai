import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Zap } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import SectionHeader from '../components/SectionHeader';
import SeasonalAnimeSection from '../components/SeasonalAnimeSection';
import TrendingAnimeShowcase from '../components/TrendingAnimeShowcase';
import AnimeGridSkeleton from '../components/AnimeGridSkeleton';
import Seo from '../components/Seo';
import {
  JikanApiError,
  fetchSeasonNow,
  fetchTopAnimePopular,
  searchAnime,
  type AnimeSearchOrder,
} from '../lib/jikan';
import { mapJikanAnime } from '../lib/jikanMap';
import type { Anime } from '../types';

const SORT_LABELS = ['Score', 'Title', 'Episodes', 'Popularity'] as const;
const REFRESH_MS = 10 * 60 * 1000;

function sortPreset(label: (typeof SORT_LABELS)[number]): {
  order_by: AnimeSearchOrder;
  sort: 'asc' | 'desc';
} {
  switch (label) {
    case 'Score':
      return { order_by: 'score', sort: 'desc' };
    case 'Title':
      return { order_by: 'title', sort: 'asc' };
    case 'Episodes':
      return { order_by: 'episodes', sort: 'desc' };
    case 'Popularity':
      return { order_by: 'members', sort: 'desc' };
    default:
      return { order_by: 'score', sort: 'desc' };
  }
}

export default function Anime() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortLabel, setSortLabel] = useState<(typeof SORT_LABELS)[number]>('Score');
  const [showTips, setShowTips] = useState(false);

  const [browseLoading, setBrowseLoading] = useState(true);
  const [seasonal, setSeasonal] = useState<Anime[]>([]);
  const [trending, setTrending] = useState<Anime[]>([]);
  const [seasonalErr, setSeasonalErr] = useState<string | null>(null);
  const [trendingErr, setTrendingErr] = useState<string | null>(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [searchItems, setSearchItems] = useState<Anime[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setBrowseLoading(true);
      setSeasonalErr(null);
      setTrendingErr(null);
      const results = await Promise.allSettled([
        fetchSeasonNow(18),
        fetchTopAnimePopular(18),
      ]);
      if (cancelled) return;

      const [seasonRes, topRes] = results;

      if (seasonRes.status === 'fulfilled') {
        setSeasonal(seasonRes.value.data.map(mapJikanAnime));
      } else {
        setSeasonal([]);
        setSeasonalErr(
          seasonRes.reason instanceof JikanApiError
            ? seasonRes.reason.message
            : 'Seasonal anime could not be loaded.',
        );
      }

      if (topRes.status === 'fulfilled') {
        setTrending(topRes.value.data.map(mapJikanAnime));
      } else {
        setTrending([]);
        setTrendingErr(
          topRes.reason instanceof JikanApiError
            ? topRes.reason.message
            : 'Trending anime could not be loaded.',
        );
      }

      setBrowseLoading(false);
    };

    run();
    const timer = window.setInterval(run, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const searching = debouncedQuery.length >= 2;

  const sortParams = useMemo(() => sortPreset(sortLabel), [sortLabel]);

  useEffect(() => {
    if (!searching) {
      setSearchItems([]);
      setSearchPage(1);
      setSearchHasMore(false);
      setSearchErr(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchErr(null);
    setSearchPage(1);

    searchAnime({
      query: debouncedQuery,
      page: 1,
      limit: 24,
      order_by: sortParams.order_by,
      sort: sortParams.sort,
    })
      .then(res => {
        if (cancelled) return;
        setSearchItems(res.data.map(mapJikanAnime));
        setSearchHasMore(res.pagination.has_next_page);
      })
      .catch(err => {
        if (cancelled) return;
        setSearchItems([]);
        setSearchHasMore(false);
        setSearchErr(
          err instanceof JikanApiError ? err.message : 'Search failed. Please try again.',
        );
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searching, sortParams.order_by, sortParams.sort]);

  const loadMoreSearch = async () => {
    if (!searching || searchLoadingMore || !searchHasMore) return;
    const next = searchPage + 1;
    setSearchLoadingMore(true);
    setSearchErr(null);
    try {
      const res = await searchAnime({
        query: debouncedQuery,
        page: next,
        limit: 24,
        order_by: sortParams.order_by,
        sort: sortParams.sort,
      });
      setSearchItems(prev => {
        const seen = new Set(prev.map(item => item.id));
        return [
          ...prev,
          ...res.data.map(mapJikanAnime).filter(item => !seen.has(item.id)),
        ];
      });
      setSearchPage(next);
      setSearchHasMore(res.pagination.has_next_page);
    } catch (err) {
      setSearchErr(
        err instanceof JikanApiError ? err.message : 'Could not load more results.',
      );
    } finally {
      setSearchLoadingMore(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<'seasonal' | 'trending' | null>(null);

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <Seo
        title="Anime | CineVerse AI"
        description="Discover seasonal anime, trending series, and curated anime recommendations with a polished browsing experience."
      />
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader
            title={selectedCategory ? (selectedCategory === 'seasonal' ? 'All Seasonal Anime' : 'All Trending Anime') : "Anime"}
            subtitle={selectedCategory ? "Browsing full list of popular titles" : "Browse seasonal hits, popular series, or search MyAnimeList via Jikan"}
            accent="orange"
            icon={<Zap className="w-6 h-6" />}
          />

          {!selectedCategory && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4 animate-in fade-in duration-500">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search anime (min. 2 characters)…"
                  className="w-full bg-gray-900 border border-white/10 focus:border-orange-400/40 focus:ring-1 focus:ring-orange-400/20 text-white placeholder-gray-500 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortLabel}
                  onChange={e => setSortLabel(e.target.value as (typeof SORT_LABELS)[number])}
                  disabled={!searching || searchLoading}
                  className="bg-gray-900 border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-orange-400/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {SORT_LABELS.map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowTips(!showTips)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    showTips ? 'bg-orange-400/10 border-orange-400/30 text-orange-400' : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Tips
                </button>
              </div>
            </div>
          )}

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 flex items-center gap-2 text-orange-400 text-sm font-bold hover:text-orange-300 transition-colors"
            >
              ← Back to Browse
            </button>
          )}

          {showTips && !selectedCategory && (
            <div className="mt-3 rounded-xl border border-white/10 bg-gray-900/60 px-4 py-3 text-sm text-gray-400 animate-in slide-in-from-top duration-200">
              Jikan mirrors public MyAnimeList data. Results are cached in your browser to stay under rate limits — repeat visits are faster and gentler on the API.
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {!searching && !selectedCategory && (
          <div className="animate-in fade-in duration-700">
            <SeasonalAnimeSection
              anime={seasonal}
              loading={browseLoading}
              error={seasonalErr}
              onViewAll={() => setSelectedCategory('seasonal')}
            />
            <div className="h-14" />
            <TrendingAnimeShowcase
              anime={trending}
              loading={browseLoading}
              error={trendingErr}
              onViewAll={() => setSelectedCategory('trending')}
            />
          </div>
        )}

        {selectedCategory && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {(selectedCategory === 'seasonal' ? seasonal : trending).map(item => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          </div>
        )}

        {searching && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <p className="text-gray-400 text-sm">
                {searchLoading ? (
                  'Searching MyAnimeList…'
                ) : (
                  <>
                    <span className="text-white font-semibold">{searchItems.length}</span> results for “
                    {debouncedQuery}”
                  </>
                )}
              </p>
            </div>

            {searchErr && (
              <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-amber-100 text-sm">
                {searchErr}
              </div>
            )}

            {searchLoading ? (
              <AnimeGridSkeleton count={12} />
            ) : searchItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {searchItems.map(anime => (
                    <AnimeCard key={`${anime.id}-${anime.title}`} anime={anime} />
                  ))}
                </div>
                {searchHasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      type="button"
                      onClick={loadMoreSearch}
                      disabled={searchLoadingMore}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 text-sm font-bold transition-colors"
                    >
                      {searchLoadingMore ? 'Loading…' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              !searchErr && (
                <div className="text-center py-16 rounded-2xl border border-white/5 bg-gray-900/40">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No anime matched that search.</p>
                </div>
              )
            )}
          </section>
        )}
      </div>
    </div>
  );
}
