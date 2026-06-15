export function getOptimizedImageUrl(url: string, width: number = 750) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url;
  
  // Use Vercel Edge Image Optimization
  // We don't check import.meta.env.PROD here because even if we develop locally, 
  // Vercel's Edge API handles external absolute URLs fine! Actually wait, local Vite dev server
  // doesn't have /_vercel route. So we MUST check PROD.
  if (import.meta.env.PROD) {
    return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
  }
  
  return url;
}
