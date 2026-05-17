import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const OMDB_BASE = 'https://www.omdbapi.com/';
const TVDB_BASE = 'https://api4.thetvdb.com/v4';
const LIMIT_PATTERN = /request limit reached|quotaexceeded|quota exceeded|rate limit|too many requests/i;

function isFailoverStatus(status: number): boolean {
  return status === 403 || status === 429 || status >= 500;
}

function isFailoverBody(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const record = body as Record<string, unknown>;
  const error = typeof record.Error === 'string'
    ? record.Error
    : typeof record.error === 'string'
      ? record.error
      : '';
  return record.Response === 'False' && LIMIT_PATTERN.test(error);
}

function omdbDevProxy(): Plugin {
  return {
    name: 'cineverse-omdb-dev-proxy',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const primaryKey = env.PRIMARY_MOVIE_API_KEY || env.VITE_OMDB_API_KEY || env.OMDB_API_KEY;
      const tvdbKey = env.TVDB_API_KEY;
      let tvdbToken: { value: string; expires: number } | null = null;

      async function getTvdbToken(): Promise<string | null> {
        if (!tvdbKey) return null;
        if (tvdbToken && tvdbToken.expires > Date.now()) return tvdbToken.value;

        const response = await fetch(`${TVDB_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apikey: tvdbKey }),
        });
        const body = await response.json().catch(() => null) as { data?: { token?: string } } | null;
        const token = body?.data?.token;
        if (!response.ok || !token) {
          console.error('[TVDB proxy] login failed', { status: response.status });
          return null;
        }

        tvdbToken = { value: token, expires: Date.now() + 25 * 24 * 60 * 60 * 1000 };
        return token;
      }

      function tvdbImageUrl(value: unknown): string {
        if (typeof value !== 'string' || !value) return 'N/A';
        if (value.startsWith('http')) return value;
        return `https://artworks.thetvdb.com${value.startsWith('/') ? value : `/${value}`}`;
      }

      function tvdbYear(value: unknown): string {
        if (typeof value === 'number') return String(value);
        if (typeof value === 'string') {
          const match = value.match(/\d{4}/);
          return match?.[0] || 'N/A';
        }
        return 'N/A';
      }

      async function callTvdbFallback(params: URLSearchParams) {
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
        const body = await response.json().catch(() => null) as { data?: Array<Record<string, unknown>> } | null;
        const rows = Array.isArray(body?.data) ? body.data : [];
        if (!response.ok || (!tvdbID && rows.length === 0) || (tvdbID && !body?.data)) {
          console.error('[TVDB proxy] fallback search failed or empty', { status: response.status });
          return null;
        }

        if (tvdbID) {
          const row = body?.data as Record<string, unknown>;
          const genres = Array.isArray(row.genres)
            ? row.genres
                .map(genre => typeof genre === 'object' && genre ? (genre as Record<string, unknown>).name : genre)
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

      server.middlewares.use('/api/omdb', async (req, res) => {
        try {
          const requestUrl = new URL(req.url || '', 'http://localhost');
          const params = new URLSearchParams(requestUrl.search);

          async function callOmdb(key: string, label: 'primary' | 'backup') {
            const url = new URL(OMDB_BASE);
            params.forEach((value, name) => {
              if (name !== 'apikey') url.searchParams.set(name, value);
            });
            url.searchParams.set('apikey', key);

            const response = await fetch(url);
            const body = await response.json().catch(() => ({ Response: 'False', Error: 'Invalid OMDb response' }));
            return { label, response, body };
          }

          if (!primaryKey && !tvdbKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ Response: 'False', Error: 'Missing PRIMARY_MOVIE_API_KEY and TVDB_API_KEY.' }));
            return;
          }

          let result = primaryKey ? await callOmdb(primaryKey, 'primary') : null;
          const shouldUseBackup = !result
            || isFailoverStatus(result.response.status)
            || isFailoverBody(result.body);

          if (shouldUseBackup && tvdbKey) {
            console.warn('[OMDb proxy] primary API failed, switching to TVDB fallback', {
              status: result?.response.status,
              error: (result?.body as Record<string, unknown> | undefined)?.Error,
            });
            const tvdbBody = await callTvdbFallback(params);
            if (tvdbBody) {
              console.info('[TVDB proxy] fallback success');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'public, max-age=900');
              res.end(JSON.stringify(tvdbBody));
              return;
            } else {
              console.error('[TVDB proxy] fallback failure');
            }
          }

          res.statusCode = result?.response.status || 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', result?.response.ok ? 'public, max-age=900' : 'no-store');
          res.end(JSON.stringify(result?.body || { Response: 'False', Error: 'OMDb proxy failed.' }));
        } catch (error) {
          console.error('[OMDb proxy] failed fetch', error);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ Response: 'False', Error: 'OMDb proxy request failed.' }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), omdbDevProxy()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
