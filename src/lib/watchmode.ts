const API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

function requireApiKey(): string {
  if (!API_KEY) {
    throw new Error('Missing VITE_WATCHMODE_API_KEY');
  }
  return API_KEY;
}

function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  return search.toString();
}

async function fetchJson<T>(path: string, params: Record<string, string | number | boolean | undefined | null> = {}): Promise<T> {
  const apiKey = requireApiKey();
  const qs = toQuery({ apiKey, ...params });
  const url = `${BASE_URL}${path}?${qs}`;
  
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error(`[Watchmode] Fetch error for ${path}:`, msg);
    throw new Error(`Watchmode fetch error: ${msg}`);
  }

  const text = await res.text().catch(() => '');
  
  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const json = JSON.parse(text);
      if (json.statusMessage) errorMsg = json.statusMessage;
      else if (json.message) errorMsg = json.message;
    } catch {}
    
    const fullError = `Watchmode API error (${res.status}): ${errorMsg}`;
    console.error(`[Watchmode] ${fullError}`);
    console.error(`[Watchmode] Request URL:`, url);
    console.error(`[Watchmode] Response:`, text.slice(0, 500));
    if (res.status === 401) console.error('[Watchmode] Authorization failed: verify VITE_WATCHMODE_API_KEY');
    if (res.status === 403) console.error('[Watchmode] Forbidden: API key lacks access to this region or endpoint');
    if (res.status === 404) console.error('[Watchmode] Endpoint not found: check Watchmode URL path and API version');
    if (res.status === 429) console.error('[Watchmode] Rate limited by Watchmode');
    throw new Error(fullError);
  }

  try {
    return JSON.parse(text) as T;
  } catch (err: any) {
    console.error(`[Watchmode] Parse error for ${path}:`, err?.message, 'Response:', text.slice(0, 200));
    throw new Error(`Watchmode parse error: ${err?.message || 'Invalid JSON'}`);
  }
}

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  ios_url: string;
  android_url: string;
  web_url: string;
  format: string;
  price: number | null;
  seasons: number | null;
  episodes: number | null;
}

export interface WatchmodeSourceListItem {
  id: number;
  name: string;
  type: 'sub' | 'purchase' | 'free' | 'tve';
  logo_100px: string;
  ios_appstore_url: string | null;
  android_playstore_url: string | null;
  android_tv_url: string | null;
  fire_tv_url: string | null;
  roku_url: string | null;
  tvos_url: string | null;
  regions: string[];
}

export type WatchmodeTitleType = 'movie' | 'tv_series' | 'tv_special' | 'tv_miniseries' | 'short_film' | 'tv_movie';

export interface WatchmodeTitleListItem {
  id: number;
  title: string;
  year: number;
  imdb_id: string | null;
  tmdb_id: number | null;
  tmdb_type: 'movie' | 'tv' | null;
  type: WatchmodeTitleType;
}

export interface WatchmodeListTitlesResponse {
  titles: WatchmodeTitleListItem[];
  page: number;
  total_results: number;
  total_pages: number;
}

export interface WatchmodeTitleDetails {
  id: number;
  title: string;
  original_title: string | null;
  plot_overview: string | null;
  type: WatchmodeTitleType;
  runtime_minutes: number | null;
  year: number;
  end_year: number | null;
  release_date: string | null;
  imdb_id: string | null;
  tmdb_id: number | null;
  tmdb_type: 'movie' | 'tv' | null;
  genre_names: string[] | null;
  user_rating: number | null;
  critic_score: number | null;
  us_rating: string | null;
  poster: string | null;
  posterMedium: string | null;
  posterLarge: string | null;
  backdrop: string | null;
  trailer: string | null;
  trailer_thumbnail: string | null;
  sources?: WatchmodeSource[];
}

const imdbSourcesCache = new Map<string, WatchmodeSource[]>();
const sourcesListCache = new Map<string, WatchmodeSourceListItem[]>();
const titleDetailsCache = new Map<string, WatchmodeTitleDetails>();
const titleSourcesCache = new Map<string, WatchmodeSource[]>();

let detectedRegion: string | null = null;
let regionDetectionPromise: Promise<string> | null = null;

// Detect which regions are available on the current API key
export async function detectAvailableRegion(): Promise<string> {
  if (detectedRegion) return detectedRegion;
  if (regionDetectionPromise) return regionDetectionPromise;

  regionDetectionPromise = (async () => {
    const regions = ['IN', 'GB', 'CA', 'AU', 'US', 'DE', 'FR', 'JP', 'BR', 'MX', 'ES', 'IT', 'NZ'];
    
    for (const region of regions) {
      try {
        console.log(`[Watchmode] Testing region: ${region}`);
        const data = await fetchJson<WatchmodeListTitlesResponse>('/list-titles/', {
          types: 'movie',
          regions: region,
          limit: 1,
          page: 1,
        });
        
        if (data && data.titles) {
          console.log(`[Watchmode] ✓ Region ${region} is available`);
          detectedRegion = region;
          return region;
        }
      } catch (err: any) {
        if (err?.message?.includes('not enabled')) {
          console.log(`[Watchmode] ✗ Region ${region} not enabled for this API key`);
        } else {
          console.log(`[Watchmode] ✗ Region ${region} test failed:`, err?.message?.slice(0, 80));
        }
      }
    }
    
    // Fallback to first available
    console.warn('[Watchmode] No region detected, using IN as default');
    detectedRegion = 'IN';
    return 'IN';
  })();

  return regionDetectionPromise;
}

