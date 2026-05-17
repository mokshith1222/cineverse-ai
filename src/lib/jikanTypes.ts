/** Subset of Jikan API v4 types — https://docs.api.jikan.moe/ */

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: { count: number; total: number; per_page: number };
}

export interface JikanImageSet {
  image_url: string | null;
  small_image_url: string | null;
  large_image_url: string | null;
}

export interface JikanGenre {
  mal_id: number;
  type?: string;
  name: string;
  url?: string;
}

export interface JikanAnimeListItem {
  mal_id: number;
  url: string;
  title: string;
  title_english?: string | null;
  title_japanese?: string | null;
  images: {
    jpg: JikanImageSet;
    webp: JikanImageSet;
  };
  episodes: number | null;
  score?: number | null;
  genres: JikanGenre[];
  synopsis?: string;
  year?: number | null;
  status?: string;
  aired?: {
    string?: string;
    prop?: { from?: { year?: number | null } | null; to?: { year?: number | null } | null };
  };
}

export interface JikanAnimeFull extends JikanAnimeListItem {
  background?: string | null;
  trailer?: {
    youtube_id?: string | null;
    url?: string | null;
    embed_url?: string | null;
  };
  studios?: { mal_id: number; name: string }[];
  broadcast?: { string?: string | null };
  duration?: string;
  rating?: string;
  scored_by?: number;
  rank?: number;
  popularity?: number;
}

export interface JikanListResponse<T> {
  pagination: JikanPagination;
  data: T[];
}

export interface JikanSingleResponse<T> {
  data: T;
}

export interface JikanRecommendation {
  entry: JikanAnimeListItem;
  votes: number;
}

export interface JikanRecommendationsResponse {
  data: JikanRecommendation[];
}
