export type AnalyticsEventType = 'search' | 'view' | 'genre';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  label: string;
  target?: string;
  createdAt: number;
}

const STORAGE_KEY = 'cineverse-analytics-events';
const MAX_EVENTS = 500;

function readEvents(): AnalyticsEvent[] {
  try {
    const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as AnalyticsEvent[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    /* ignore */
  }
}

export function trackEvent(type: AnalyticsEventType, label: string, target?: string) {
  const clean = label.trim();
  if (!clean) return;
  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    label: clean,
    target,
    createdAt: Date.now(),
  };
  writeEvents([event, ...readEvents()]);
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return readEvents();
}

export function clearAnalyticsEvents() {
  writeEvents([]);
}

export function topCounts(events: AnalyticsEvent[], type: AnalyticsEventType, limit = 8) {
  const counts = new Map<string, { label: string; count: number; target?: string }>();
  events
    .filter(event => event.type === type)
    .forEach(event => {
      const key = event.label.toLowerCase();
      const current = counts.get(key) || { label: event.label, count: 0, target: event.target };
      counts.set(key, { ...current, count: current.count + 1, target: current.target || event.target });
    });
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}
