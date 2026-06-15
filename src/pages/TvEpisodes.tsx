import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { TvMazeApiError, getShow, getShowEpisodes } from '../lib/tvmaze';
import { mapTvMazeEpisode, mapTvMazeShow } from '../lib/tvmazeMap';
import type { TvEpisode } from '../types';

function seasonSortKey(season: number): number {
  if (season === 0) return 9999;
  return season;
}

export default function TvEpisodes() {
  const { showId: sid } = useParams<{ showId: string }>();
  const showId = sid ? parseInt(sid, 10) : NaN;

  const [title, setTitle] = useState('');
  const [episodes, setEpisodes] = useState<TvEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(showId)) {
      setLoading(false);
      setError('Invalid show id.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getShow(showId), getShowEpisodes(showId)])
      .then(([showData, eps]) => {
        if (cancelled) return;
        setTitle(mapTvMazeShow(showData).title);
        setEpisodes(eps.map(mapTvMazeEpisode));
      })
      .catch(err => {
        if (!cancelled) {
          setEpisodes([]);
          setError(
            err instanceof TvMazeApiError ? err.message : 'Could not load episodes.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showId]);

  const bySeason = useMemo(() => {
    const map = new Map<number, TvEpisode[]>();
    for (const ep of episodes) {
      const s = typeof ep.season === 'number' ? ep.season : 0;
      const arr = map.get(s) ?? [];
      arr.push(ep);
      map.set(s, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const na = a.number ?? -1;
        const nb = b.number ?? -1;
        return na - nb;
      });
    }
    return [...map.entries()].sort((a, b) => seasonSortKey(a[0]) - seasonSortKey(b[0]));
  }, [episodes]);

  if (!Number.isFinite(showId)) {
    return (
      <div className="bg-gray-950 min-h-screen pt-24 px-4 text-center">
        <p className="text-gray-400 mb-4">Invalid episode guide URL.</p>
        <Link to="/tv" className="text-emerald-400 text-sm font-medium">
          Browse TV
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to={`/tv/${showId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to show
        </Link>

        <div className="border-b border-white/10 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title || 'Episode guide'}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Episode metadata from TVMaze — grouped by season.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-400 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            Loading episodes…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && bySeason.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12">No episodes listed for this show.</p>
        )}

        {!loading && !error && bySeason.length > 0 && (
          <div className="space-y-10">
            {bySeason.map(([season, eps]) => (
              <section key={season}>
                <h2 className="text-lg font-black text-emerald-400 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-400 rounded-full" />
                  {season === 0 ? 'Specials / extras' : `Season ${season}`}
                  <span className="text-gray-400 text-sm font-normal">({eps.length})</span>
                </h2>
                <div className="rounded-xl border border-white/10 divide-y divide-white/5 bg-gray-900/30 overflow-hidden">
                  {eps.map(ep => (
                    <EpisodeRow key={ep.id} episode={ep} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EpisodeRow({ episode }: { episode: TvEpisode }) {
  const numLabel =
    episode.number != null ? `E${episode.number}` : `#${episode.id}`;

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 py-4 hover:bg-white/[0.03]">
      <div className="shrink-0 w-full sm:w-28 flex flex-row sm:flex-col gap-2 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1 text-emerald-400/90 font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          {episode.airdate ?? 'TBA'}
        </span>
        {episode.airtime && episode.airtime.trim() !== '' && (
          <span>{episode.airtime}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-sm sm:text-base">
          <span className="text-gray-400 font-normal mr-2">{numLabel}</span>
          {episode.name}
        </p>
        {episode.summary ? (
          <p className="text-gray-400 text-xs sm:text-sm mt-2 line-clamp-3">{episode.summary}</p>
        ) : null}
      </div>
    </div>
  );
}
