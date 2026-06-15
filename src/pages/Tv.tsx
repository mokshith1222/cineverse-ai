import { useEffect, useState } from 'react';
import { Clock, MonitorPlay, Search, SlidersHorizontal, Tv as TvIcon, X } from 'lucide-react';
import TvCard from '../components/TvCard';
import TvGridSkeleton from '../components/TvGridSkeleton';
import TvScheduleSection from '../components/TvScheduleSection';
import UpcomingEpisodesSection from '../components/UpcomingEpisodesSection';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';
import {
  TvMazeApiError,
  getShowsPage,
  searchShows,
} from '../lib/tvmaze';
import {
  dedupeShows,
  isSameLocalDay,
  mapTvMazeShow,
  trendingShowsFromSchedule,
} from '../lib/tvmazeMap';
import { fetchAiringWindow, formatLocalYmd, scheduleCountryCode } from '../lib/tvmazeSchedule';
import type { TvAiringRow, TvShow } from '../types';

const REFRESH_MS = 10 * 60 * 1000;

export default function Tv() {
  const country = scheduleCountryCode();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tipsOpen, setTipsOpen] = useState(false);

  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseErr, setBrowseErr] = useState<string | null>(null);
  const [weekRows, setWeekRows] = useState<TvAiringRow[]>([]);
  const [todayRows, setTodayRows] = useState<TvAiringRow[]>([]);
  const [trendingShows, setTrendingShows] = useState<TvShow[]>([]);
  const [spotlightShows, setSpotlightShows] = useState<TvShow[]>([]);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [searchShowsState, setSearchShowsState] = useState<TvShow[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setBrowseLoading(true);
      setBrowseErr(null);
      try {
        const rotatingPage = Math.floor(Date.now() / REFRESH_MS) % 20;
        const [weekResult, pageResult] = await Promise.allSettled([
          fetchAiringWindow(country, 0, 7),
          getShowsPage(rotatingPage),
        ]);

        if (cancelled) return;

        const today = formatLocalYmd(new Date());

        let catalogue: TvShow[] = [];
        if (pageResult.status === 'fulfilled') {
          catalogue = pageResult.value.map(mapTvMazeShow);
        }

        if (weekResult.status === 'fulfilled') {
          const rows = weekResult.value;
          setWeekRows(rows);
          const todayFiltered = rows.filter(r => isSameLocalDay(r.episode, today));
          setTodayRows(todayFiltered);

          let trending = trendingShowsFromSchedule(todayFiltered.length > 0 ? todayFiltered : rows, 18);
          if (trending.length < 10 && catalogue.length > 0) {
            trending = dedupeShows([...trending, ...catalogue]).slice(0, 18);
          }
          setTrendingShows(trending);
          setSpotlightShows(dedupeShows(catalogue).slice(0, 18));
        } else {
          setWeekRows([]);
          setTodayRows([]);
          setTrendingShows([]);
          setBrowseErr(
            weekResult.reason instanceof TvMazeApiError
              ? weekResult.reason.message
              : 'TV listings could not be loaded.',
          );
          setSpotlightShows(dedupeShows(catalogue).slice(0, 24));
        }
      } finally {
        if (!cancelled) setBrowseLoading(false);
      }
    };

    run();
    const timer = window.setInterval(run, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [country]);

  const searching = debouncedQuery.length >= 2;

  useEffect(() => {
    if (!searching) {
      setSearchShowsState([]);
      setSearchErr(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchErr(null);

    searchShows(debouncedQuery, 36)
      .then(hits => {
        if (cancelled) return;
        setSearchShowsState(hits.map(h => mapTvMazeShow(h.show)));
      })
      .catch(err => {
        if (cancelled) return;
        setSearchShowsState([]);
        setSearchErr(
          err instanceof TvMazeApiError ? err.message : 'Search failed.',
        );
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searching]);

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <Seo
        title="TV Shows | CineVerse AI"
        description="Browse TV shows, schedules, and live discovery content with editorial context and premium streaming-style UI."
      />
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader
            title="Television"
            subtitle="Live schedules, streaming premieres & catalogue search via TVMaze"
            accent="emerald"
            icon={<MonitorPlay className="w-6 h-6" />}
          />

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search TV shows (min. 2 characters)…"
                className="w-full bg-gray-900 border border-white/10 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 text-white placeholder-gray-500 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setTipsOpen(!tipsOpen)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors shrink-0 ${
                tipsOpen ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Tips
            </button>
          </div>

        </div>
      </div>

      {tipsOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close TV tips"
            onClick={() => setTipsOpen(false)}
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-400/20 bg-gray-950 shadow-2xl shadow-emerald-950/40 animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-black text-white">TV Discovery Tips</h2>
                  </div>
                  <p className="text-sm text-gray-400">Use TVMaze-powered schedules and search without fighting the interface.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTipsOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close tips"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: Search,
                    title: 'Search precisely',
                    body: 'Type at least two characters. Try show names, franchises, networks, or alternate titles.',
                  },
                  {
                    icon: Clock,
                    title: 'Use schedules',
                    body: `Airing rows are based on country ${country}. Streaming premieres are mixed into upcoming sections.`,
                  },
                  {
                    icon: TvIcon,
                    title: 'Open details',
                    body: 'Every poster links to show details, episode lists, status, runtime, genres, and source metadata.',
                  },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-xl border border-white/5 bg-gray-900/70 p-4">
                      <Icon className="w-5 h-5 text-emerald-400 mb-3" />
                      <h3 className="text-sm font-black text-white mb-1">{item.title}</h3>
                      <p className="text-xs leading-relaxed text-gray-400">{item.body}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-100/80">
                API responses are cached locally for a short time, so repeated searches feel fast and avoid unnecessary TVMaze traffic.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {searching ? (
          <section>
            <div className="mb-6">
              <p className="text-gray-400 text-sm">
                {searchLoading ? (
                  'Searching TVMaze…'
                ) : (
                  <>
                    <span className="text-white font-semibold">{searchShowsState.length}</span> matches for “
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
              <TvGridSkeleton count={12} />
            ) : searchShowsState.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {searchShowsState.map(show => (
                  <TvCard key={show.id} show={show} />
                ))}
              </div>
            ) : (
              !searchErr && (
                <div className="text-center py-16 rounded-2xl border border-white/5 bg-gray-900/40 text-gray-400 text-sm">
                  No TV shows matched that query.
                </div>
              )
            )}
          </section>
        ) : (
          <>
            <section>
              <SectionHeader
                title="Popular & airing now"
                subtitle="Shows trending from today’s schedules plus catalogue picks"
                accent="emerald"
                icon={<MonitorPlay className="w-5 h-5" />}
              />

              {browseErr && (
                <p className="text-amber-400/90 text-sm mb-4">{browseErr}</p>
              )}

              {browseLoading ? (
                <TvGridSkeleton count={12} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {trendingShows.map(show => (
                    <TvCard key={show.id} show={show} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <SectionHeader
                title="Spotlight catalogue"
                subtitle="Discovery snapshot from TVMaze show index"
                accent="emerald"
              />

              {browseLoading ? (
                <TvGridSkeleton count={12} />
              ) : spotlightShows.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {spotlightShows.map(show => (
                    <TvCard key={`spot-${show.id}`} show={show} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Catalogue snapshot unavailable.</p>
              )}
            </section>

            <TvScheduleSection rows={todayRows} loading={browseLoading} error={browseErr} />

            <UpcomingEpisodesSection rows={weekRows} loading={browseLoading} error={browseErr} limit={16} />
          </>
        )}
      </div>
    </div>
  );
}
