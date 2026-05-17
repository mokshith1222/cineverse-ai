export interface Movie {
  id: string | number;
  /** Present when the row came from OMDb — enables `/movies/:imdbID` links. */
  imdbID?: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  genre: string[];
  description: string;
  duration: string;
  trailer?: string;
}

export interface Anime {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  genre: string[];
  description: string;
  episodes: number;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  trailer?: string;
}

export interface OTTPlatform {
  id: number;
  name: string;
  logo: string;
  color: string;
  shows: OTTShow[];
}

export interface OTTShow {
  id: number;
  title: string;
  platform: string;
  poster: string;
  status: 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped';
  progress?: number;
  totalEpisodes?: number;
  rating?: number;
  genre: string[];
}

export interface Trailer {
  id: number;
  title: string;
  thumbnail: string;
  youtubeId: string;
  type: 'Movie' | 'Anime' | 'Series';
  releaseDate: string;
  views: string;
}

export interface TvShow {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  genre: string[];
  description: string;
  runtimeMinutes?: number | null;
  status?: string;
  network?: string;
}

export interface TvEpisode {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string | null;
  airtime?: string | null;
  airstamp?: string | null;
  runtime: number | null;
  summary: string;
  imageMedium?: string | null;
}

/** Combined airing row for schedule / upcoming lists */
export interface TvAiringRow {
  show: TvShow;
  episode: TvEpisode;
  source: 'broadcast' | 'streaming';
}
