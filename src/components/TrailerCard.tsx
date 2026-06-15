import { useState } from 'react';
import { Play, Eye, ExternalLink } from 'lucide-react';
import { Trailer } from '../types';

interface Props {
  trailer: Trailer;
}

const typeColor: Record<string, string> = {
  Movie: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Anime: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Series: 'text-green-400 bg-green-400/10 border-green-400/20',
};

export default function TrailerCard({ trailer }: Props) {
  const [playing, setPlaying] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${trailer.youtubeId}`;

  return (
    <div className="group rounded-xl overflow-hidden bg-gray-900 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/40">
      <div className="relative aspect-video overflow-hidden">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={`YouTube trailer: ${trailer.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
          />
        ) : (
          <>
            {thumbnailFailed ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-950 to-cyan-950/30 flex items-center justify-center">
                <Play className="w-10 h-10 text-cyan-300/70 fill-cyan-300/70" />
              </div>
            ) : (
              <img
                src={trailer.thumbnail}
                alt={trailer.title}
                loading="lazy"
                decoding="async"
                onError={() => {
                  console.warn('[TrailerCard] Thumbnail failed, using fallback panel', {
                    title: trailer.title,
                    youtubeId: trailer.youtubeId,
                  });
                  setThumbnailFailed(true);
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gray-950/50 group-hover:bg-gray-950/30 transition-colors" />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play trailer for ${trailer.title}`}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover:bg-cyan-500/30 group-hover:border-cyan-400/40">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </button>
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded border text-xs font-medium ${typeColor[trailer.type]}`}>
              {trailer.type}
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-white text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-cyan-100 transition-colors">
            {trailer.title}
          </h3>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-0.5 text-gray-400 hover:text-cyan-300 transition-colors"
            aria-label={`Open ${trailer.title} on YouTube`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>{trailer.releaseDate}</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{trailer.views} views</span>
          </div>
        </div>
      </div>
    </div>
  );
}
