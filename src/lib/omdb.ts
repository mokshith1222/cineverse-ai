import type { Movie } from '../types';
import { TRENDING_IMDB_IDS } from '../data/trendingImdbIds';
import type { OmdbMovieDetail, OmdbSearchItem, OmdbSearchJson } from './omdbTypes';

const OMDB_BASE = 'https://www.omdbapi.com/';
const OMDB_TIMEOUT_MS = 10000;
const OMDB_PROXY_ENDPOINTS = ['/api/omdb', '/.netlify/functions/omdb'];
const OMDB_CACHE_TTL_MS = 15 * 60 * 1000;
const OMDB_CACHE_PREFIX = 'cineverse-omdb:';
const OMDB_MEMORY_CACHE = new Map<string, { value: unknown; expires: number }>();
const OMDB_IN_FLIGHT = new Map<string, Promise<unknown>>();
export const OMDB_FALLBACK_POSTER = 'https://placehold.co/400x600/111827/6b7280/png?text=No+Poster';

function getApiKey(): string {
  const key = import.meta.env.VITE_OMDB_API_KEY;
  if (!key) {
    console.error('[OMDb] Missing VITE_OMDB_API_KEY. Add it to .env.local before running the app.');
    throw new Error('Missing VITE_OMDB_API_KEY. Add it to .env.local.');
  }
  return key;
}

export function resolvePosterUrl(poster: string): string {
  return poster && poster !== 'N/A'
    ? poster
    : OMDB_FALLBACK_POSTER;
}

export function parseYear(yearRaw: string): number {
  const m = yearRaw.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}

export function parseImdbRating(rating: string): number {
  const n = parseFloat(rating);
  return Number.isFinite(n) ? n : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isValidSearchItem(item: unknown): item is OmdbSearchItem {
  return isRecord(item)
    && typeof item.Title === 'string'
    && typeof item.Year === 'string'
    && typeof item.imdbID === 'string'
    && item.imdbID.length > 0
    && typeof item.Poster === 'string';
}

function isValidMovieDetail(item: unknown): item is OmdbMovieDetail {
  return isRecord(item)
    && item.Response === 'True'
    && typeof item.Title === 'string'
    && typeof item.Year === 'string'
    && typeof item.imdbID === 'string'
    && item.imdbID.length > 0;
}

function redactedUrl(url: URL): string {
  const clone = new URL(url);
  clone.searchParams.set('apikey', '***');
  return clone.toString();
}

function isFailoverBody(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const error = typeof value.Error === 'string'
    ? value.Error
    : typeof value.error === 'string'
      ? value.error
      : '';
  return value.Response === 'False'
    && /request limit reached|quotaexceeded|quota exceeded|rate limit|too many requests/i.test(error);
}

function isFailoverStatus(status: number): boolean {
  return status === 403 || status === 429 || status >= 500;
}

function paramsCacheKey(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

function buildUrl(base: string, params: Record<string, string>, apiKey?: string): URL {
  const url = base.startsWith('http')
    ? new URL(base)
    : new URL(base, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  });
  if (apiKey) url.searchParams.set('apikey', apiKey);
  return url;
}

function readStorage(key: string): unknown | undefined {
  try {
    const raw = sessionStorage.getItem(OMDB_CACHE_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { value: unknown; expires: number };
    if (Date.now() > parsed.expires) {
      sessionStorage.removeItem(OMDB_CACHE_PREFIX + key);
      return undefined;
    }
    return parsed.value;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(OMDB_CACHE_PREFIX + key, JSON.stringify({
      value,
      expires: Date.now() + OMDB_CACHE_TTL_MS,
    }));
  } catch {
    /* storage may be unavailable */
  }
}

function getCached(key: string): unknown | undefined {
  const memory = OMDB_MEMORY_CACHE.get(key);
  if (memory && memory.expires > Date.now()) return memory.value;
  if (memory) OMDB_MEMORY_CACHE.delete(key);

  const stored = readStorage(key);
  if (stored !== undefined) {
    OMDB_MEMORY_CACHE.set(key, { value: stored, expires: Date.now() + OMDB_CACHE_TTL_MS });
    return stored;
  }
  return undefined;
}

function remember(key: string, value: unknown): unknown {
  OMDB_MEMORY_CACHE.set(key, { value, expires: Date.now() + OMDB_CACHE_TTL_MS });
  writeStorage(key, value);
  return value;
}

async function fetchJsonWithTimeout(url: URL): Promise<{ response: Response; json: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OMDB_TIMEOUT_MS);
  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    const json = await response.json().catch(() => ({
      Response: 'False',
      Error: 'Invalid OMDb response',
    }));
    return { response, json };
  } finally {
    clearTimeout(timeout);
  }
}

