# CineVerse AI Production Architecture

## Client-Managed CMS

Sanity schemas live in `sanity/schemas` and cover hero slides, banners, featured movies, trending controls, anime controls, trailers, editor picks, blog posts, SEO metadata, footer content, social links, ad slots, categories, and site settings.

Clients manage visible sections, trailer YouTube IDs, ad placements, footer copy, API provider preferences, and feature toggles from Sanity Studio. The app reads public CMS content through `src/cms/sanityClient.ts` and falls back to `src/cms/fallbackContent.ts` when Sanity is unavailable.

Required environment variables:

```env
VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=production
VITE_SANITY_READ_TOKEN=
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=production
```

## API Failover

Movie requests use the secure proxy path first:

- `/api/omdb` in local Vite
- `/.netlify/functions/omdb` in deployed/static environments
- browser OMDb fallback only when the proxy is unavailable
- backup movie key support through `VITE_BACKUP_MOVIE_API_KEY`
- TVDB backup in the Vite proxy through `TVDB_API_KEY`

Failover detects `403`, `429`, `quotaExceeded`, request limit messages, `5xx`, failed fetches, and invalid JSON. Client-side requests are cached in memory and session storage, with in-flight request deduplication.

## Trailer Strategy

Trailers should be stored as direct YouTube IDs in Sanity. This avoids expensive YouTube `search.list` calls. The YouTube search fallback is disabled by default and only runs when:

```env
VITE_FEATURE_TRAILER_SEARCH_FALLBACK=true
```

Trailer cards use lazy thumbnails, direct embeds, and cached lookup results.

## AI Upgrade Path

`src/features/aiRecommendations.ts` provides a deterministic recommendation layer today. It is intentionally shaped like a provider boundary so it can later call:

- OpenAI recommendations
- Supabase vector search
- embedding similarity
- personalization from watchlist/history

Toggle with:

```env
VITE_FEATURE_AI_RECOMMENDATIONS=true
VITE_FEATURE_AI_SEARCH=true
VITE_FEATURE_SMART_TRENDING=true
```

## AdSense Safety

The app includes privacy, terms, about, contact, and disclaimer pages, plus footer attribution stating that CineVerse does not host or stream media. Ad slots are CMS-managed and hidden unless both the CMS slot and `VITE_FEATURE_ADS` are enabled.
