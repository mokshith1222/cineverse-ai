import React, { useEffect } from 'react';
import editorialPicks from '../data/editorialPicks';
import Seo from '../components/Seo';

export default function EditorialPicks() {
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
          {editorialPicks.map(pick => (
            <article key={pick.id} className="rounded-xl bg-gray-900 border border-white/5 p-4">
              <div className="w-full h-48 bg-gray-800 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                <img src={`https://via.placeholder.com/300x450?text=${encodeURIComponent(pick.title)}`} alt={`${pick.title} poster`} loading="lazy" className="object-cover w-full h-full" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{pick.title} <span className="text-gray-400 text-sm">({pick.year})</span></h2>
                <div className="mt-2 text-sm text-gray-300">{pick.editorNote}</div>
                <div className="mt-3">
                  <span className="inline-block bg-amber-400 text-gray-950 px-2 py-1 rounded font-semibold">{pick.rating}</span>
                  <span className="ml-2 text-xs text-gray-500">{pick.genre}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
