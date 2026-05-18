import React, { useEffect, useMemo } from 'react';
import Seo from '../components/Seo';
import editorialPicks from '../data/editorialPicks';
import { trendingMovies } from '../data/movies';
import { trendingAnime } from '../data/anime';
import { takeDaily } from '../lib/dailyRotation';

const posterBank = [...trendingMovies, ...trendingAnime].map(item => item.poster);

const platforms = ['Netflix', 'Amazon Prime', 'Crunchyroll', 'Hulu', 'Disney+', 'JioCinema', 'Apple TV+'];

function platformForGenre(genre: string, index: number): string {
  if (genre === 'Anime') return 'Crunchyroll';
  if (genre === 'Korean') return 'Netflix';
  if (genre === 'Bollywood' || genre === 'Indian' || genre === 'Telugu') return index % 2 === 0 ? 'JioCinema' : 'Amazon Prime';
  if (genre === 'Sci-Fi') return index % 2 === 0 ? 'Disney+' : 'Netflix';
  return platforms[index % platforms.length];
}

export default function WeeklyPicks() {
  const weekly = useMemo(
    () => takeDaily(editorialPicks, 5, 5).map((pick, index) => ({
      id: `weekly-${pick.id}`,
      title: pick.title,
      reason: pick.editorNote.slice(0, 120).replace(/\s+$/u, '') + '...',
      platform: platformForGenre(pick.genre, index),
      poster: posterBank[(index + 3) % posterBank.length],
    })),
    [],
  );

  useEffect(() => {
    document.title = 'Weekly Picks | CineVerse AI';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Our five highlighted picks of the week with short reasons to watch and where to stream.');
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
      <Seo title="Weekly Picks | CineVerse AI" description="Five highlighted picks of the week with short reasons to watch and where to stream." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-4">Weekly Picks</h1>
        <div className="grid grid-cols-1 gap-6">
          {weekly.map(w => (
            <div key={w.id} className="rounded-xl bg-gray-900 border border-white/5 p-4 flex items-center gap-4 shadow-lg shadow-black/20">
              <div className="w-20 h-28 rounded overflow-hidden shrink-0 border border-white/5">
                <img src={w.poster} alt={`${w.title} poster`} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-white font-bold">{w.title}</h2>
                <p className="text-gray-300 text-sm mt-1">{w.reason}</p>
                <p className="text-gray-500 text-xs mt-2">Where: <span className="text-cyan-300 font-semibold">{w.platform}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
