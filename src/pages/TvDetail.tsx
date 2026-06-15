import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Layers,
  MonitorPlay,
  Star,
  Tv,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import TvDetailSkeleton from '../components/TvDetailSkeleton';
import { TvMazeApiError, getShow } from '../lib/tvmaze';
import type { TvMazeShow } from '../lib/tvmazeTypes';
import { mapTvMazeShow, stripHtml } from '../lib/tvmazeMap';
import type { TvShow } from '../types';
import { useWatchlist } from '../contexts/WatchlistContext';
import WatchmodeSources from '../components/WatchmodeSources';
import Seo from '../components/Seo';

export default function TvDetail() {
  const { showId: sid } = useParams<{ showId: string }>();
  const showId = sid ? parseInt(sid, 10) : NaN;

  const [raw, setRaw] = useState<TvMazeShow | null>(null);
  const [card, setCard] = useState<TvShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    if (!Number.isFinite(showId)) {
      setLoading(false);
      setError('Invalid show id.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getShow(showId)
      .then(data => {
        if (!cancelled) {
          setRaw(data);
          setCard(mapTvMazeShow(data));
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof TvMazeApiError ? err.message : 'Could not load TV show.',
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

  const isBookmarked = raw ? isInWatchlist(raw.id.toString(), 'tv') : false;

  const handleWatchlistToggle = async () => {
    if (!raw || !card) return;
    if (isBookmarked) {
      await removeFromWatchlist(raw.id.toString(), 'tv');
    } else {
      await addToWatchlist({
        item_id: raw.id.toString(),
        title: card.title,
        poster_url: card.poster,
        item_type: 'tv',
      });
    }
  };

  if (!Number.isFinite(showId)) {
    return (
      <div className="bg-gray-950 min-h-screen pt-24 px-4 text-center">
        <p className="text-gray-400 mb-4">Invalid TV show URL.</p>
        <Link to="/tv" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
          Browse TV
        </Link>
      </div>
    );
  }

  if (loading) return <TvDetailSkeleton />;

  if (error || !raw || !card) {
    return (
      <div className="bg-gray-950 min-h-screen pt-24 px-4 max-w-lg mx-auto text-center space-y-4">
        <p className="text-red-300/90 text-sm">{error ?? 'Show not found.'}</p>
        <Link
          to="/tv"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-semibold transition-colors"
        >
          Back to TV
        </Link>
      </div>
    );
  }

  const synopsis = stripHtml(raw.summary ?? '');
  const backdrop =
    raw.image?.original || raw.image?.medium || card.backdrop;

  return (
    <div className="bg-gray-950 min-h-screen pt-16">
      <Seo
        title={`${card.title} (TV Series) | Guide, Stream & Info - CineVerse AI`}
        description={`Find where to stream ${card.title} (TV Series) online. Premiered: ${card.year || 'N/A'}. Rating: ${card.rating}/10. Genre: ${card.genre.join(', ') || 'N/A'}. Synopsis: ${synopsis.slice(0, 150)}...`}
        image={card.poster}
        url={`https://cineverse-ai-gules.vercel.app/tv/${raw.id}`}
        type="video.tv_show"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'TVSeries',
          'name': card.title,
          'image': card.poster,
          'description': synopsis,
          'genre': card.genre,
        }}
      />
      <div className="relative border-b border-white/5 overflow-hidden">
        {backdrop && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 blur-sm opacity-35"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/90 to-gray-950/75" />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/tv"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to TV
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="shrink-0 w-full max-w-xs mx-auto lg:mx-0 space-y-4">
              <img
                src={card.poster}
                alt={card.title}
                className="w-full rounded-2xl border border-white/10 shadow-2xl shadow-black/50 object-cover aspect-[2/3]"
              />
              <button
                onClick={handleWatchlistToggle}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all transform active:scale-95 ${
                  isBookmarked
                    ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400'
                    : 'bg-emerald-500 text-gray-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-5 h-5 fill-current" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5" />
                    Add to Watchlist
                  </>
                )}
              </button>
              <div className="flex flex-col gap-2">

                <Link
                  to={`/tv/${showId}/episodes`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-semibold transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  Episode guide
                </Link>
                {raw.url && (
                  <a
                    href={raw.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    TVMaze page
                  </a>
                )}
              </div>

              {raw.externals?.imdb && (
                <div className="pt-6 border-t border-white/5">
                  <WatchmodeSources imdbId={raw.externals.imdb} title={raw.name} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2 py-1 rounded-lg">
                  <Tv className="w-3.5 h-3.5" />
                  TV series
                </span>
                {raw.status && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {raw.status}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">{card.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {card.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {card.rating}
                    <span className="text-gray-400 font-normal">/10</span>
                  </span>
                )}
                {card.year > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400/80" />
                    Premiered {card.year}
                  </span>
                )}
                {typeof card.runtimeMinutes === 'number' && card.runtimeMinutes > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400/80" />
                    ~{card.runtimeMinutes}m / episode
                  </span>
                )}
              </div>

              {card.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {card.genre.map(g => (
                    <span
                      key={g}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl whitespace-pre-line">
                {synopsis || 'No synopsis available.'}
              </p>

              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                {(card.network || raw.officialSite) && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 mb-1">Where to watch</dt>
                    <dd className="text-white flex flex-wrap gap-3 items-center">
                      {card.network && <span>{card.network}</span>}
                      {raw.officialSite && (
                        <a
                          href={raw.officialSite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                        >
                          Official site
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <MonitorPlay className="w-3.5 h-3.5 text-emerald-500/80" />
                TVMaze ID: {raw.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
