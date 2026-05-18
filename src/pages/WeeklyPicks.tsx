import React, { useEffect } from 'react';
import Seo from '../components/Seo';

const weekly = [
  { id: 'w1', title: 'Interstellar', reason: 'Stellar visuals and a moving human core.', platform: 'Netflix' },
  { id: 'w2', title: 'RRR', reason: 'Spectacular set pieces and joyous energy.', platform: 'Amazon Prime' },
  { id: 'w3', title: 'Your Name', reason: 'A beautifully crafted emotional rom-com with mystery.', platform: 'Crunchyroll' },
  { id: 'w4', title: 'Train to Busan', reason: 'High-octane, emotional zombie thriller.', platform: 'Netflix' },
  { id: 'w5', title: 'A Silent Voice', reason: 'A sensitive meditation on youth and forgiveness.', platform: 'Hulu' },
];

export default function WeeklyPicks() {
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
            <div key={w.id} className="rounded-xl bg-gray-900 border border-white/5 p-4 flex items-center gap-4">
              <div className="w-20 h-28 bg-gray-800 rounded overflow-hidden">
                <img src={`https://via.placeholder.com/150x220?text=${encodeURIComponent(w.title)}`} alt={`${w.title} poster`} loading="lazy" className="w-full h-full object-cover" />
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
