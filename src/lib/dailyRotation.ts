export function getDailySeed(offset = 0): number {
  const day = Math.floor(Date.now() / 86400000);
  return day + offset;
}

export function rotateDaily<T>(items: readonly T[], offset = 0): T[] {
  if (items.length === 0) return [];

  const seed = getDailySeed(offset);
  const start = seed % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

export function takeDaily<T>(items: readonly T[], count: number, offset = 0): T[] {
  return rotateDaily(items, offset).slice(0, count);
}