import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import SectionHeader from './SectionHeader';
import type { TvAiringRow } from '../types';
import { episodeAirTimestamp } from '../lib/tvmazeMap';

interface Props {
  rows: TvAiringRow[];
  loading?: boolean;
  error?: string | null;
  limit?: number;
}

export default function UpcomingEpisodesSection({
  rows,
  loading,
  error,
  limit = 14,
}: Props) {
  const now = Date.now() - 45 * 60 * 1000;
  const upcoming = rows
    .filter(r => {
      const ts = episodeAirTimestamp(r.episode);
      return ts !== null && ts >= now;
    })
    .slice(0, limit);

  return (
    <section>
      <SectionHeader
        title="Upcoming episodes"
        subtitle="Next premieres pulled from this week’s broadcast & web calendars"
        accent="emerald"
        icon={<CalendarDays className="w-5 h-5" />}
      />

      {error && (
        <p className="text-amber-400/90 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-gray-900/40 px-6 py-10 text-center text-gray-500 text-sm">
          No upcoming episodes with timestamps found in the loaded window.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {upcoming.map(row => {
            const ts = episodeAirTimestamp(row.episode);
            const when =
              ts !== null
                ? new Intl.DateTimeFormat(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(ts))
                : row.episode.airdate ?? 'TBA';

            return (
              <Link
                key={`${row.show.id}-${row.episode.id}-up`}
                to={`/tv/${row.show.id}`}
                className="flex gap-3 p-4 rounded-xl border border-white/10 bg-gray-900/40 hover:border-emerald-400/25 hover:bg-emerald-400/[0.06] transition-colors text-left"
              >
                <img
                  src={row.episode.imageMedium || row.show.poster}
                  alt=""
                  className="w-16 h-24 object-cover rounded-lg border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-emerald-400 text-[11px] font-semibold uppercase tracking-wide">{when}</p>
                  <p className="text-white font-semibold text-sm mt-1 line-clamp-2">{row.show.title}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {row.episode.name}
                    <span className="text-gray-600 mx-1">·</span>
                    {row.source === 'broadcast' ? 'TV' : 'Web'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
