import { Zap } from 'lucide-react';
import AnimeCard from './AnimeCard';
import SectionHeader from './SectionHeader';
import AnimeGridSkeleton from './AnimeGridSkeleton';
import type { Anime } from '../types';

interface Props {
  anime: Anime[];
  loading?: boolean;
  error?: string | null;
  onViewAll?: () => void;
}

export default function TrendingAnimeShowcase({ anime, loading, error, onViewAll }: Props) {
  return (
    <section>
      <SectionHeader
        title="Trending Anime"
        subtitle="Top titles by popularity on MyAnimeList (via Jikan)"
        viewAllTo={onViewAll ? undefined : "/anime"}
        onViewAll={onViewAll}
        accent="orange"
        icon={<Zap className="w-5 h-5" />}
      />

      {error && (
        <p className="text-amber-400/90 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <AnimeGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {anime.slice(0, 12).map((item, i) => (
            <AnimeCard key={item.id} anime={item} priority={i < 6} />
          ))}
        </div>
      )}
    </section>
  );
}
