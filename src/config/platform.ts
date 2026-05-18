export type ApiProvider = 'omdb' | 'tmdb' | 'tvdb' | 'jikan' | 'tvmaze' | 'watchmode';

export interface FeatureFlags {
  aiRecommendations: boolean;
  aiSearchEnhancement: boolean;
  smartTrending: boolean;
  ads: boolean;
  trailerSearchFallback: boolean;
  ottTracker: boolean;
}

export interface ProviderConfig {
  moviePrimary: ApiProvider;
  movieBackup: ApiProvider;
  animePrimary: ApiProvider;
  tvPrimary: ApiProvider;
}

export interface PlatformConfig {
  brandName: string;
  tagline: string;
  legalName: string;
  supportEmail: string;
  featureFlags: FeatureFlags;
  providers: ProviderConfig;
}

function envBool(name: string, fallback: boolean): boolean {
  const value = import.meta.env[name];
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

export const platformConfig: PlatformConfig = {
  brandName: import.meta.env.VITE_BRAND_NAME || 'CineVerse AI',
  tagline: import.meta.env.VITE_BRAND_TAGLINE || 'AI-powered discovery for movies, anime, TV, and streaming.',
  legalName: import.meta.env.VITE_LEGAL_NAME || 'CineVerse AI',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'hello@cineverse.ai',
  featureFlags: {
    aiRecommendations: envBool('VITE_FEATURE_AI_RECOMMENDATIONS', true),
    aiSearchEnhancement: envBool('VITE_FEATURE_AI_SEARCH', true),
    smartTrending: envBool('VITE_FEATURE_SMART_TRENDING', true),
    ads: envBool('VITE_FEATURE_ADS', false),
    trailerSearchFallback: envBool('VITE_FEATURE_TRAILER_SEARCH_FALLBACK', false),
    ottTracker: envBool('VITE_FEATURE_OTT_TRACKER', true),
  },
  providers: {
    moviePrimary: (import.meta.env.VITE_MOVIE_PRIMARY_PROVIDER || 'omdb') as ApiProvider,
    movieBackup: (import.meta.env.VITE_MOVIE_BACKUP_PROVIDER || 'tvdb') as ApiProvider,
    animePrimary: (import.meta.env.VITE_ANIME_PRIMARY_PROVIDER || 'jikan') as ApiProvider,
    tvPrimary: (import.meta.env.VITE_TV_PRIMARY_PROVIDER || 'tvmaze') as ApiProvider,
  },
};

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return platformConfig.featureFlags[flag];
}
