import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Bookmark, Tv } from 'lucide-react';
import { Anime } from '../types';

interface Props {
  anime: Anime;
}

export default function AnimeCard({ anime }: Props) {
  const [hovered, setHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const detailHref = `/anime/${anime.id}`;
  const epsLabel = anime.episodes > 0 ? `${anime.episodes} eps` : 'Eps TBD';

  return (
    <div
      className={`relative group rounded-xl overflow-hidden transition-all duration-300 aspect-[2/3] cursor-pointer ${
        hovered ? 'scale-105 shadow-2xl shadow-orange-500/20 z-10' : 'scale-100'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={anime.poster}
        alt={anime.title}
        className="relative z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <Link
        to={detailHref}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${anime.title}`}
      />

      <div className="pointer-events-none absolute inset-0 z-[11] bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

      {anime.rating > 0 && (
        <div className="pointer-events-none absolute top-2 left-2 z-[12] flex items-center gap-1 bg-gray-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-semibold">{anime.rating}</span>
        </div>
      )}

      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setBookmarked(!bookmarked);
        }}
        className="absolute top-2 right-2 z-[20] w-8 h-8 bg-gray-950/80 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-orange-400/20 hover:border-orange-400/30"
      >
        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-orange-400 text-orange-400' : 'text-gray-400'}`} />
      </button>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        {anime.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {anime.genre.slice(0, 2).map(g => (
              <span key={g} className="text-xs px-1.5 py-0.5 bg-orange-400/15 text-orange-300 rounded border border-orange-400/20">
                {g}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-white text-sm font-semibold leading-tight mb-1 line-clamp-2">{anime.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {anime.year > 0 && <span>{anime.year}</span>}
          {anime.year > 0 && <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0" />}
          <span className="text-orange-300/90 whitespace-nowrap">{anime.status}</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0" />
          <Tv className="w-3 h-3 shrink-0" />
          <span>{epsLabel}</span>
        </div>
        <span className="pointer-events-none mt-2 w-full flex items-center justify-center gap-1.5 bg-orange-500 group-hover:bg-orange-400 text-gray-950 text-xs font-bold py-1.5 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
          <Play className="w-3 h-3 fill-current" />
          Details
        </span>
      </div>
    </div>
  );
}
