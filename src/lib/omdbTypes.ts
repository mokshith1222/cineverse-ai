/** Raw shapes returned by www.omdbapi.com */

export interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchJson {
  Search?: OmdbSearchItem[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export interface OmdbMovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  BoxOffice?: string;
  Awards?: string;
  Website?: string;
  Response: string;
  Error?: string;
}
