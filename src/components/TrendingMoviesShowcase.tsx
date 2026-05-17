import { TrendingUp } from 'lucide-react';
import MovieCard from './MovieCard';
import SectionHeader from './SectionHeader';
import type { Movie } from '../types';

interface Props {
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  subtitle?: string;
}

export default function TrendingMoviesShowcase({
  movies,
  loading,
  error,
  subtitle = 'Titles fetched live via OMDb',
}: Props) {
  return (
    <section>
      <SectionHeader
        title="Trending Movies"
        subtitle={subtitle}
        viewAllTo="/movies"
        accent="cyan"
        icon={<TrendingUp className="w-5 h-5" />}
      />

      {error && (
        <p className="text-amber-400/90 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-gray-900 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {movies.slice(0, 6).map(movie => (
            <MovieCard key={String(movie.id)} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
