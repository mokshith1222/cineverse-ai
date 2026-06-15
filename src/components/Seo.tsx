import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function ensureMeta(selector: string, createAttr: 'name' | 'property', value: string) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) return existing;

  const meta = document.createElement('meta');
  meta.setAttribute(createAttr, value);
  document.head.appendChild(meta);
  return meta;
}

function setMeta(selector: string, createAttr: 'name' | 'property', value: string, content: string) {
  ensureMeta(selector, createAttr, value).setAttribute('content', content);
}

export default function Seo({
  title,
  description,
  keywords = 'cineverse, cineverse ai, ai movie recommendations, anime finder, ott tracker, where to watch movies, tv shows, trailer discovery, search anime, stream intelligence',
  image = 'https://cineverse-ai-gules.vercel.app/preview.jpg',
  url,
  type = 'website',
  noIndex = false,
  schema,
}: SeoProps) {
  useEffect(() => {
    // Standard Tags
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph / Facebook
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    
    // Twitter Card
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    const resolvedUrl = url || window.location.href;
    setMeta('meta[property="og:url"]', 'property', 'og:url', resolvedUrl);
    setMeta('meta[name="twitter:url"]', 'name', 'twitter:url', resolvedUrl);

    const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', resolvedUrl);
    } else {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = resolvedUrl;
      document.head.appendChild(canonical);
    }

    const existingSchema = document.head.querySelector<HTMLScriptElement>('script[data-cineverse-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.cineverseSchema = 'true';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [description, image, keywords, noIndex, schema, title, type, url]);

  return null;
}
