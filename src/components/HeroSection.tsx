import { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';

export interface FeaturedHeroItem {
  id: string | number;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  genre: string[];
  description: string;
  duration?: string;
  href: string;
  browseHref: string;
  browseLabel: string;
  label: string;
}

interface Props {
  movies?: Movie[];
  items?: FeaturedHeroItem[];
  loading?: boolean;
}

function movieToHeroItem(movie: Movie): FeaturedHeroItem {
  return {
    id: movie.id,
    title: movie.title,
    poster: movie.poster,
    backdrop: movie.backdrop || movie.poster,
    rating: movie.rating,
    year: movie.year,
    genre: movie.genre,
    description: movie.description,
    duration: movie.duration,
    href: movie.imdbID ? `/movies/${movie.imdbID}` : '/movies',
    browseHref: '/movies',
    browseLabel: 'Browse movies',
    label: 'Trending Movie',
  };
}

export default function HeroSection({ movies = [], items, loading = false }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const heroItems = (items ?? movies.map(movieToHeroItem)).slice(0, 5);
  const len = heroItems.length;

  const goTo = (index: number) => {
    if (animating || len === 0) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  };

  useEffect(() => {
    if (len === 0) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % len);
    }, 6000);
    return () => clearInterval(timer);
  }, [len]);

  useEffect(() => {
    if (current >= len) setCurrent(0);
  }, [current, len]);

  if (loading && len === 0) {
    return (
      <div className="relative h-screen min-h-[600px] overflow-hidden bg-gray-950 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  if (len === 0) {
    return (
      <div className="relative h-[50vh] min-h-[320px] overflow-hidden bg-gray-900 flex items-center justify-center border-b border-white/5">
        <p className="text-gray-400 text-sm px-6 text-center">Featured titles will appear here once OMDb loads.</p>
      </div>
    );
  }

  const item = heroItems[current];

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Backdrop */}
      {heroItems.map((m, i) => (
        <div
          key={String(m.id)}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <picture>
            <source srcSet={`${m.backdrop}?format=webp`} type="image/webp" />
            <img 
              src={m.backdrop} 
              alt={m.title} 
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover" 
            />
          </picture>
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`max-w-xl transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {/* Trending badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">{item.label}</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight mb-3">
              {item.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {item.rating > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">{item.rating}</span>
                  </div>
                  <span className="text-gray-400">|</span>
                </>
              )}
              {item.year > 0 && <span className="text-gray-400 text-sm">{item.year}</span>}
              {item.duration ? (
                <>
                  <span className="text-gray-400">|</span>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {item.duration}
                  </div>
                </>
              ) : null}
            </div>

            {/* Genres */}
            {item.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.genre.map(g => (
                  <span key={g} className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
              {item.description || 'Discover plot, cast, and more on the movie page.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={item.href}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30 text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                View details
              </Link>
              <Link
                to={item.browseHref}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm backdrop-blur-sm"
              >
                <Info className="w-4 h-4" />
                {item.browseLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {len > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous Slide"
            onClick={() => goTo((current - 1 + len) % len)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gray-950/60 hover:bg-gray-950/80 border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            onClick={() => goTo((current + 1) % len)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gray-950/60 hover:bg-gray-950/80 border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {len > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroItems.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="w-10 h-10 flex items-center justify-center group"
            >
              <div
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-8 h-2 bg-cyan-400' : 'w-2 h-2 bg-white/30 group-hover:bg-white/50'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
