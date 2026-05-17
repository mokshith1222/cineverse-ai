import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Film,
  Loader2,
  Maximize2,
  Play,
  Star,
  Users,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import TrailerModal from '../components/TrailerModal';
import { getMovieByImdbId, resolvePosterUrl } from '../lib/omdb';
import type { OmdbMovieDetail } from '../lib/omdbTypes';
import { fetchOfficialTrailerVideoId, youtubeSearchUrl } from '../lib/youtube';
import { useWatchlist } from '../contexts/WatchlistContext';
import WatchmodeSources from '../components/WatchmodeSources';

export default function MovieDetail() {
  const { imdbID } = useParams<{ imdbID: string }>();
  const [detail, setDetail] = useState<OmdbMovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    setTrailerModalOpen(false);
  }, [imdbID]);

  useEffect(() => {
    if (!imdbID) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMovieByImdbId(imdbID, 'full')
      .then(data => {
        if (!cancelled) setDetail(data);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load movie.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [imdbID]);

  useEffect(() => {
    if (!detail?.Title) return;

    let cancelled = false;
    setTrailerVideoId(null);
    setTrailerLoading(true);

    fetchOfficialTrailerVideoId({
      title: detail.Title,
      year: detail.Year,
      imdbID: detail.imdbID,
    })
      .then(id => {
        if (!cancelled) setTrailerVideoId(id);
      })
      .finally(() => {
        if (!cancelled) setTrailerLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detail]);

  useEffect(() => {
    if (!trailerVideoId) setTrailerModalOpen(false);
  }, [trailerVideoId]);

  const backdrop = detail ? resolvePosterUrl(detail.Poster) : '';
  const fallbackSearch =
    detail && `${detail.Title} ${detail.Year} trailer`.trim();
  const isTvdbMovie = detail?.imdbID.startsWith('tvdb-') ?? false;

  const isBookmarked = detail ? isInWatchlist(detail.imdbID, 'movie') : false;

  const handleWatchlistToggle = async () => {
    if (!detail) return;
    if (isBookmarked) {
      await removeFromWatchlist(detail.imdbID, 'movie');
    } else {
      await addToWatchlist({
        item_id: detail.imdbID,
        title: detail.Title,
        poster_url: resolvePosterUrl(detail.Poster),
        item_type: 'movie',
      });
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-16">
      <div className="relative border-b border-white/5 overflow-hidden">
        {backdrop && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 blur-sm opacity-40"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/90 to-gray-950/70" />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to movies
          </Link>

          {loading && (
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              Loading details…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {!loading && detail && (
            <>
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <div className="shrink-0 w-full max-w-xs mx-auto lg:mx-0">
                  <img
                    src={resolvePosterUrl(detail.Poster)}
                    alt={detail.Title}
                    className="w-full rounded-2xl border border-white/10 shadow-2xl shadow-black/50 object-cover aspect-[2/3]"
                  />
                  <button
                    onClick={handleWatchlistToggle}
                    className={`mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all transform active:scale-95 ${
                      isBookmarked
                        ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400'
                        : 'bg-white text-gray-950 hover:bg-gray-200 shadow-lg shadow-white/5'
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
                </div>

                <div className="flex-1 min-w-0 space-y-5">

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-cyan-400 bg-cyan-400/10 border border-cyan-400/25 px-2 py-1 rounded-lg">
                      <Film className="w-3.5 h-3.5" />
                      {detail.Type}
                    </span>
                    {detail.Rated && detail.Rated !== 'N/A' && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                        {detail.Rated}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    {detail.Title}{' '}
                    <span className="text-gray-500 font-semibold text-2xl sm:text-3xl">({detail.Year})</span>
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {detail.Runtime && detail.Runtime !== 'N/A' && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-cyan-400/80" />
                        {detail.Runtime}
                      </span>
                    )}
                    {detail.Released && detail.Released !== 'N/A' && (
                      <span>{detail.Released}</span>
                    )}
                    {detail.imdbRating && detail.imdbRating !== 'N/A' && (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {detail.imdbRating}
                        <span className="text-gray-500 font-normal">IMDb</span>
                      </span>
                    )}
                    {detail.imdbVotes && detail.imdbVotes !== 'N/A' && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {detail.imdbVotes} votes
                      </span>
                    )}
                  </div>

                  {detail.Genre && detail.Genre !== 'N/A' && (
                    <div className="flex flex-wrap gap-2">
                      {detail.Genre.split(',').map(g => g.trim()).filter(Boolean).map(g => (
                        <span
                          key={g}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl">
                    {detail.Plot && detail.Plot !== 'N/A' ? detail.Plot : 'No synopsis available.'}
                  </p>

                  <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                    {detail.Director && detail.Director !== 'N/A' && (
                      <div>
                        <dt className="text-gray-500 mb-1">Director</dt>
                        <dd className="text-white">{detail.Director}</dd>
                      </div>
                    )}
                    {detail.Writer && detail.Writer !== 'N/A' && (
                      <div>
                        <dt className="text-gray-500 mb-1">Writers</dt>
                        <dd className="text-white">{detail.Writer}</dd>
                      </div>
                    )}
                    {detail.Actors && detail.Actors !== 'N/A' && (
                      <div className="sm:col-span-2">
                        <dt className="text-gray-500 mb-1">Cast</dt>
                        <dd className="text-white">{detail.Actors}</dd>
                      </div>
                    )}
                    {detail.BoxOffice && detail.BoxOffice !== 'N/A' && (
                      <div>
                        <dt className="text-gray-500 mb-1">Box Office</dt>
                        <dd className="text-white">{detail.BoxOffice}</dd>
                      </div>
                    )}
                    {detail.Awards && detail.Awards !== 'N/A' && (
                      <div className="sm:col-span-2">
                        <dt className="text-gray-500 mb-1">Awards</dt>
                        <dd className="text-white">{detail.Awards}</dd>
                      </div>
                    )}
                  </dl>

                  <p className="text-xs text-gray-600 font-mono">
                    {isTvdbMovie ? 'TVDB ID' : 'IMDb ID'}: {detail.imdbID.replace('tvdb-', '')}
                  </p>

                  {!isTvdbMovie && (
                    <div className="pt-6 border-t border-white/5">
                      <WatchmodeSources imdbId={detail.imdbID} title={detail.Title} />
                    </div>
                  )}
                </div>
              </div>

              <section className="mt-14 pt-10 border-t border-white/10">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Trailer</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Powered by YouTube search — cached per movie to save API quota.
                    </p>
                  </div>
                  {trailerVideoId && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTrailerModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Theater mode
                      </button>
                      <a
                        href={`https://www.youtube.com/watch?v=${trailerVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open on YouTube
                      </a>
                    </div>
                  )}
                </div>

                {trailerLoading && (
                  <div className="aspect-video max-w-4xl rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center gap-3 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    Finding a trailer…
                  </div>
                )}

                {!trailerLoading && trailerVideoId && (
                  <div className="max-w-4xl space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-xl shadow-black/40">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${trailerVideoId}?rel=0&modestbranding=1`}
                        title={`Embedded trailer: ${detail.Title}`}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                      <button
                        type="button"
                        onClick={() => setTrailerModalOpen(true)}
                        className="absolute top-3 right-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-950/85 hover:bg-gray-900 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Expand
                      </button>
                    </div>
                  </div>
                )}

                {!trailerLoading && !trailerVideoId && fallbackSearch && (
                  <div className="max-w-4xl rounded-xl border border-white/10 bg-gray-900/50 overflow-hidden">
                    <div className="grid md:grid-cols-[1.4fr_1fr] gap-0">
                      <div className="aspect-video md:aspect-auto md:min-h-[220px] bg-gray-900 flex items-center justify-center text-gray-600">
                        <div className="text-center px-6 py-10">
                          <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p className="text-gray-400 text-sm leading-relaxed">
                            No trailer matched our filters for this title (or the YouTube API key isn&apos;t configured).
                          </p>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-white/10">
                        <p className="text-gray-400 text-sm">
                          Try YouTube directly — we&apos;ll open results for this movie.
                        </p>
                        <a
                          href={youtubeSearchUrl(fallbackSearch)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Search on YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                )}

              </section>

              <TrailerModal
                open={trailerModalOpen}
                onClose={() => setTrailerModalOpen(false)}
                videoId={trailerVideoId}
                title={`${detail.Title} — Trailer`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