/** Low-level GET helper: attaches apikey and parses JSON. */
export async function omdbFetch(params: Record<string, string>): Promise<unknown> {
  const cacheKey = paramsCacheKey(params);
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  const existing = OMDB_IN_FLIGHT.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    for (const endpoint of OMDB_PROXY_ENDPOINTS) {
      const proxyUrl = buildUrl(endpoint, params);
      try {
        console.debug('[OMDb] Fetch via secure proxy', proxyUrl.pathname);
        const { response, json } = await fetchJsonWithTimeout(proxyUrl);

        if (response.ok && !isFailoverBody(json)) {
          return remember(cacheKey, json);
        }

        console.warn('[OMDb] proxy response failed', {
          endpoint: proxyUrl.pathname,
          status: response.status,
          error: isRecord(json) ? json.Error : undefined,
        });
      } catch (err) {
        console.warn('[OMDb] proxy unavailable or failed', {
          endpoint: proxyUrl.pathname,
          error: err instanceof Error ? err.message : err,
        });
      }
    }

    const primaryUrl = buildUrl(OMDB_BASE, params, getApiKey());
    console.warn('[OMDb] secure proxy unavailable, using browser OMDb fallback. Keys prefixed with VITE_ are public.');

    const primary = await fetchJsonWithTimeout(primaryUrl);
    if (primary.response.ok && !isFailoverBody(primary.json)) {
      return remember(cacheKey, primary.json);
    }

    console.warn('[OMDb] primary API failed', {
      status: primary.response.status,
      error: isRecord(primary.json) ? primary.json.Error : undefined,
    });

    if (isFailoverStatus(primary.response.status) || isFailoverBody(primary.json)) {
      console.warn('[OMDb] switching to backup API');
    }

    const backupKey = import.meta.env.VITE_BACKUP_MOVIE_API_KEY;
    if (backupKey) {
      const backupUrl = buildUrl(OMDB_BASE, params, String(backupKey));
      const backup = await fetchJsonWithTimeout(backupUrl);
      if (backup.response.ok && !isFailoverBody(backup.json)) {
        console.info('[OMDb] backup API success');
        return remember(cacheKey, backup.json);
      }
      console.error('[OMDb] backup API failure', {
        status: backup.response.status,
        error: isRecord(backup.json) ? backup.json.Error : undefined,
      });
    }

    console.error('[OMDb] Fetch failed', {
      request: redactedUrl(primaryUrl),
      error: isRecord(primary.json) ? primary.json.Error : primary.response.statusText,
    });

    throw new Error(
      isRecord(primary.json) && typeof primary.json.Error === 'string'
        ? primary.json.Error
        : `OMDb request failed (${primary.response.status})`,
    );
  })().finally(() => {
    OMDB_IN_FLIGHT.delete(cacheKey);
  });

  OMDB_IN_FLIGHT.set(cacheKey, promise);
  return promise;
}

