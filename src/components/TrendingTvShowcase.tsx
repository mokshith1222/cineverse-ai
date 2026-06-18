import { Flame } from 'lucide-react';
import TvCard from './TvCard';
import SectionHeader from './SectionHeader';
import TvGridSkeleton from './TvGridSkeleton';
import type { TvShow } from '../types';

interface Props {
  shows: TvShow[];
  loading?: boolean;
  error?: string | null;
}

export default function TrendingTvShowcase({ shows, loading, error }: Props) {
  return (
    <section>
      <SectionHeader
        title="Trending TV"
        subtitle="Shows airing today — broadcast & streaming (via TVMaze)"
        viewAllTo="/tv"
        accent="emerald"
        icon={<Flame className="w-5 h-5" />}
      />

      {error && (
        <p className="text-amber-400/90 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <TvGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {shows.slice(0, 12).map((show, i) => (
            <TvCard key={show.id} show={show} priority={i < 6} />
          ))}
        </div>
      )}
    </section>
  );
}
