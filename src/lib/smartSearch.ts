export type SearchDomain = 'all' | 'movie' | 'anime' | 'tv';

export interface SearchIntent {
  raw: string;
  query: string;
  domain: SearchDomain;
}

const COMMAND_WORDS = /\b(show me|show|find me|find|search for|search|give me|recommend|recommend me|i want|please)\b/gi;

export function parseSearchIntent(input: string): SearchIntent {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  const domain: SearchDomain =
    /\b(anime|manga)\b/.test(lower)
      ? 'anime'
      : /\b(tv|series|show|shows)\b/.test(lower)
        ? 'tv'
        : /\b(movie|movies|film|films|cinema)\b/.test(lower)
          ? 'movie'
          : 'all';

  const query = raw
    .replace(COMMAND_WORDS, ' ')
    .replace(/\b(anime|manga|tv shows?|series|movies?|films?|cinema)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    raw,
    query: query || raw,
    domain,
  };
}

export function buildSearchUrl(input: string): string {
  const intent = parseSearchIntent(input);
  const params = new URLSearchParams({ q: intent.raw });
  if (intent.domain !== 'all') params.set('type', intent.domain);
  if (intent.query !== intent.raw) params.set('intent', intent.query);
  return `/search?${params.toString()}`;
}
