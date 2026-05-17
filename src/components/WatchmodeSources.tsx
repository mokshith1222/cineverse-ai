import React, { useEffect, useState } from 'react';
import { fetchWatchmodeSources, WatchmodeSource } from '../lib/watchmode';
import { MonitorPlay, ExternalLink, Info, Loader2 } from 'lucide-react';

interface Props {
  imdbId: string;
  title: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Netflix': 'bg-[#E50914]',
  'Prime Video': 'bg-[#00A8E1]',
  'Disney+': 'bg-[#006E99]',
  'Hulu': 'bg-[#1CE783] text-gray-950',
  'HBO Max': 'bg-[#743AD5]',
  'Apple TV+': 'bg-[#000000]',
  'Paramount+': 'bg-[#0064FF]',
  'Peacock': 'bg-[#000000]',
};

const WatchmodeSources: React.FC<Props> = ({ imdbId }) => {
  const [sources, setSources] = useState<WatchmodeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchWatchmodeSources(imdbId)
      .then(data => {
        if (!cancelled) {
          setSources(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imdbId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4 text-gray-500 text-sm animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        Checking streaming availability...
      </div>
    );
  }

  if (error || sources.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4 px-4 bg-gray-900/50 border border-white/5 rounded-xl text-gray-500 text-xs italic">
        <Info className="w-4 h-4 opacity-50" />
        No streaming sources found for this title in your region.
      </div>
    );
  }

  // Group by type (sub, rent, buy)
  const subscription = sources.filter(s => s.type === 'sub');
  const purchase = sources.filter(s => s.type === 'rent' || s.type === 'buy');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <MonitorPlay className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Where to Stream</h3>
      </div>

      <div className="grid gap-4">
        {subscription.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Subscription</p>
            <div className="flex flex-wrap gap-2">
              {subscription.map(source => (
                <a
                  key={`${source.source_id}-${source.name}`}
                  href={source.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 transition-all hover:scale-105 active:scale-95 ${
                    PLATFORM_COLORS[source.name] || 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold text-inherit">{source.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}

        {purchase.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Rent / Buy</p>
            <div className="flex flex-wrap gap-2">
              {purchase.map(source => (
                <a
                  key={`${source.source_id}-${source.name}`}
                  href={source.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 border border-white/10 rounded-lg text-gray-300 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="text-xs font-semibold">{source.name}</span>
                  <span className="text-[10px] opacity-50 bg-white/10 px-1 rounded uppercase">{source.type}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-600 italic">
        Data provided by Watchmode. Availability may vary by region.
      </p>
    </div>
  );
};

export default WatchmodeSources;
