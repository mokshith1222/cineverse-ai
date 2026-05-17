import type {
  JikanAnimeFull,
  JikanAnimeListItem,
  JikanListResponse,
  JikanRecommendationsResponse,
  JikanSingleResponse,
} from './jikanTypes';

const BASE = (import.meta.env.VITE_JIKAN_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://api.jikan.moe/v4';

const DEFAULT_TTL_MS = 12 * 60 * 1000;
const DETAIL_TTL_MS = 45 * 60 * 1000;
const RECOMMEND_TTL_MS = 30 * 60 * 1000;

const CACHE_PREFIX = 'cineverse-jikan:';
const MEM = new Map<string, { json: unknown; exp: number }>();
const IN_FLIGHT = new Map<string, Promise<unknown>>();

function readSession(key: string): unknown | undefined {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { j, t, ttl } = JSON.parse(raw) as { j: unknown; t: number; ttl: number };
    if (Date.now() - t > ttl) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    return j;
  } catch {
    return undefined;
  }
}

function writeSession(key: string, json: unknown, ttlMs: number) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ j: json, t: Date.now(), ttl: ttlMs }));
  } catch {
    /* ignore */
  }
}

function getCached(key: string): unknown | undefined {
  const m = MEM.get(key);
  if (m && m.exp > Date.now()) return m.json;
  if (m) MEM.delete(key);
  const disk = readSession(key);
  if (disk !== undefined) {
    MEM.set(key, { json: disk, exp: Date.now() + DEFAULT_TTL_MS });
    return disk;
  }
  return undefined;
}

function setCached(key: string, json: unknown, ttlMs: number) {
  MEM.set(key, { json, exp: Date.now() + ttlMs });
  writeSession(key, json, ttlMs);
}

export class JikanApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'JikanApiError';
    this.status = status;
  }
}

/**
 * Cached GET for JSON endpoints. Dedupes concurrent identical requests.
 */
export async function jikanGet<T>(pathWithQuery: string, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const key = pathWithQuery;

  const hit = getCached(key);
  if (hit !== undefined) return hit as T;

  const pending = IN_FLIGHT.get(key);
  if (pending) return pending as Promise<T>;

  const url = `${BASE}${pathWithQuery.startsWith('/') ? '' : '/'}${pathWithQuery}`;

  const p = fetch(url)
    .then(async res => {
      if (res.status === 429) {
        throw new JikanApiError('Jikan rate limit reached — try again in a minute.', 429);
      }
      if (!res.ok) {
        throw new JikanApiError(`Jikan request failed (${res.status})`, res.status);
      }
      return res.json() as Promise<T>;
    })
    .then(json => {
      setCached(key, json, ttlMs);
      return json;
    })
    .finally(() => {
      IN_FLIGHT.delete(key);
    });

  IN_FLIGHT.set(key, p);
  return p as Promise<T>;
}

/** Popular / “trending” proxy — top anime by popularity (MAL members). */
export function fetchTopAnimePopular(limit = 12, page = 1) {
  const q = new URLSearchParams({
    filter: 'bypopularity',
    page: String(page),
    limit: String(limit),
  });
  return jikanGet<JikanListResponse<JikanAnimeListItem>>(`/top/anime?${q}`, DEFAULT_TTL_MS);
}

/** Currently airing seasonal catalogue (worldwide “this season”). */
export function fetchSeasonNow(limit = 12, page = 1) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return jikanGet<JikanListResponse<JikanAnimeListItem>>(`/seasons/now?${q}`, DEFAULT_TTL_MS);
}

export type AnimeSearchOrder =
  | 'mal_id'
  | 'title'
  | 'episodes'
  | 'score'
  | 'popularity'
  | 'start_date'
  | 'members';

export async function searchAnime(params: {
  query: string;
  page?: number;
  limit?: number;
  order_by?: AnimeSearchOrder;
  sort?: 'asc' | 'desc';
}): Promise<JikanListResponse<JikanAnimeListItem>> {
  const q = params.query.trim();
  if (q.length < 2) {
    const limit = params.limit ?? 24;
    const emptyPagination = {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: 0, total: 0, per_page: limit },
    };
    return { pagination: emptyPagination, data: [] as JikanAnimeListItem[] };
  }

  const sp = new URLSearchParams({
    q,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 24),
  });
  if (params.order_by) sp.set('order_by', params.order_by);
  if (params.sort) sp.set('sort', params.sort);

  return jikanGet<JikanListResponse<JikanAnimeListItem>>(`/anime?${sp}`, DEFAULT_TTL_MS);
}

export function fetchAnimeFull(malId: number) {
  return jikanGet<JikanSingleResponse<JikanAnimeFull>>(`/anime/${malId}/full`, DETAIL_TTL_MS);
}

export function fetchAnimeRecommendations(malId: number) {
  return jikanGet<JikanRecommendationsResponse>(`/anime/${malId}/recommendations`, RECOMMEND_TTL_MS);
}
