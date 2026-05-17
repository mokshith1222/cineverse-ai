import type { YouTubeSearchItem, YouTubeSearchResponse } from './youtubeTypes';

const YT_SEARCH = 'https://www.googleapis.com/youtube/v3/search';

/** sessionStorage + in-memory cache to limit search.list quota (100 units per call). */
const CACHE_PREFIX = 'cineverse-yt-trailer:';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MISS_CACHE_TTL_MS = 30 * 60 * 1000;
const MEMORY = new Map<string, { value: string | null; expires: number }>();
const IN_FLIGHT = new Map<string, Promise<string | null>>();

const NEGATIVE = /\b(reaction|reacts|review|recap|explained|ending|fan\s*made|full\s*movie|clips?|scene|breakdown|viooz|tiktok)\b/i;
const OFFICIAL_CHANNEL = /\b(official|movieclips trailers|trailers?|netflix|prime video|disney|warner bros|universal pictures|paramount pictures|sony pictures|20th century studios|marvel entertainment|dc|crunchyroll|aniplex|toho|toei|kadokawa|vizmedia|adult swim)\b/i;

function cacheKey(imdbID: string | undefined, title: string, year: string): string {
  return imdbID?.trim() || `${title.trim().toLowerCase()}|${year.trim()}`;
}

function readStorage(key: string): string | null | undefined {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { v: string | null; t: number; e?: number };
    const expires = parsed.e ?? parsed.t + (parsed.v ? CACHE_TTL_MS : MISS_CACHE_TTL_MS);
    if (Date.now() > expires) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    return parsed.v;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    const ttl = value ? CACHE_TTL_MS : MISS_CACHE_TTL_MS;
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: value, t: Date.now(), e: Date.now() + ttl }));
  } catch {
    /* quota / private mode */
  }
}

function remember(key: string, value: string | null): string | null {
  const ttl = value ? CACHE_TTL_MS : MISS_CACHE_TTL_MS;
  MEMORY.set(key, { value, expires: Date.now() + ttl });
  writeStorage(key, value);
  return value;
}

function getCached(key: string): string | null | undefined {
  const mem = MEMORY.get(key);
  if (mem && mem.expires > Date.now()) return mem.value;
  if (mem) MEMORY.delete(key);
  const disk = readStorage(key);
  if (disk !== undefined) {
    MEMORY.set(key, { value: disk, expires: Date.now() + CACHE_TTL_MS });
    return disk;
  }
  return undefined;
}

function getApiKey(): string | undefined {
  const k = import.meta.env.VITE_YOUTUBE_API_KEY;
  const key = k && String(k).trim() ? String(k).trim() : undefined;
  if (!key) {
    console.warn('[YouTube] Missing VITE_YOUTUBE_API_KEY. Trailer lookups will be disabled.');
  }
  return key;
}

