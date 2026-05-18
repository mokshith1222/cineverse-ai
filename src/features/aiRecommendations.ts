import type { Anime, Movie, TvShow } from '../types';

export type DiscoveryMood = 'epic' | 'cozy' | 'dark' | 'funny' | 'mind-bending';

export interface AiRecommendation {
  id: string;
  title: string;
  reason: string;
  href: string;
  poster: string;
  type: 'Movie' | 'Anime' | 'TV';
  score: number;
}

const moodGenres: Record<DiscoveryMood, string[]> = {
  epic: ['Adventure', 'Action', 'Fantasy', 'Sci-Fi'],
  cozy: ['Comedy', 'Romance', 'Slice of Life', 'Family'],
  dark: ['Thriller', 'Horror', 'Crime', 'Mystery'],
  funny: ['Comedy', 'Animation'],
  'mind-bending': ['Sci-Fi', 'Mystery', 'Psychological', 'Drama'],
};

function overlapScore(genres: string[], wanted: string[]): number {
  const normalized = genres.map(g => g.toLowerCase());
  return wanted.filter(g => normalized.includes(g.toLowerCase())).length;
}

export function buildMoodRecommendations(
  mood: DiscoveryMood,
  rows: { movies: Movie[]; anime: Anime[]; tv: TvShow[] },
): AiRecommendation[] {
  const wanted = moodGenres[mood];
  const movieRows = rows.movies.map(item => ({
    id: `movie-${item.id}`,
    title: item.title,
    reason: `Matches your ${mood} mood with ${item.genre.slice(0, 2).join(', ') || 'cinematic'} signals.`,
    href: item.imdbID ? `/movies/${item.imdbID}` : '/movies',
    poster: item.poster,
    type: 'Movie' as const,
    score: item.rating + overlapScore(item.genre, wanted) * 2,
  }));

  const animeRows = rows.anime.map(item => ({
    id: `anime-${item.id}`,
    title: item.title,
    reason: `A strong ${mood} anime pick based on genre, rating, and current popularity.`,
    href: `/anime/${item.id}`,
    poster: item.poster,
    type: 'Anime' as const,
    score: item.rating + overlapScore(item.genre, wanted) * 2,
  }));

  const tvRows = rows.tv.map(item => ({
    id: `tv-${item.id}`,
    title: item.title,
    reason: `Recommended for ${mood} TV discovery with live schedule context.`,
    href: `/tv/${item.id}`,
    poster: item.poster,
    type: 'TV' as const,
    score: item.rating + overlapScore(item.genre, wanted) * 2,
  }));

  return [...movieRows, ...animeRows, ...tvRows]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
