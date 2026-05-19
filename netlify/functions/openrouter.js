const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'deepseek/deepseek-chat';
const DEFAULT_RECOMMENDATION_COUNT = 6;

function getApiKey() {
  return process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
}

function buildMessages(prompt) {
  return [
    {
      role: 'system',
      content: [
        'You are CineVerse AI, a movie recommendation assistant.',
        'Return only valid JSON with this exact shape:',
        '{"recommendations":[{"title":"string","year":"string","genre":"string","language":"string","reason":"string","searchQuery":"string"}]}',
        `Recommend exactly ${DEFAULT_RECOMMENDATION_COUNT} movies when possible.`,
        'Keep each reason concise and practical.',
        'Focus on films, not TV shows or anime.',
        'Use searchQuery when it helps users find the title inside CineVerse.',
      ].join(' '),
    },
    { role: 'user', content: prompt },
  ];
}

function normalizeRecommendation(item) {
  if (!item || typeof item !== 'object') return null;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const reason = typeof item.reason === 'string' ? item.reason.trim() : '';
  if (!title || !reason) return null;

  return {
    title,
    year: typeof item.year === 'string' && item.year.trim() ? item.year.trim() : undefined,
    genre: typeof item.genre === 'string' && item.genre.trim() ? item.genre.trim() : undefined,
    language: typeof item.language === 'string' && item.language.trim() ? item.language.trim() : undefined,
    reason,
    searchQuery: typeof item.searchQuery === 'string' && item.searchQuery.trim() ? item.searchQuery.trim() : title,
  };
}

function stripCodeFences(content) {
  const text = typeof content === 'string' ? content : '';
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() || text.trim();
}

function parseRecommendations(content) {
  const cleaned = stripCodeFences(content);
  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');
  const candidate = objectStart >= 0 && objectEnd > objectStart
    ? cleaned.slice(objectStart, objectEnd + 1)
    : cleaned;

  const parsed = JSON.parse(candidate);
  const rows = Array.isArray(parsed) ? parsed : parsed?.recommendations;
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeRecommendation).filter(Boolean);
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing OPENROUTER_API_KEY environment variable.' }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required.' }),
      };
    }

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || process.env.URL || 'https://cineverse.ai',
        'X-Title': 'CineVerse AI',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: buildMessages(prompt),
        temperature: 0.3,
        max_tokens: 900,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errorBody = await response.json();
        detail = errorBody?.error?.message || detail;
      } catch {
        const text = await response.text();
        if (text.trim()) detail = text.trim();
      }

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `OpenRouter request failed (${response.status}): ${detail}` }),
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'OpenRouter returned an empty response.' }),
      };
    }

    const recommendations = parseRecommendations(content);
    if (recommendations.length === 0) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Could not parse movie recommendations from OpenRouter.' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ recommendations }),
    };
  } catch (error) {
    console.error('[OpenRouter function] failed fetch', error);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'OpenRouter recommendation request failed.' }),
    };
  }
};