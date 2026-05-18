import { Link } from 'react-router-dom';
import { CalendarClock, Radio, Tv } from 'lucide-react';
import SectionHeader from './SectionHeader';
import type { TvAiringRow } from '../types';

interface Props {
  title?: string;
  subtitle?: string;
  rows: TvAiringRow[];
  loading?: boolean;
  error?: string | null;
}

export default function TvScheduleSection({
  title = 'Airing schedule',
  subtitle = 'Tonight’s episodes on broadcast TV & streaming premieres',
  rows,
  loading,
  error,
}: Props) {
  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} accent="emerald" icon={<Radio className="w-5 h-5" />} />

      {error && (
        <p className="text-amber-400/90 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-900 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-gray-900/40 px-6 py-12 text-center text-gray-500 text-sm">
          No episodes scheduled for this day in TVMaze’s feed.
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5 bg-gray-900/30">
          {rows.map(row => (
            <div
              key={`${row.show.id}-${row.episode.id}-${row.source}`}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <img
                  src={row.show.poster}
                  alt={`${row.show.title} poster`}
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-20 object-cover rounded-lg border border-white/10 shrink-0 hidden sm:block"
                />
                <div className="min-w-0">
                  <Link
                    to={`/tv/${row.show.id}`}
                    className="text-white font-semibold text-sm sm:text-base hover:text-emerald-400 transition-colors line-clamp-1"
                  >
                    {row.show.title}
                  </Link>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">
                    {row.episode.season ? `S${row.episode.season}` : 'S?'}{' '}
                    {row.episode.number != null ? `E${row.episode.number}` : ''}
                    <span className="text-gray-600 mx-1">·</span>
                    {row.episode.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] sm:text-xs text-gray-500">
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        row.source === 'broadcast'
                          ? 'border-emerald-400/25 text-emerald-300 bg-emerald-400/10'
                          : 'border-cyan-400/25 text-cyan-300 bg-cyan-400/10'
                      }`}
                    >
                      {row.source === 'broadcast' ? 'Broadcast' : 'Streaming'}
                    </span>
                    {row.episode.airtime && row.episode.airtime.trim() !== '' && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 text-emerald-400/80" />
                        {row.episode.airtime}
                      </span>
                    )}
                    {row.episode.airdate && (
                      <span>{row.episode.airdate}</span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to={`/tv/${row.show.id}/episodes`}
                className="shrink-0 self-start sm:self-center text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-400/25 hover:bg-emerald-400/10 transition-colors inline-flex items-center gap-1"
              >
                <Tv className="w-3.5 h-3.5" />
                Episodes
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
