export const config = {
  runtime: 'edge',
};

const OMDB_BASE = 'https://www.omdbapi.com/';
const TVDB_BASE = 'https://api4.thetvdb.com/v4';
const LIMIT_PATTERN = /request limit reached|quotaexceeded|quota exceeded|rate limit|too many requests/i;

let tvdbTokenCache = null;

function isFailoverStatus(status) {
  return status === 403 || status === 429 || status >= 500;
}

function isFailoverBody(body) {
  if (!body || typeof body !== 'object') return false;
  const error = typeof body.Error === 'string'
    ? body.Error
    : typeof body.error === 'string'
      ? body.error
      : '';
  return body.Response === 'False' && LIMIT_PATTERN.test(error);
}

async function callOmdb(searchParams, key, label) {
  const url = new URL(OMDB_BASE);
  searchParams.forEach((value, name) => {
    if (name !== 'apikey') url.searchParams.set(name, value);
  });
  url.searchParams.set('apikey', key);

  const response = await fetch(url);
  const body = await response.json().catch(() => ({
    Response: 'False',
    Error: 'Invalid OMDb response',
  }));

  return { label, response, body };
}

async function getTvdbToken() {
  const tvdbKey = process.env.TVDB_API_KEY;
  if (!tvdbKey) return null;
  if (tvdbTokenCache && tvdbTokenCache.expires > Date.now()) return tvdbTokenCache.value;

  const response = await fetch(`${TVDB_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: tvdbKey }),
  });
  const body = await response.json().catch(() => null);
  const token = body?.data?.token;
  if (!response.ok || !token) {
    console.error('[TVDB function] login failed', { status: response.status });
    return null;
  }

  tvdbTokenCache = { value: token, expires: Date.now() + 25 * 24 * 60 * 60 * 1000 };
  return token;
}

function tvdbImageUrl(value) {
  if (typeof value !== 'string' || !value) return 'N/A';
  if (value.startsWith('http')) return value;
  return `https://artworks.thetvdb.com${value.startsWith('/') ? value : `/${value}`}`;
}

function tvdbYear(value) {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const match = value.match(/\d{4}/);
    return match?.[0] || 'N/A';
  }
  return 'N/A';
}

async function callTvdbFallback(params) {
  const token = await getTvdbToken();
  if (!token) return null;

  const imdbID = params.get('i') || '';
  const tvdbID = params.get('tvdbID') || (imdbID.startsWith('tvdb-') ? imdbID.replace('tvdb-', '') : '');
  const search = params.get('s') || '';
  const discover = params.get('tvdbDiscover') === 'movie';
  const url = new URL(tvdbID ? `${TVDB_BASE}/movies/${tvdbID}/extended` : discover ? `${TVDB_BASE}/movies` : `${TVDB_BASE}/search`);

  if (tvdbID) {
    url.searchParams.set('short', 'true');
  } else if (discover) {
    url.searchParams.set('page', params.get('page') || '0');
  } else if (imdbID) {
    url.searchParams.set('remote_id', imdbID);
    url.searchParams.set('type', 'movie');
    url.searchParams.set('limit', '1');
  } else if (search) {
    url.searchParams.set('query', search);
    url.searchParams.set('type', 'movie');
    url.searchParams.set('limit', '10');
  } else {
    return null;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null);
  const rows = Array.isArray(body?.data) ? body.data : [];
  if (!response.ok || (!tvdbID && rows.length === 0) || (tvdbID && !body?.data)) {
    console.error('[TVDB function] fallback search failed or empty', { status: response.status });
    return null;
  }

  if (tvdbID) {
    const row = body.data;
    const genres = Array.isArray(row.genres)
      ? row.genres
          .map(genre => typeof genre === 'object' && genre ? genre.name : genre)
          .filter(Boolean)
          .join(', ')
      : 'N/A';
    return {
      Title: String(row.name || row.title || 'Untitled'),
      Year: tvdbYear(row.year || row.first_air_time || row.firstAired),
      Rated: 'N/A',
      Released: String(row.first_release?.date || row.firstAired || 'N/A'),
      Runtime: typeof row.runtime === 'number' ? `${row.runtime} min` : 'N/A',
      Genre: genres || 'N/A',
      Director: 'N/A',
      Writer: 'N/A',
      Actors: 'N/A',
      Plot: String(row.overview || ''),
      Poster: tvdbImageUrl(row.image_url || row.image || row.imageUrl),
      imdbRating: 'N/A',
      imdbVotes: 'N/A',
      imdbID: `tvdb-${tvdbID}`,
      Type: 'movie',
      Response: 'True',
    };
  }

  if (imdbID && !discover) {
    const row = rows[0];
    return {
      Title: String(row.name || row.title || 'Untitled'),
      Year: tvdbYear(row.year || row.first_air_time || row.firstAired),
      Rated: 'N/A',
      Released: 'N/A',
      Runtime: 'N/A',
      Genre: 'N/A',
      Director: 'N/A',
      Writer: 'N/A',
      Actors: 'N/A',
      Plot: String(row.overview || ''),
      Poster: tvdbImageUrl(row.image_url || row.image),
      imdbRating: 'N/A',
      imdbVotes: 'N/A',
      imdbID,
      Type: 'movie',
      Response: 'True',
    };
  }

  return {
    Search: rows.map((row, index) => ({
      Title: String(row.name || row.title || 'Untitled'),
      Year: tvdbYear(row.year || row.first_air_time || row.firstAired),
      imdbID: typeof row.remote_id === 'string' && row.remote_id.startsWith('tt')
        ? row.remote_id
        : `tvdb-${String(row.tvdb_id || row.id || index)}`,
      Type: 'movie',
      Poster: tvdbImageUrl(row.image_url || row.image || row.imageUrl),
    })),
    totalResults: String(rows.length),
    Response: 'True',
  };
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const primaryKey = process.env.PRIMARY_MOVIE_API_KEY || process.env.OMDB_API_KEY || process.env.VITE_OMDB_API_KEY;
    const tvdbKey = process.env.TVDB_API_KEY;

    if (!primaryKey && !tvdbKey) {
      return new Response(JSON.stringify({
        Response: 'False',
        Error: 'Missing PRIMARY_MOVIE_API_KEY and TVDB_API_KEY.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    let result = primaryKey ? await callOmdb(params, primaryKey, 'primary') : null;
    const shouldUseBackup = !result
      || isFailoverStatus(result.response.status)
      || isFailoverBody(result.body);

    if (shouldUseBackup && tvdbKey) {
      console.warn('[OMDb function] primary API failed, switching to TVDB fallback');
      const tvdbBody = await callTvdbFallback(params);
      if (tvdbBody) {
        return new Response(JSON.stringify(tvdbBody), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=900',
          },
        });
      }
    }

    return new Response(JSON.stringify(result?.body || {
      Response: 'False',
      Error: 'OMDb function failed.',
    }), {
      status: result?.response.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': result?.response?.ok ? 'public, max-age=900' : 'no-store',
      },
    });
  } catch (error) {
    console.error('[OMDb function] failed fetch', error);
    return new Response(JSON.stringify({
      Response: 'False',
      Error: 'OMDb function request failed.',
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
