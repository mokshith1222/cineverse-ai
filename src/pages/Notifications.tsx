import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, CalendarDays, Film, Loader2, Play, RefreshCw, Sparkles, Tv, Zap } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { useWatchlist } from '../contexts/WatchlistContext';
import { fetchSeasonNow } from '../lib/jikan';
import { fetchAiringWindow, scheduleCountryCode } from '../lib/tvmazeSchedule';
import { fetchTitleDetails, listTitles, WatchmodeTitleDetails } from '../lib/watchmode';
import { searchMovies } from '../lib/omdb';
import { fetchOfficialTrailerVideoId, youtubeWatchUrl } from '../lib/youtube';

const REFRESH_MS = 10 * 60 * 1000;
const SEEN_ALERTS_KEY = 'cineverse-seen-alerts';

type AlertType = 'season' | 'episode' | 'trailer' | 'availability' | 'reminder';

interface PlatformAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  source: string;
  href?: string;
  createdAt: string;
}

function alertIcon(type: AlertType) {
  if (type === 'season') return Zap;
  if (type === 'episode') return Tv;
  if (type === 'trailer') return Play;
  if (type === 'availability') return Film;
  return BellRing;
}

function alertColor(type: AlertType) {
  if (type === 'season') return 'text-orange-300 bg-orange-400/10 border-orange-400/20';
  if (type === 'episode') return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20';
  if (type === 'trailer') return 'text-blue-300 bg-blue-400/10 border-blue-400/20';
  if (type === 'availability') return 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20';
  return 'text-amber-300 bg-amber-400/10 border-amber-400/20';
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function readSeenAlerts(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_ALERTS_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

function writeSeenAlerts(ids: string[]) {
  try {
    localStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export default function Notifications() {
  const { watchlist } = useWatchlist();
  const [alerts, setAlerts] = useState<PlatformAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>(readSeenAlerts);

  const markAllRead = () => {
    const next = Array.from(new Set([...seenIds, ...alerts.map(alert => alert.id)]));
    setSeenIds(next);
    writeSeenAlerts(next);
  };

  const markOneRead = (id: string) => {
    if (seenIds.includes(id)) return;
    const next = [...seenIds, id];
    setSeenIds(next);
    writeSeenAlerts(next);
  };

  const loadAlerts = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [animeRes, tvRes, ottRes, movieRes] = await Promise.allSettled([
        fetchSeasonNow(8),
        fetchAiringWindow(scheduleCountryCode(), 0, 3),
        listTitles({
          types: 'movie,tv_series',
          regions: 'IN',
          sort_by: 'release_date_desc',
          source_types: 'sub',
          limit: 8,
          page: 1,
        }),
        searchMovies('2026', 1),
      ]);

      const next: PlatformAlert[] = [];
      const watchTitles = new Set(watchlist.map(item => normalize(item.title)));

      if (animeRes.status === 'fulfilled') {
        animeRes.value.data.slice(0, 5).forEach(item => {
          const title = item.title_english || item.title;
          next.push({
            id: `season-${item.mal_id}`,
            type: 'season',
            title,
            message: watchTitles.has(normalize(title))
              ? 'A watchlisted anime is active in the current season.'
              : 'Trending seasonal anime is currently airing.',
            source: 'Jikan',
            href: `/anime/${item.mal_id}`,
            createdAt: item.aired?.string || 'Current season',
          });
        });
      }

      if (tvRes.status === 'fulfilled') {
        tvRes.value.slice(0, 6).forEach(row => {
          next.push({
            id: `episode-${row.show.id}-${row.episode.id}`,
            type: 'episode',
            title: row.show.title,
            message: `${row.episode.name} is scheduled${row.episode.airdate ? ` on ${row.episode.airdate}` : ''}.`,
            source: 'TVMaze',
            href: `/tv/${row.show.id}/episodes`,
            createdAt: row.episode.airdate || 'Upcoming',
          });
        });
      }

      if (ottRes.status === 'fulfilled') {
        const details = await Promise.allSettled(
          ottRes.value.titles.slice(0, 6).map(title => fetchTitleDetails(title.id, 'IN', true)),
        );
        details
          .filter((r): r is PromiseFulfilledResult<WatchmodeTitleDetails> => r.status === 'fulfilled')
          .forEach(row => {
            const provider = row.value.sources?.find(source => source.type === 'sub')?.name;
            next.push({
              id: `availability-${row.value.id}`,
              type: 'availability',
              title: row.value.title,
              message: provider ? `Now discoverable on ${provider}.` : 'Streaming availability was updated.',
              source: 'Watchmode',
              href: row.value.type === 'movie' && row.value.imdb_id ? `/movies/${row.value.imdb_id}` : '/ott',
              createdAt: row.value.release_date || 'Latest',
            });
          });
      }

      if (movieRes.status === 'fulfilled') {
        const trailerMovie = movieRes.value.movies.find(movie => movie.imdbID);
        if (trailerMovie) {
          const youtubeId = await fetchOfficialTrailerVideoId({
            title: trailerMovie.title,
            year: String(trailerMovie.year || ''),
            imdbID: trailerMovie.imdbID,
          });
          if (youtubeId) {
            next.push({
              id: `trailer-${youtubeId}`,
              type: 'trailer',
              title: trailerMovie.title,
              message: 'A fresh official trailer is available on YouTube.',
              source: 'YouTube',
              href: youtubeWatchUrl(youtubeId),
              createdAt: 'Live',
            });
          }
        }
      }

      setAlerts(next);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (next.length === 0) setError('No live notification signals are available right now.');
    } catch (err) {
      setAlerts([]);
      setError(err instanceof Error ? err.message : 'Notifications could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [watchlist]);

  useEffect(() => {
    loadAlerts();
    const timer = window.setInterval(() => loadAlerts(true), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadAlerts]);

  const unread = useMemo(() => alerts.filter(alert => !seenIds.includes(alert.id)).length, [alerts, seenIds]);

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader
            title="Notifications"
            subtitle="Live alerts for seasons, trailers, episodes, OTT availability, and watchlist signals"
            accent="cyan"
            icon={<Bell className="w-6 h-6" />}
          />

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="rounded-xl border border-white/5 bg-gray-900/60 px-4 py-3">
              <p className="text-2xl font-black text-white">{alerts.length}</p>
              <p className="text-xs text-gray-400">Live signals</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-gray-900/60 px-4 py-3">
              <p className="text-2xl font-black text-cyan-400">{unread}</p>
              <p className="text-xs text-gray-400">Unread</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={loading || unread === 0}
              className="rounded-xl border border-white/10 bg-gray-900/60 px-4 py-3 text-sm font-bold text-gray-300 hover:text-white hover:border-cyan-400/30 transition-colors"
            >
              {unread === 0 ? 'All read' : 'Mark all read'}
            </button>
            <button
              type="button"
              onClick={() => loadAlerts(true)}
              disabled={loading || refreshing}
              className="rounded-xl border border-white/10 bg-gray-900/60 px-4 py-3 text-sm font-bold text-gray-300 hover:text-white hover:border-cyan-400/30 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
          {lastUpdated && (
            <p className="mt-3 text-xs text-gray-400">Last refreshed at {lastUpdated}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{error}</div>}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl border border-white/5 bg-gray-900 animate-pulse" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => {
              const Icon = alertIcon(alert.type);
              const unreadAlert = !seenIds.includes(alert.id);
              const content = (
                <div className={`rounded-xl border p-4 transition-all ${unreadAlert ? 'border-cyan-400/20 bg-cyan-400/5' : 'border-white/5 bg-gray-900/45 hover:bg-gray-900/70'}`}>
                  <div className="flex gap-4">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${alertColor(alert.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{alert.title}</h3>
                        {unreadAlert ? <span className="rounded-md bg-cyan-500 px-2 py-0.5 text-[10px] font-black uppercase text-gray-950">New</span> : null}
                      </div>
                      <p className="text-sm text-gray-400">{alert.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {alert.source}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {alert.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );

              return alert.href?.startsWith('http') ? (
                <a key={alert.id} href={alert.href} target="_blank" rel="noreferrer" onClick={() => markOneRead(alert.id)}>{content}</a>
              ) : alert.href ? (
                <Link key={alert.id} to={alert.href} onClick={() => markOneRead(alert.id)}>{content}</Link>
              ) : (
                <button key={alert.id} type="button" onClick={() => markOneRead(alert.id)} className="block w-full text-left">{content}</button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-gray-900/40 py-20 text-center text-gray-400">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
