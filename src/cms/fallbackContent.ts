import { featuredTrailers } from '../data/trailers';
import type { CmsHomePayload } from './types';

export const fallbackCmsHome: CmsHomePayload = {
  hero: [],
  banners: [
    {
      id: 'cms-ready',
      title: 'Client-managed homepage',
      subtitle: 'Hero copy, banners, ad slots, trailer embeds, and section visibility are ready for Sanity Studio.',
      href: '/about',
      visible: true,
      placement: 'homepage',
    },
  ],
  featuredTrailers,
  editorPicks: [],
  footer: {
    description: 'Your AI-powered entertainment hub. Discover movies, anime, TV, and streaming availability in one professional destination.',
    attribution: 'This product uses third-party metadata APIs and does not host or stream copyrighted media.',
    socialLinks: [
      { id: 'twitter', label: 'Twitter', href: '#' },
      { id: 'instagram', label: 'Instagram', href: '#' },
      { id: 'github', label: 'GitHub', href: '#' },
    ],
  },
  adSlots: [
    {
      id: 'homepage-inline',
      name: 'Homepage inline sponsorship',
      placement: 'homepage-inline',
      enabled: false,
      label: 'Advertisement',
    },
  ],
  featureFlags: {
    aiRecommendations: true,
    aiSearchEnhancement: true,
    smartTrending: true,
    ads: false,
    trailerSearchFallback: false,
    ottTracker: true,
  },
  providers: {
    moviePrimary: 'omdb',
    movieBackup: 'tvdb',
    animePrimary: 'jikan',
    tvPrimary: 'tvmaze',
  },
  seo: {
    title: 'CineVerse AI | AI Entertainment Discovery',
    description: 'Discover movies, anime, TV shows, trailers, and streaming availability with a premium AI-powered entertainment platform.',
  },
};
