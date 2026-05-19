export interface OpenRouterMovieRecommendation {
  title: string;
  year?: string;
  genre?: string;
  language?: string;
  reason: string;
  searchQuery?: string;
}

const OPENROUTER_PROXY_ENDPOINT = '/.netlify/functions/openrouter';

function normalizeRecommendation(item: Partial<OpenRouterMovieRecommendation> & { title?: string; reason?: string }): OpenRouterMovieRecommendation | null {
  const title = item.title?.trim();
  const reason = item.reason?.trim();

  if (!title || !reason) return null;

  return {
    title,
    year: item.year?.trim() || undefined,
    genre: item.genre?.trim() || undefined,
    language: item.language?.trim() || undefined,
    reason,
    searchQuery: item.searchQuery?.trim() || title,
  };
}

function parseRecommendations(payload: unknown): OpenRouterMovieRecommendation[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as { recommendations?: unknown };
  if (!Array.isArray(record.recommendations)) return [];
  return record.recommendations.map(item => normalizeRecommendation(item as Partial<OpenRouterMovieRecommendation> & { title?: string; reason?: string })).filter((item): item is OpenRouterMovieRecommendation => Boolean(item));
}

export async function fetchOpenRouterMovieRecommendations(prompt: string): Promise<OpenRouterMovieRecommendation[]> {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    throw new Error('Enter a movie prompt to generate recommendations.');
  }

  const response = await fetch(OPENROUTER_PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: trimmedPrompt,
    }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errorBody = (await response.json()) as { error?: { message?: string } };
      detail = errorBody.error?.message || detail;
    } catch {
      const text = await response.text();
      if (text.trim()) detail = text.trim();
    }

    throw new Error(`OpenRouter request failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as unknown;
  const recommendations = parseRecommendations(data);
  if (recommendations.length === 0) {
    throw new Error('Could not parse movie recommendations from the recommendation service.');
  }

  return recommendations;
}