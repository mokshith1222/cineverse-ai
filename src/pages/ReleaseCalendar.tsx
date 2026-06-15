import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CalendarDays, Clock, Film, Play, Star, Tv, Zap } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { fetchSeasonNow } from '../lib/jikan';
import { fetchAiringWindow, formatLocalYmd, scheduleCountryCode } from '../lib/tvmazeSchedule';
import { fetchSourcesList, fetchTitleDetails, listTitles, WatchmodeSourceListItem, WatchmodeTitleDetails } from '../lib/watchmode';
import type { JikanAnimeListItem } from '../lib/jikanTypes';
import type { TvAiringRow } from '../types';

const REFRESH_MS = 10 * 60 * 1000;
const REMINDER_KEY = 'cineverse-release-reminders';

type CalendarKind = 'Anime' | 'Movie' | 'OTT' | 'TV';

interface CalendarItem {
  id: string;
  kind: CalendarKind;
  title: string;
  date: string;
  time?: string;
  poster: string;
  meta: string;
  href?: string;
  provider?: string;
  rating?: number;
}

function fallbackPoster(label: string) {
  return `https://placehold.co/400x600/111827/6b7280/png?text=${encodeURIComponent(label)}`;
}

function readReminders(): string[] {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

function writeReminders(ids: string[]) {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function daysUntil(date: string): string {
  const target = Date.parse(`${date}T00:00:00`);
  if (Number.isNaN(target)) return date;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.ceil((target - start) / 86_400_000);
  if (days < 0) return 'Released';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

function animeToCalendar(item: JikanAnimeListItem): CalendarItem {
  const date = item.aired?.prop?.from?.year
    ? `${item.aired.prop.from.year}-01-01`
    : formatLocalYmd(new Date());
  return {
    id: `anime-${item.mal_id}`,
    kind: 'Anime',
    title: item.title_english || item.title,
    date,
    poster: item.images.webp.large_image_url || item.images.jpg.large_image_url || fallbackPoster('Anime'),
    meta: item.status || item.aired?.string || 'Seasonal release',
    href: `/anime/${item.mal_id}`,
    rating: item.score || undefined,
  };
}

function tvToCalendar(row: TvAiringRow): CalendarItem {
  return {
    id: `tv-${row.show.id}-${row.episode.id}`,
    kind: 'TV',
    title: row.show.title,
    date: row.episode.airdate || formatLocalYmd(new Date()),
    time: row.episode.airtime || undefined,
    poster: row.show.poster || fallbackPoster('TV'),
    meta: `S${row.episode.season} E${row.episode.number || '?'} ${row.episode.name}`,
    href: `/tv/${row.show.id}/episodes`,
    provider: row.source === 'streaming' ? 'Streaming premiere' : row.show.network,
    rating: row.show.rating || undefined,
  };
}

function posterForTitle(title: WatchmodeTitleDetails): string {
  return title.posterMedium || title.posterLarge || title.poster || fallbackPoster(title.type === 'movie' ? 'Movie' : 'OTT');
}

function watchmodeToCalendar(
  title: WatchmodeTitleDetails,
  sourcesById: Map<number, WatchmodeSourceListItem>,
): CalendarItem | null {
  const date = title.release_date || (title.year ? `${title.year}-01-01` : null);
  if (!date) return null;
  const subSource = (title.sources || []).find(source => source.type === 'sub');
  const provider = subSource ? sourcesById.get(subSource.source_id)?.name || subSource.name : undefined;
  return {
    id: `watchmode-${title.id}`,
    kind: title.type === 'movie' ? 'Movie' : 'OTT',
    title: title.title,
    date,
    poster: posterForTitle(title),
    meta: title.genre_names?.slice(0, 2).join(', ') || (title.type === 'movie' ? 'Movie release' : 'Streaming title'),
    href: title.type === 'movie' && title.imdb_id ? `/movies/${title.imdb_id}` : '/ott',
    provider,
    rating: title.user_rating ? Number(title.user_rating.toFixed(1)) : undefined,
  };
}

export default function ReleaseCalendar() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<string[]>(readReminders);
  const [filter, setFilter] = useState<CalendarKind | 'All'>('All');

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      writeReminders(next);
      return next;
    });
  };

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const region = 'IN';
      const [animeRes, tvRes, sourcesRes, listRes] = await Promise.allSettled([
        fetchSeasonNow(12),
        fetchAiringWindow(scheduleCountryCode(), 0, 14),
        fetchSourcesList(region, 'sub'),
        listTitles({
          types: 'movie,tv_series',
          regions: region,
          sort_by: 'release_date_desc',
          source_types: 'sub',
          limit: 24,
          page: 1,
        }),
      ]);

      const sources = sourcesRes.status === 'fulfilled' ? sourcesRes.value : [];
      const sourcesById = new Map(sources.map(source => [source.id, source]));
      const watchmodeIds = listRes.status === 'fulfilled' ? listRes.value.titles.slice(0, 16).map(title => title.id) : [];
      const details = await Promise.allSettled(watchmodeIds.map(id => fetchTitleDetails(id, region, true)));

      const next = [
        ...(animeRes.status === 'fulfilled' ? animeRes.value.data.map(animeToCalendar) : []),
        ...(tvRes.status === 'fulfilled' ? tvRes.value.map(tvToCalendar) : []),
        ...details
          .filter((r): r is PromiseFulfilledResult<WatchmodeTitleDetails> => r.status === 'fulfilled')
          .map(r => watchmodeToCalendar(r.value, sourcesById))
          .filter((item): item is CalendarItem => Boolean(item)),
      ].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

      setItems(next);
      if (next.length === 0) setError('No release data was returned by the live APIs.');
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Release calendar could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
    const timer = window.setInterval(loadCalendar, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadCalendar]);

  const visibleItems = useMemo(
    () => items.filter(item => filter === 'All' || item.kind === filter),
    [filter, items],
  );

  const counts = useMemo(() => ({
    Anime: items.filter(item => item.kind === 'Anime').length,
    Movie: items.filter(item => item.kind === 'Movie').length,
    TV: items.filter(item => item.kind === 'TV').length,
    OTT: items.filter(item => item.kind === 'OTT').length,
  }), [items]);

  const filters: Array<CalendarKind | 'All'> = ['All', 'Anime', 'Movie', 'TV', 'OTT'];

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader
            title="Release Calendar"
            subtitle="Anime countdowns, movie releases, OTT premieres, TV episodes, and local reminders"
            accent="cyan"
            icon={<CalendarDays className="w-6 h-6" />}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Anime', value: counts.Anime, icon: Zap },
              { label: 'Movies', value: counts.Movie, icon: Film },
              { label: 'TV Episodes', value: counts.TV, icon: Tv },
              { label: 'OTT Premieres', value: counts.OTT, icon: Play },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-gray-900/50 px-4 py-3">
                  <Icon className="w-4 h-4 text-cyan-400 mb-2" />
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {filters.map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase border transition-all active:scale-95 ${
                  filter === item
                    ? 'bg-cyan-500 border-cyan-400 text-gray-950'
                    : 'bg-gray-900/60 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {item}
                <span className={`ml-2 ${filter === item ? 'text-gray-800' : 'text-gray-400'}`}>
                  {item === 'All' ? items.length : counts[item]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{error}</div>}

        {loading ? (
          <div key={filter} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl border border-white/5 bg-gray-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleItems.map(item => {
              const isReminded = reminders.includes(item.id);
              return (
                <div key={item.id} className="group rounded-xl border border-white/5 bg-gray-900/45 hover:bg-gray-900/70 hover:border-cyan-400/20 transition-all overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <img src={item.poster} alt={`${item.title} poster`} loading="lazy" className="w-20 h-28 object-cover rounded-lg bg-gray-800 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-md bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[10px] font-black uppercase text-cyan-300">{item.kind}</span>
                        <span className="text-xs text-gray-400">{daysUntil(item.date)}</span>
                      </div>
                      <h3 className="text-white font-bold leading-tight line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.meta}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {item.date}</span>
                        {item.time ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span> : null}
                        {item.provider ? <span>{item.provider}</span> : null}
                        {item.rating ? <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> {item.rating}</span> : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReminder(item.id)}
                      className={`self-start rounded-lg border p-2 transition-all ${
                        isReminded
                          ? 'bg-cyan-500 text-gray-950 border-cyan-400'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                      title={isReminded ? 'Reminder enabled' : 'Remind me'}
                    >
                      {isReminded ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-gray-900/40 py-20 text-center text-gray-400">
            No releases found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
