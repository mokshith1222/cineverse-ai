import type { TvAiringRow, TvEpisode, TvShow } from '../types';
import type { TvMazeEpisode, TvMazeShow } from './tvmazeTypes';

const POSTER_FALLBACK =
  'https://placehold.co/400x600/111827/6b7280/png?text=No+Poster';

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parsePremiereYear(premiered: string | null | undefined): number {
  if (!premiered) return 0;
  const y = parseInt(premiered.slice(0, 4), 10);
  return Number.isFinite(y) ? y : 0;
}

export function mapTvMazeShow(show: TvMazeShow): TvShow {
  const poster =
    show.image?.medium ||
    show.image?.original ||
    POSTER_FALLBACK;

  const backdrop = show.image?.original || show.image?.medium || poster;

  const runtime =
    typeof show.averageRuntime === 'number' && show.averageRuntime > 0
      ? show.averageRuntime
      : typeof show.runtime === 'number' && show.runtime > 0
        ? show.runtime
        : null;

  const net =
    show.network?.name?.trim() ||
    show.webChannel?.name?.trim() ||
    undefined;

  return {
    id: show.id,
    title: show.name,
    poster,
    backdrop,
    rating: typeof show.rating?.average === 'number' ? show.rating.average : 0,
    year: parsePremiereYear(show.premiered),
    genre: show.genres ?? [],
    description: stripHtml(show.summary),
    runtimeMinutes: runtime,
    status: show.status,
    network: net,
  };
}

/** Resolve nested show payload from schedule/web payloads. */
export function scheduleEntryShow(ep: TvMazeEpisode): TvMazeShow | null {
  const s = ep.show ?? ep._embedded?.show;
  return s ?? null;
}

export function airingRowsFromEpisodes(
  episodes: TvMazeEpisode[],
  source: TvAiringRow['source'],
): TvAiringRow[] {
  const rows: TvAiringRow[] = [];
  for (const ep of episodes) {
    const raw = scheduleEntryShow(ep);
    if (!raw) continue;
    rows.push({
      show: mapTvMazeShow(raw),
      episode: mapTvMazeEpisode(ep),
      source,
    });
  }
  return rows;
}

export function dedupeAiringRows(rows: TvAiringRow[]): TvAiringRow[] {
  const seen = new Set<string>();
  const out: TvAiringRow[] = [];
  for (const r of rows) {
    const k = `${r.show.id}:${r.episode.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function normalizeAirtimeForParse(t: string): string {
  const trimmed = t.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return '12:00:00';
}

export function episodeAirTimestamp(ep: TvEpisode): number | null {
  if (ep.airstamp) {
    const t = Date.parse(ep.airstamp);
    return Number.isNaN(t) ? null : t;
  }
  if (ep.airdate) {
    const timePart = ep.airtime?.trim() ? normalizeAirtimeForParse(ep.airtime) : '12:00:00';
    const t = Date.parse(`${ep.airdate}T${timePart}`);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export function sortAiringRows(rows: TvAiringRow[]): TvAiringRow[] {
  return [...rows].sort((a, b) => {
    const ta = episodeAirTimestamp(a.episode) ?? Number.MAX_SAFE_INTEGER;
    const tb = episodeAirTimestamp(b.episode) ?? Number.MAX_SAFE_INTEGER;
    return ta - tb;
  });
}

export function isSameLocalDay(ep: TvEpisode, ymd: string): boolean {
  const ts = episodeAirTimestamp(ep);
  if (ts !== null) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}` === ymd;
  }
  return ep.airdate === ymd;
}

export function trendingShowsFromSchedule(rows: TvAiringRow[], limit = 14): TvShow[] {
  const seen = new Set<number>();
  const out: TvShow[] = [];
  for (const r of rows) {
    if (seen.has(r.show.id)) continue;
    seen.add(r.show.id);
    out.push(r.show);
    if (out.length >= limit) break;
  }
  return out;
}

export function dedupeShows(shows: TvShow[]): TvShow[] {
  const m = new Map<number, TvShow>();
  for (const s of shows) {
    if (!m.has(s.id)) m.set(s.id, s);
  }
  return [...m.values()];
}

export function mapTvMazeEpisode(ep: TvMazeEpisode): TvEpisode {
  return {
    id: ep.id,
    name: ep.name ?? 'Episode',
    season: typeof ep.season === 'number' ? ep.season : 0,
    number: ep.number ?? null,
    airdate: ep.airdate ?? null,
    airtime: ep.airtime ?? null,
    airstamp: ep.airstamp ?? null,
    runtime: typeof ep.runtime === 'number' ? ep.runtime : null,
    summary: stripHtml(ep.summary),
    imageMedium: ep.image?.medium ?? ep.image?.original ?? null,
  };
}
