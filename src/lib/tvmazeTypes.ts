/** Subset of TVMaze JSON — https://www.tvmaze.com/api */

export interface TvMazeImage {
  medium?: string | null;
  original?: string | null;
}

export interface TvMazeRating {
  average?: number | null;
}

export interface TvMazeShow {
  id: number;
  url?: string;
  name: string;
  type?: string;
  language?: string;
  genres?: string[];
  status?: string;
  runtime?: number | null;
  averageRuntime?: number | null;
  premiered?: string | null;
  ended?: string | null;
  officialSite?: string | null;
  rating?: TvMazeRating;
  image?: TvMazeImage | null;
  summary?: string | null;
  network?: { name?: string } | null;
  webChannel?: { name?: string } | null;
  externals?: {
    tvrage?: number | null;
    thetvdb?: number | null;
    imdb?: string | null;
  } | null;
}

export interface TvMazeSearchHit {
  score?: number;
  show: TvMazeShow;
}

export interface TvMazeEpisode {
  id: number;
  url?: string;
  name?: string;
  season?: number;
  number?: number | null;
  type?: string;
  airdate?: string | null;
  airtime?: string | null;
  airstamp?: string | null;
  runtime?: number | null;
  rating?: TvMazeRating;
  image?: TvMazeImage | null;
  summary?: string | null;
  show?: TvMazeShow;
  _embedded?: { show?: TvMazeShow };
}
