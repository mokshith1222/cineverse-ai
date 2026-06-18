import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BookMarked, Clock, Star } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { WatchmodeTitleDetails, WatchmodeSourceListItem } from '../lib/watchmode';
import { getOptimizedImageUrl } from '../lib/imageOpt';

function titlePoster(title: WatchmodeTitleDetails): string {
  return title.posterMedium || title.posterLarge || title.poster || 'https://placehold.co/400x600/111827/6b7280/png?text=No+Poster';
}

function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
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

export default function OttContentSection({
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
          {titles.slice(0, 6).map((title, i) => {
            const badges = providerBadges(title, region, sourcesById);
            const href = title.type === 'movie' && title.imdb_id ? `/movies/${title.imdb_id}` : '/ott';
            const rating = title.user_rating ? Number(title.user_rating.toFixed(1)) : null;
            return (
              <Link
                key={title.id}
                to={href}
                className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 hover:scale-105 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <img src={getOptimizedImageUrl(titlePoster(title), 750)} alt={title.title} loading={i < 4 ? "eager" : "lazy"} fetchPriority={i < 4 ? "high" : "auto"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
        <div className="rounded-xl border border-white/5 bg-gray-900/40 p-6 text-sm text-gray-400">
          No Watchmode titles are available right now.
        </div>
      )}
    </section>
  );
}
