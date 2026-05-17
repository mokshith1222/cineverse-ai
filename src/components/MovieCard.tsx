import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Play, Bookmark } from 'lucide-react';
import { Movie } from '../types';
import { OMDB_FALLBACK_POSTER } from '../lib/omdb';

interface Props {
  movie: Movie;
  featured?: boolean;
}

export default function MovieCard({ movie, featured = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [posterSrc, setPosterSrc] = useState(movie.poster || OMDB_FALLBACK_POSTER);

  const detailHref = movie.imdbID ? `/movies/${movie.imdbID}` : null;

  return (
    <div
      className={`relative group rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 ${
        featured ? 'aspect-[2/3]' : 'aspect-[2/3]'
      } ${detailHref ? 'cursor-pointer' : 'cursor-default'} ${
        hovered ? 'scale-[1.03] shadow-2xl shadow-cyan-500/20 z-10 border-cyan-400/25' : 'scale-100'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={posterSrc}
        alt={movie.title}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (posterSrc !== OMDB_FALLBACK_POSTER) {
            console.warn('[MovieCard] Poster failed, using fallback', { title: movie.title, poster: posterSrc });
            setPosterSrc(OMDB_FALLBACK_POSTER);
          }
        }}
        className="relative z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {detailHref && (
        <Link
          to={detailHref}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${movie.title}`}
        />
      )}

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-[11] bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

      {/* Rating badge */}
      {movie.rating > 0 && (
        <div className="pointer-events-none absolute top-2 left-2 z-[12] flex items-center gap-1 bg-gray-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-semibold">{movie.rating}</span>
        </div>
      )}

      {/* Bookmark */}
      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setBookmarked(!bookmarked);
        }}
        aria-label={bookmarked ? `Remove ${movie.title} bookmark` : `Bookmark ${movie.title}`}
        className="absolute top-2 right-2 z-[20] w-8 h-8 bg-gray-950/80 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-cyan-400/20 hover:border-cyan-400/30"
      >
        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-cyan-400 text-cyan-400' : 'text-gray-400'}`} />
      </button>

      {/* Content */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        {movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {movie.genre.slice(0, 2).map(g => (
              <span key={g} className="text-xs px-1.5 py-0.5 bg-cyan-400/15 text-cyan-300 rounded border border-cyan-400/20">
                {g}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-white text-sm font-semibold leading-tight mb-1 line-clamp-2">{movie.title}</h3>
        {(movie.year > 0 || movie.duration) && (
          <div className="flex items-center gap-2 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {movie.year > 0 && <span>{movie.year}</span>}
            {movie.year > 0 && movie.duration ? (
              <>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <Clock className="w-3 h-3" />
                <span>{movie.duration}</span>
              </>
            ) : movie.duration ? (
              <>
                <Clock className="w-3 h-3" />
                <span>{movie.duration}</span>
              </>
            ) : null}
          </div>
        )}
        {detailHref ? (
          <span className="pointer-events-none mt-2 w-full flex items-center justify-center gap-1.5 bg-cyan-500 group-hover:bg-cyan-400 text-gray-950 text-xs font-bold py-1.5 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
            <Play className="w-3 h-3 fill-current" />
            Details
          </span>
        ) : (
          <span className="pointer-events-none mt-2 w-full flex items-center justify-center gap-1.5 bg-cyan-500 group-hover:bg-cyan-400 text-gray-950 text-xs font-bold py-1.5 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
            <Play className="w-3 h-3 fill-current" />
            Watch Trailer
          </span>
        )}
      </div>
    </div>
  );
}
