import React, { useEffect, useMemo } from 'react';
import editorialPicks from '../data/editorialPicks';
import { trendingMovies } from '../data/movies';
import { trendingAnime } from '../data/anime';
import Seo from '../components/Seo';
import { takeDaily } from '../lib/dailyRotation';

const posterBank = [...trendingMovies, ...trendingAnime].map(item => item.poster);

const genreAccent: Record<string, string> = {
  'Sci-Fi': 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  Korean: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
  Anime: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
  Bollywood: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  Telugu: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  Indian: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
};

const posterForIndex = (index: number) => posterBank[index % posterBank.length];

export default function EditorialPicks() {
  const picks = useMemo(
    () => takeDaily(editorialPicks, 9).map((pick, index) => ({
      ...pick,
      poster: posterForIndex(index),
      accent: genreAccent[pick.genre] || 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    })),
    [],
  );

  useEffect(() => {
    document.title = 'Editorial Picks | CineVerse AI';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Editor-curated picks across global cinema — original opinions and recommendations from CineVerse editors.');
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
      <Seo title="Editorial Picks | CineVerse AI" description="Editor-curated picks across global cinema — original opinions and recommendations from CineVerse editors." />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-4">Editorial Picks</h1>
        <p className="text-gray-400 mb-6">Original, opinionated recommendations from CineVerse editors — a rotating collection of global cinema.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {picks.map(pick => (
            <article key={pick.id} className="rounded-xl bg-gray-900 border border-white/5 overflow-hidden shadow-lg shadow-black/20">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img src={pick.poster} alt={`${pick.title} poster`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] bg-gray-950/70 backdrop-blur-md text-white border-white/10">
                  <span className={`px-2 py-0.5 rounded border ${pick.accent}`}>{pick.genre}</span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-white font-bold text-lg leading-tight">
                  {pick.title} <span className="text-gray-400 text-sm">({pick.year})</span>
                </h2>
                <div className="mt-2 text-sm text-gray-300 line-clamp-3">{pick.editorNote}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="inline-block bg-amber-400 text-gray-950 px-2 py-1 rounded font-semibold text-sm">{pick.rating}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-[0.16em]">Rotates daily</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
