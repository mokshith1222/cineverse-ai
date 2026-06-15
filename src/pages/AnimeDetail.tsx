import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clapperboard,
  ExternalLink,
  Loader2,
  Sparkles,
  Star,
  Tv,
  Users,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import AnimeDetailSkeleton from '../components/AnimeDetailSkeleton';
import AnimeGridSkeleton from '../components/AnimeGridSkeleton';
import {
  JikanApiError,
  fetchAnimeFull,
  fetchAnimeRecommendations,
} from '../lib/jikan';
import type { JikanAnimeFull } from '../lib/jikanTypes';
import { mapJikanAnime } from '../lib/jikanMap';
import type { Anime } from '../types';
import { useWatchlist } from '../contexts/WatchlistContext';
import Seo from '../components/Seo';

function cleanSynopsis(text: string) {
  return text.replace(/\(Source:.*?\)/gis, '').replace(/\[Written by.*?\]/gi, '').trim();
}

export default function AnimeDetail() {
  const { malId: malIdParam } = useParams<{ malId: string }>();
  const malId = malIdParam ? parseInt(malIdParam, 10) : NaN;

  const [detail, setDetail] = useState<JikanAnimeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recs, setRecs] = useState<Anime[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState<string | null>(null);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    if (!Number.isFinite(malId)) {
      setLoading(false);
      setError('Invalid anime id.');
      setRecsLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAnimeFull(malId)
      .then(res => {
        if (!cancelled) setDetail(res.data);
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof JikanApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Could not load anime.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [malId]);

  useEffect(() => {
    if (!Number.isFinite(malId)) {
      setRecsLoading(false);
      return;
    }

    let cancelled = false;
    setRecsLoading(true);
    setRecsError(null);

    fetchAnimeRecommendations(malId)
      .then(res => {
        if (cancelled) return;
        const mapped = res.data.map(r => mapJikanAnime(r.entry));
        setRecs(mapped);
      })
      .catch(err => {
        if (!cancelled) {
          setRecs([]);
          setRecsError(
            err instanceof JikanApiError
              ? err.message
              : 'Recommendations unavailable right now.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setRecsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [malId]);

  const cardAnime = useMemo(() => (detail ? mapJikanAnime(detail) : null), [detail]);

  const backdrop =
    detail?.images?.jpg?.large_image_url ||
    detail?.images?.jpg?.image_url ||
    '';

  const embedSrc = useMemo(() => {
    const e = detail?.trailer?.embed_url;
    if (e) return e;
    const yid = detail?.trailer?.youtube_id;
    return yid ? `https://www.youtube.com/embed/${yid}?rel=0&modestbranding=1` : null;
  }, [detail]);

  const isBookmarked = detail ? isInWatchlist(detail.mal_id.toString(), 'anime') : false;

  const handleWatchlistToggle = async () => {
    if (!detail || !cardAnime) return;
    if (isBookmarked) {
      await removeFromWatchlist(detail.mal_id.toString(), 'anime');
    } else {
      await addToWatchlist({
        item_id: detail.mal_id.toString(),
        title: cardAnime.title,
        poster_url: cardAnime.poster,
        item_type: 'anime',
      });
    }
  };

  if (!Number.isFinite(malId)) {
    return (
      <div className="bg-gray-950 min-h-screen pt-24 px-4 text-center">
        <p className="text-gray-400 mb-4">That anime link looks invalid.</p>
        <Link to="/anime" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
          Back to anime
        </Link>
      </div>
    );
  }

  if (loading) {
    return <AnimeDetailSkeleton />;
  }

  if (error || !detail || !cardAnime) {
    return (
      <div className="bg-gray-950 min-h-screen pt-24 px-4 max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-300/90 text-sm">{error ?? 'Anime not found.'}</p>
        <Link
          to="/anime"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-gray-950 text-sm font-semibold transition-colors"
        >
          Browse anime
        </Link>
      </div>
    );
  }

  const synopsis = cleanSynopsis(detail.synopsis ?? '');

  return (
    <div className="bg-gray-950 min-h-screen pt-16">
      <Seo
        title={`${cardAnime.title} | Anime Trailer, Status & Info - CineVerse AI`}
        description={`Find info about ${cardAnime.title} on CineVerse AI. Status: ${cardAnime.status}. Rating: ${cardAnime.rating}/10. Genre: ${cardAnime.genre.join(', ') || 'N/A'}. Synopsis: ${synopsis.slice(0, 150)}...`}
        image={cardAnime.poster}
        url={`https://cineverse-ai-gules.vercel.app/anime/${detail.mal_id}`}
        type="video.other"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          'name': cardAnime.title,
          'image': cardAnime.poster,
          'description': synopsis,
          'genre': cardAnime.genre,
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
            to="/anime"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to anime
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="shrink-0 w-full max-w-xs mx-auto lg:mx-0">
              <img
                src={cardAnime.poster}
                alt={cardAnime.title}
                className="w-full rounded-2xl border border-white/10 shadow-2xl shadow-black/50 object-cover aspect-[2/3]"
              />
              <button
                onClick={handleWatchlistToggle}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all transform active:scale-95 ${
                  isBookmarked
                    ? 'bg-orange-500/10 border border-orange-500/50 text-orange-400'
                    : 'bg-orange-500 text-gray-950 hover:bg-orange-400'
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
              {detail.url && (
                <a
                  href={detail.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open on MyAnimeList
                </a>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-5">

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-400/10 border border-orange-400/25 px-2 py-1 rounded-lg">
                  <Tv className="w-3.5 h-3.5" />
                  Anime
                </span>
                {detail.rating && detail.rating !== 'N/A' && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {detail.rating}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {cardAnime.title}
                </h1>
                {detail.title_japanese && (
                  <p className="text-gray-400 text-sm mt-2">{detail.title_japanese}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {cardAnime.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {cardAnime.rating}
                    <span className="text-gray-400 font-normal">/10</span>
                  </span>
                )}
                {typeof detail.scored_by === 'number' && detail.scored_by > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {detail.scored_by.toLocaleString()} votes
                  </span>
                )}
                {typeof detail.rank === 'number' && detail.rank > 0 && (
                  <span className="text-gray-400">Rank #{detail.rank}</span>
                )}
                <span className="inline-flex items-center gap-1.5 text-orange-300">
                  <Sparkles className="w-4 h-4" />
                  {cardAnime.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                {detail.aired?.string && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {detail.aired.string}
                  </span>
                )}
                {detail.broadcast?.string && detail.broadcast.string !== 'Unknown' && (
                  <span>{detail.broadcast.string}</span>
                )}
                {detail.duration && detail.duration !== 'Unknown' && (
                  <span>{detail.duration}</span>
                )}
              </div>

              {cardAnime.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cardAnime.genre.map(g => (
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
                <div>
                  <dt className="text-gray-400 mb-1">Episodes</dt>
                  <dd className="text-white">{cardAnime.episodes > 0 ? cardAnime.episodes : 'TBA'}</dd>
                </div>
                {detail.studios && detail.studios.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 mb-1">Studios</dt>
                    <dd className="text-white">{detail.studios.map(s => s.name).join(', ')}</dd>
                  </div>
                )}
              </dl>

              <p className="text-xs text-gray-400 font-mono">MAL ID: {detail.mal_id}</p>
            </div>
          </div>

          <section className="mt-14 pt-10 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clapperboard className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-black text-white tracking-tight">Trailer</h2>
            </div>
            {embedSrc ? (
              <div className="max-w-4xl aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-xl shadow-black/40">
                <iframe
                  className="w-full h-full"
                  src={embedSrc}
                  title={`Trailer: ${cardAnime.title}`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="max-w-4xl rounded-xl border border-white/10 bg-gray-900/50 px-6 py-10 text-center text-gray-400 text-sm">
                No trailer is linked on MyAnimeList for this title yet.
              </div>
            )}
          </section>

          <section className="mt-14 pt-10 border-t border-white/10">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Recommendations</h2>
                <p className="text-gray-400 text-sm mt-1">Powered by Jikan — cached to reduce API calls.</p>
              </div>
              {recsLoading && (
                <span className="inline-flex items-center gap-2 text-gray-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                  Loading picks…
                </span>
              )}
            </div>

            {recsError && (
              <p className="text-amber-400/90 text-sm mb-4">{recsError}</p>
            )}

            {recsLoading ? (
              <AnimeGridSkeleton count={6} />
            ) : recs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {recs.map(a => (
                  <AnimeCard key={a.id} anime={a} />
                ))}
              </div>
            ) : (
              !recsError && (
                <p className="text-gray-400 text-sm">No recommendations returned for this entry.</p>
              )
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
