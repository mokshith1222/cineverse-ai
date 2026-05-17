/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OMDB_API_KEY: string;
  readonly VITE_YOUTUBE_API_KEY: string;
  /** Optional override (default: https://api.jikan.moe/v4) */
  readonly VITE_JIKAN_BASE_URL?: string;
  /** Optional override (default: https://api.tvmaze.com) */
  readonly VITE_TVMAZE_BASE_URL?: string;
  /** ISO country code for TV broadcast schedule (default: US) */
  readonly VITE_TVMAZE_SCHEDULE_COUNTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