export function mapSearchItemToMovie(item: OmdbSearchItem): Movie {
  const poster = resolvePosterUrl(item.Poster);
  return {
    id: item.imdbID,
    imdbID: item.imdbID,
    title: item.Title,
    poster,
    backdrop: poster,
    rating: 0,
    year: parseYear(item.Year),
    genre: [],
    description: '',
    duration: '',
  };
}

export function mapDetailToMovie(detail: OmdbMovieDetail): Movie {
  const poster = resolvePosterUrl(detail.Poster);
  const genres = detail.Genre && detail.Genre !== 'N/A'
    ? detail.Genre.split(',').map(g => g.trim()).filter(Boolean)
    : [];

  return {
    id: detail.imdbID,
    imdbID: detail.imdbID,
    title: detail.Title,
    poster,
    backdrop: poster,
    rating: parseImdbRating(detail.imdbRating),
    year: parseYear(detail.Year),
    genre: genres,
    description: detail.Plot && detail.Plot !== 'N/A' ? detail.Plot : '',
    duration: detail.Runtime && detail.Runtime !== 'N/A' ? detail.Runtime : '',
  };
}

/** Search movies (OMDb `s=`). Returns empty list when there are no hits or query is too short. */
export async function searchMovies(
  query: string,
  page = 1,
): Promise<{ movies: Movie[]; total: number }> {
  const q = query.trim();
  if (q.length < 2) {
    return { movies: [], total: 0 };
  }

  const json = (await omdbFetch({
    s: q,
    page: String(page),
    type: 'movie',
  })) as OmdbSearchJson;

  if (json.Response !== 'True' || !Array.isArray(json.Search) || !json.Search.length) {
    return { movies: [], total: 0 };
  }

  const validRows = json.Search.filter(isValidSearchItem);
  if (validRows.length !== json.Search.length) {
    console.warn('[OMDb] Dropped invalid search rows', {
      query: q,
      dropped: json.Search.length - validRows.length,
    });
  }

  const total = json.totalResults ? parseInt(json.totalResults, 10) : json.Search.length;
  return {
    movies: validRows.map(mapSearchItemToMovie),
    total: Number.isFinite(total) ? total : validRows.length,
  };
}

/** Rotating TVDB movie discovery through the secure movie proxy. */
export async function discoverTvdbMovies(page = 0): Promise<Movie[]> {
  const json = (await omdbFetch({
    tvdbDiscover: 'movie',
    page: String(page),
  })) as OmdbSearchJson;

  if (json.Response !== 'True' || !Array.isArray(json.Search) || !json.Search.length) {
    return [];
  }

  return json.Search
    .filter(isValidSearchItem)
    .map(mapSearchItemToMovie);
}

/** Full metadata by IMDb id (`i=`). */
export async function getMovieByImdbId(imdbID: string, plot: 'short' | 'full' = 'short'): Promise<OmdbMovieDetail> {
  const json = imdbID.startsWith('tvdb-')
    ? await omdbFetch({ tvdbID: imdbID.replace('tvdb-', '') })
    : await omdbFetch({
        i: imdbID,
        plot,
      });

  if (!isValidMovieDetail(json)) {
    const error = isRecord(json) && typeof json.Error === 'string'
      ? json.Error
      : 'Invalid OMDb movie response';
    console.warn('[OMDb] Invalid movie detail response', { imdbID, error });
    throw new Error(error);
  }
  return json;
}

/** Fetches curated titles in parallel for the trending UI. */
export async function fetchTrendingMovies(): Promise<Movie[]> {
  const settled = await Promise.allSettled(
    TRENDING_IMDB_IDS.map(id => getMovieByImdbId(id, 'short')),
  );

  const rejected = settled.filter(r => r.status === 'rejected');
  if (rejected.length > 0) {
    console.warn('[OMDb] Some curated trending movies failed', { failed: rejected.length });
  }

  return settled
    .filter((r): r is PromiseFulfilledResult<OmdbMovieDetail> => r.status === 'fulfilled')
    .map(r => mapDetailToMovie(r.value));
}