// Get the detected region without waiting (returns cached or default)
export function getDetectedRegion(): string {
  return detectedRegion || 'IN';
}


export async function fetchWatchmodeSources(imdbId: string): Promise<WatchmodeSource[]> {
  if (imdbSourcesCache.has(imdbId)) {
    return imdbSourcesCache.get(imdbId)!;
  }

  try {
    // Step 1: Find Watchmode ID by IMDb ID
    const searchData = await fetchJson<{ title_results?: Array<{ id: number }> }>(
      '/search/',
      { search_field: 'imdb_id', search_value: imdbId }
    );

    if (!searchData.title_results || searchData.title_results.length === 0) {
      return [];
    }

    const watchmodeId = searchData.title_results[0].id;

    // Step 2: Get sources for the Watchmode ID
    const sourcesData = await fetchJson<unknown>(`/title/${watchmodeId}/sources/`);

    if (!Array.isArray(sourcesData)) {
      return [];
    }

    // Filter to unique sources (by name and type)
    const uniqueSources = sourcesData.reduce((acc: WatchmodeSource[], current: WatchmodeSource) => {
      const isDuplicate = acc.find(item => item.name === current.name && item.type === current.type);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    imdbSourcesCache.set(imdbId, uniqueSources);
    return uniqueSources;
  } catch (error) {
    console.error('Error fetching Watchmode sources:', error);
    return [];
  }
}

export async function fetchSourcesList(regions = 'US', types = 'sub'): Promise<WatchmodeSourceListItem[]> {
  const cacheKey = `${regions}::${types}`;
  if (sourcesListCache.has(cacheKey)) return sourcesListCache.get(cacheKey)!;
  try {
    const data = await fetchJson<WatchmodeSourceListItem[]>('/sources/', { regions, types });
    sourcesListCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('[Watchmode] Error fetching sources list:', error);
    return [];
  }
}

export function resolveProviderSourceIds(platformName: string, sources: WatchmodeSourceListItem[]): number[] {
  const normalized = platformName.trim().toLowerCase();
  const aliases: string[] = (() => {
    if (normalized === 'prime video') return ['amazon prime', 'amazon prime video', 'prime video'];
    if (normalized === 'disney+') return ['disney plus', 'disney+'];
    if (normalized === 'hbo max') return ['hbo max', 'max'];
    if (normalized === 'apple tv+') return ['appletv+', 'apple tv+', 'apple tv plus'];
    return [platformName];
  })().map(a => a.trim().toLowerCase());

  const matches = sources.filter(s => aliases.includes(s.name.trim().toLowerCase()));
  return matches.map(m => m.id);
}

export async function listTitles(params: {
  types: string;
  regions: string;
  sort_by?: string;
  source_types?: string;
  source_ids?: string;
  page?: number;
  limit?: number;
}): Promise<WatchmodeListTitlesResponse> {
  return fetchJson<WatchmodeListTitlesResponse>('/list-titles/', {
    types: params.types,
    regions: params.regions,
    sort_by: params.sort_by,
    source_types: params.source_types,
    source_ids: params.source_ids,
    page: params.page ?? 1,
    limit: params.limit ?? 50,
  });
}

export async function fetchTitleDetails(titleId: number, regions = 'US', includeSources = true): Promise<WatchmodeTitleDetails> {
  const cacheKey = `${titleId}::${regions}::${includeSources ? 'sources' : 'base'}`;
  if (titleDetailsCache.has(cacheKey)) return titleDetailsCache.get(cacheKey)!;

  const data = await fetchJson<WatchmodeTitleDetails>(`/title/${titleId}/details/`, {
    append_to_response: includeSources ? 'sources' : undefined,
    regions: includeSources ? regions : undefined,
  });
  titleDetailsCache.set(cacheKey, data);
  return data;
}

export async function fetchTitleSources(titleId: number, regions = 'US'): Promise<WatchmodeSource[]> {
  const cacheKey = `${titleId}::${regions}`;
  if (titleSourcesCache.has(cacheKey)) return titleSourcesCache.get(cacheKey)!;
  try {
    const data = await fetchJson<WatchmodeSource[]>(`/title/${titleId}/sources/`, { regions });
    titleSourcesCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('[Watchmode] Error fetching title sources:', error);
    return [];
  }
}
