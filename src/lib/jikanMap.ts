import type { Anime } from '../types';
import type { JikanAnimeListItem } from './jikanTypes';

const PLACEHOLDER = 'https://placehold.co/400x600/111827/6b7280/png?text=No+Poster';

export function mapJikanStatus(status?: string): Anime['status'] {
  const s = (status ?? '').toLowerCase();
  if (s.includes('currently') && s.includes('airing')) return 'Ongoing';
  if (s.includes('finished') || s.includes('complete')) return 'Completed';
  return 'Upcoming';
}

export function mapJikanAnime(a: JikanAnimeListItem): Anime {
  const poster =
    a.images?.jpg?.large_image_url ||
    a.images?.jpg?.image_url ||
    PLACEHOLDER;

  const rawYear = a.year ?? a.aired?.prop?.from?.year ?? null;
  const year = typeof rawYear === 'number' && Number.isFinite(rawYear) ? rawYear : 0;

  const synopsis = (a.synopsis ?? '')
    .replace(/\[Written by.*?\]/i, '')
    .trim();

  const title =
    (a.title_english && a.title_english.trim()) ||
    a.title;

  return {
    id: a.mal_id,
    title,
    poster,
    backdrop: poster,
    rating: a.score ?? 0,
    year,
    genre: (a.genres ?? []).map(g => g.name),
    description: synopsis,
    episodes: a.episodes ?? 0,
    status: mapJikanStatus(a.status),
    trailer: undefined,
  };
}
