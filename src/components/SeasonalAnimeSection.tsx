import { CalendarDays } from 'lucide-react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import AnimeGridSkeleton from './AnimeGridSkeleton';
import type { Anime } from '../types';

interface Props {
  anime: Anime[];
  loading?: boolean;
  error?: string | null;
  subtitle?: string;
  onViewAll?: () => void;
}

export default function SeasonalAnimeSection({
  anime,
  loading,
  error,
  onViewAll,
  subtitle = 'Currently airing titles from this anime season',
}: Props) {
  return (
    <section>
      <SectionHeader
        title="Seasonal Anime"
        subtitle={subtitle}
        viewAllTo={onViewAll ? undefined : "/anime"}
        onViewAll={onViewAll}
        accent="orange"
        icon={<CalendarDays className="w-5 h-5" />}
      />

      {error && (
        <p className="text-amber-400/90 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <AnimeGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {anime.slice(0, 6).map(item => (
            <AnimeCard key={item.id} anime={item} />
          ))}
        </div>
      )}
    </section>
  );
}