function normalizeTitle(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/[:\-–—|].*$/g, ' ')
    .replace(/\b(the|a|an|movie|film|season|series|tv)\b/gi, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function titleWords(value: string): string[] {
  return normalizeTitle(value)
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function scoreTrailerCandidate(movieTitle: string, item: YouTubeSearchItem): number {
  const vid = item.id.videoId;
  if (!vid) return -Infinity;

  const st = item.snippet.title || '';
  const channel = item.snippet.channelTitle || '';
  const description = item.snippet.description || '';
  const lower = st.toLowerCase();
  const haystack = `${st} ${channel} ${description}`.toLowerCase();

  if (NEGATIVE.test(haystack)) return -Infinity;

  let score = 0;
  if (/\bofficial\b/i.test(haystack)) score += 5;
  if (/\btrailer\b/i.test(st)) score += 7;
  if (/\bteaser\b/i.test(st)) score += 3;
  if (/\b(?:final|main|official)\s+trailer\b/i.test(st)) score += 2;
  if (OFFICIAL_CHANNEL.test(channel)) score += 4;

  const mtWords = titleWords(movieTitle);
  const matched = mtWords.filter(w => lower.includes(w)).length;
  score += Math.min(10, matched * 2);
  if (mtWords.length > 0 && matched === 0) score -= 8;

  const normalizedTitle = normalizeTitle(movieTitle);
  const normalizedCandidate = normalizeTitle(st);
  if (normalizedTitle && normalizedCandidate.includes(normalizedTitle)) score += 6;

  return score;
}

function pickBestVideoId(movieTitle: string, items: YouTubeSearchItem[]): string | null {
  const ranked = items
    .map(it => ({ it, score: scoreTrailerCandidate(movieTitle, it) }))
    .filter(x => x.score > -Infinity && x.it.id.videoId)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.it.id.videoId ?? null;
}

function redactedUrl(url: URL): string {
  const clone = new URL(url);
  clone.searchParams.set('key', '***');
  return clone.toString();
}

function buildTrailerQueries(movieTitle: string, year: string): string[] {
  const cleanTitle = movieTitle.trim();
  const cleanYear = year.trim();
  const normalized = normalizeTitle(cleanTitle);
  const queries = [
    `"${cleanTitle}" ${cleanYear} official trailer`,
    `${cleanTitle} ${cleanYear} trailer`,
    `${cleanTitle} official trailer`,
    normalized && normalized !== cleanTitle.toLowerCase() ? `${normalized} official trailer` : '',
  ];

  return [...new Set(queries.map(q => q.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}

async function searchTrailerVideoId(movieTitle: string, year: string): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  for (const q of buildTrailerQueries(movieTitle, year)) {
    const url = new URL(YT_SEARCH);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '10');
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('safeSearch', 'moderate');
    url.searchParams.set('q', q);
    url.searchParams.set('key', apiKey);

    console.debug('[YouTube] Trailer search', { title: movieTitle, year, query: q });
    const res = await fetch(url.toString());
    const data = (await res.json()) as YouTubeSearchResponse;

    if (!res.ok || data.error) {
      console.error('[YouTube] API failure', {
        status: res.status,
        error: data.error?.message || res.statusText,
        request: redactedUrl(url),
      });
      return null;
    }

    const items = data.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[YouTube] Empty trailer response', { title: movieTitle, query: q });
      continue;
    }

    const picked = pickBestVideoId(movieTitle, items);
    if (picked) {
      console.debug('[YouTube] Trailer matched', { title: movieTitle, youtubeId: picked });
      return picked;
    }

    console.warn('[YouTube] No acceptable official trailer match in response', {
      title: movieTitle,
      query: q,
      resultCount: items.length,
    });
  }

  return null;
}

export interface TrailerLookupParams {
  title: string;
  year: string;
  /** When set, responses are cached per title — avoids repeat searches when revisiting a movie. */
  imdbID?: string;
}

/**
 * Returns a YouTube video id for an official-style trailer, or null if none / API unavailable.
 * Cached (memory + sessionStorage). Concurrent calls share one network request per cache key.
 */
export async function fetchOfficialTrailerVideoId(params: TrailerLookupParams): Promise<string | null> {
  const title = params.title.trim();
  const year = params.year.trim();
  if (!title) return null;

  const key = cacheKey(params.imdbID, title, year);

  const hit = getCached(key);
  if (hit !== undefined) return hit;

  const existing = IN_FLIGHT.get(key);
  if (existing) return existing;

  const promise = searchTrailerVideoId(title, year)
    .then(id => remember(key, id))
    .catch(() => remember(key, null))
    .finally(() => {
      IN_FLIGHT.delete(key);
    });

  IN_FLIGHT.set(key, promise);
  return promise;
}

export function youtubeThumbnailUrl(videoId: string, quality: 'hq' | 'mq' | 'sd' = 'hq'): string {
  const map = { hq: 'hqdefault', mq: 'mqdefault', sd: 'sddefault' } as const;
  return `https://img.youtube.com/vi/${videoId}/${map[quality]}.jpg`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
