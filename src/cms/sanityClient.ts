import { fallbackCmsHome } from './fallbackContent';
import type { CmsHomePayload } from './types';

const SANITY_API_VERSION = '2025-02-19';
const CACHE_TTL_MS = 5 * 60 * 1000;
const MEMORY = new Map<string, { value: unknown; expires: number }>();

function getSanityBase(): string | null {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
  if (!projectId) return null;
  return `https://${projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${dataset}`;
}

function getCached<T>(key: string): T | null {
  const hit = MEMORY.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    MEMORY.delete(key);
    return null;
  }
  return hit.value as T;
}

function remember<T>(key: string, value: T): T {
  MEMORY.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

async function sanityFetch<T>(query: string): Promise<T | null> {
  const base = getSanityBase();
  if (!base) return null;

  const cacheKey = query;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const url = new URL(base);
  url.searchParams.set('query', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      ...(import.meta.env.VITE_SANITY_READ_TOKEN
        ? { Authorization: `Bearer ${import.meta.env.VITE_SANITY_READ_TOKEN}` }
        : {}),
    },
  });

  if (!response.ok) {
    console.warn('[Sanity] CMS request failed', { status: response.status });
    return null;
  }

  const body = await response.json() as { result?: T };
  return body.result ? remember(cacheKey, body.result) : null;
}

const HOME_QUERY = `{
  "hero": *[_type == "heroSection" && enabled == true] | order(priority asc)[0...5] {
    "id": _id, title, "poster": image.asset->url, "backdrop": backdrop.asset->url,
    rating, year, genre, description, duration, href, browseHref, browseLabel, label
  },
  "banners": *[_type == "banner" && visible == true] | order(priority asc) {
    "id": _id, title, subtitle, href, visible, placement, "image": {"url": image.asset->url, "alt": image.alt}
  },
  "featuredTrailers": *[_type == "trailer" && visible == true] | order(priority asc)[0...12] {
    "id": priority, title, "thumbnail": thumbnail.asset->url, youtubeId, type, releaseDate, views
  },
  "editorPicks": *[_type == "editorPick" && visible == true] | order(priority asc)[0...12] {
    "id": _id, title, "poster": image.asset->url, "backdrop": backdrop.asset->url,
    rating, year, genre, description, duration, href, browseHref, browseLabel, label
  },
  "adSlots": *[_type == "adSlot"] | order(priority asc) {
    "id": _id, name, placement, enabled, label, html
  },
  "footer": *[_type == "footerContent"][0] {
    description, attribution,
    "socialLinks": socialLinks[] { "id": _key, label, href }
  },
  "featureFlags": *[_type == "siteSettings"][0].featureFlags,
  "providers": *[_type == "siteSettings"][0].providers,
  "seo": *[_type == "seoMetadata" && slug.current == "home"][0] {
    title, description, "image": image.asset->url
  }
}`;

export async function fetchHomeCms(): Promise<CmsHomePayload> {
  try {
    const cms = await sanityFetch<Partial<CmsHomePayload>>(HOME_QUERY);
    if (!cms) return fallbackCmsHome;

    return {
      ...fallbackCmsHome,
      ...cms,
      hero: cms.hero?.length ? cms.hero : fallbackCmsHome.hero,
      featuredTrailers: cms.featuredTrailers?.length ? cms.featuredTrailers : fallbackCmsHome.featuredTrailers,
      banners: cms.banners ?? fallbackCmsHome.banners,
      footer: cms.footer ?? fallbackCmsHome.footer,
      adSlots: cms.adSlots ?? fallbackCmsHome.adSlots,
      seo: cms.seo ?? fallbackCmsHome.seo,
    };
  } catch (error) {
    console.warn('[Sanity] Falling back to bundled CMS content', error);
    return fallbackCmsHome;
  }
}
