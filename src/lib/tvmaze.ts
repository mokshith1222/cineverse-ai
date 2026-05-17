import type {
  TvMazeEpisode,
  TvMazeSearchHit,
  TvMazeShow,
} from './tvmazeTypes';

const BASE =
  (import.meta.env.VITE_TVMAZE_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'https://api.tvmaze.com';

const TTL_DEFAULT_MS = 12 * 60 * 1000;
const TTL_SCHEDULE_MS = 15 * 60 * 1000;
const TTL_SHOW_MS = 45 * 60 * 1000;
const TTL_EPISODES_MS = 35 * 60 * 1000;

const CACHE_PREFIX = 'cineverse-tvmaze:';
const MEM = new Map<string, { json: unknown; exp: number }>();
const IN_FLIGHT = new Map<string, Promise<unknown>>();

function readSession(key: string): { json: unknown; ttl: number } | undefined {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const row = JSON.parse(raw) as { j: unknown; t: number; ttl: number };
    if (Date.now() - row.t > row.ttl) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    return { json: row.j, ttl: row.ttl - (Date.now() - row.t) };
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
    MEM.set(key, { json: disk.json, exp: Date.now() + Math.max(60_000, disk.ttl) });
    return disk.json;
  }
  return undefined;
}

function setCached(key: string, json: unknown, ttlMs: number) {
  MEM.set(key, { json, exp: Date.now() + ttlMs });
  writeSession(key, json, ttlMs);
}

export class TvMazeApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TvMazeApiError';
    this.status = status;
  }
}

export async function tvmazeGet<T>(pathWithQuery: string, ttlMs = TTL_DEFAULT_MS): Promise<T> {
  const key = pathWithQuery;
  const hit = getCached(key);
  if (hit !== undefined) return hit as T;

  const pending = IN_FLIGHT.get(key);
  if (pending) return pending as Promise<T>;

  const url = `${BASE}${pathWithQuery.startsWith('/') ? '' : '/'}${pathWithQuery}`;

  const p = fetch(url)
    .then(async res => {
      if (res.status === 429) {
        throw new TvMazeApiError('TVMaze rate limit — please wait and try again.', 429);
      }
      if (!res.ok) {
        throw new TvMazeApiError(`TVMaze request failed (${res.status})`, res.status);
      }
      return res.json() as Promise<T>;
    })
    .then(json => {
      setCached(key, json, ttlMs);
      return json;
    })
    .finally(() => IN_FLIGHT.delete(key));

  IN_FLIGHT.set(key, p);
  return p as Promise<T>;
}

/** Full-text search — TVMaze returns scored hits (no paging). */
export function searchShows(query: string, limit = 40) {
  const q = query.trim();
  if (q.length < 2) return Promise.resolve([] as TvMazeSearchHit[]);

  const enc = encodeURIComponent(q);
  return tvmazeGet<TvMazeSearchHit[]>(`/search/shows?q=${enc}`, TTL_DEFAULT_MS).then(rows =>
    rows.slice(0, limit),
  );
}

export function getShow(showId: number) {
  return tvmazeGet<TvMazeShow>(`/shows/${showId}`, TTL_SHOW_MS);
}

export function getShowEpisodes(showId: number) {
  return tvmazeGet<TvMazeEpisode[]>(`/shows/${showId}/episodes`, TTL_EPISODES_MS);
}

/** Domestic broadcast schedule for a country/date (local calendar date string `YYYY-MM-DD`). */
export function getSchedule(country: string, dateYmd: string) {
  const c = encodeURIComponent(country);
  const d = encodeURIComponent(dateYmd);
  return tvmazeGet<TvMazeEpisode[]>(
    `/schedule?country=${c}&date=${d}`,
    TTL_SCHEDULE_MS,
  );
}

/** Streaming / web premieres for a calendar date. */
export function getWebSchedule(dateYmd: string) {
  const d = encodeURIComponent(dateYmd);
  return tvmazeGet<TvMazeEpisode[]>(`/schedule/web?date=${d}`, TTL_SCHEDULE_MS);
}

/** Paginated catalogue snapshot (`page` is zero-based). */
export function getShowsPage(page = 0) {
  return tvmazeGet<TvMazeShow[]>(`/shows?page=${page}`, TTL_DEFAULT_MS);
}
