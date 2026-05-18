import type { Trailer } from '../types';
import type { FeaturedHeroItem } from '../components/HeroSection';
import type { FeatureFlags, ProviderConfig } from '../config/platform';

export interface CmsImage {
  url: string;
  alt?: string;
}

export interface CmsBanner {
  id: string;
  title: string;
  subtitle?: string;
  image?: CmsImage;
  href?: string;
  visible: boolean;
  placement: 'homepage' | 'trending' | 'anime' | 'trailers' | 'ad';
}

export interface CmsAdSlot {
  id: string;
  name: string;
  placement: 'homepage-top' | 'homepage-inline' | 'sidebar' | 'footer';
  enabled: boolean;
  label: string;
  html?: string;
}

export interface CmsSocialLink {
  id: string;
  label: string;
  href: string;
}

export interface CmsFooter {
  description: string;
  attribution: string;
  socialLinks: CmsSocialLink[];
}

export interface CmsHomePayload {
  hero: FeaturedHeroItem[];
  banners: CmsBanner[];
  featuredTrailers: Trailer[];
  editorPicks: FeaturedHeroItem[];
  footer: CmsFooter;
  adSlots: CmsAdSlot[];
  featureFlags?: Partial<FeatureFlags>;
  providers?: Partial<ProviderConfig>;
  seo: {
    title: string;
    description: string;
    image?: string;
  };
}
