import type { TvAiringRow } from '../types';
import { getSchedule, getWebSchedule } from './tvmaze';
import type { TvMazeEpisode } from './tvmazeTypes';
import {
  airingRowsFromEpisodes,
  dedupeAiringRows,
  sortAiringRows,
} from './tvmazeMap';

export function scheduleCountryCode(): string {
  const raw = import.meta.env.VITE_TVMAZE_SCHEDULE_COUNTRY?.trim();
  return raw && raw.length >= 2 ? raw : 'US';
}

export function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(base: Date, days: number): Date {
  const x = new Date(base);
  x.setDate(x.getDate() + days);
  return x;
}

/**
 * Loads merged broadcast + streaming schedules for consecutive local calendar days (cached per HTTP request).
 */
export async function fetchAiringWindow(country: string, startDayOffset: number, dayCount: number): Promise<TvAiringRow[]> {
  const dates = Array.from({ length: dayCount }, (_, i) =>
    formatLocalYmd(addDays(new Date(), startDayOffset + i)),
  );

  const chunks = await Promise.all(
    dates.map(async date => {
      const [broadcast, web] = await Promise.all([
        getSchedule(country, date).catch(() => [] as TvMazeEpisode[]),
        getWebSchedule(date).catch(() => [] as TvMazeEpisode[]),
      ]);
      return [
        ...airingRowsFromEpisodes(broadcast, 'broadcast'),
        ...airingRowsFromEpisodes(web, 'streaming'),
      ];
    }),
  );

  return sortAiringRows(dedupeAiringRows(chunks.flat()));
}
