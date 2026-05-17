import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

function labelFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 'Home';
  if (parts[0] === 'movies' && parts[1]) return `Movie ${parts[1]}`;
  if (parts[0] === 'anime' && parts[1]) return `Anime ${parts[1]}`;
  if (parts[0] === 'tv' && parts[1]) return `TV ${parts[1]}`;
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' / ');
}

export default function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('view', labelFromPath(location.pathname), `${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
