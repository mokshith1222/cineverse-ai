import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BookMarked, Plus, Star, Tv, Check, Clock, X, ChevronDown, Trash2, Search, Loader2, Film, Compass, LayoutGrid, ExternalLink } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { ottPlatforms } from '../data/ott';
import { useOTTTracker, OTTStatus, OTTShow } from '../contexts/OTTTrackerContext';
import { searchMovies } from '../lib/omdb';
import { searchShows as searchTvShows } from '../lib/tvmaze';
import { fetchSourcesList, fetchTitleDetails, listTitles, resolveProviderSourceIds, WatchmodeSource, WatchmodeSourceListItem, WatchmodeTitleDetails, detectAvailableRegion, getDetectedRegion } from '../lib/watchmode';
import { Link } from 'react-router-dom';

const statusConfig = {
  Watching: { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', icon: Tv },
  Completed: { color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: Check },
  'Plan to Watch': { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  Dropped: { color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: X },
};

const statuses = Object.keys(statusConfig) as OTTStatus[];

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatRuntimeMinutes(runtimeMinutes: number | null): string | null {
  if (!runtimeMinutes || runtimeMinutes <= 0) return null;
  const h = Math.floor(runtimeMinutes / 60);
  const m = runtimeMinutes % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function uniqueSourcesById(sources: WatchmodeSource[]): WatchmodeSource[] {
  const seen = new Set<number>();
  const out: WatchmodeSource[] = [];
  for (const s of sources) {
    if (seen.has(s.source_id)) continue;
    seen.add(s.source_id);
    out.push(s);
  }
  return out;
}

function DiscoveryCard({
  title,
  region,
  selectedProviderIds,
  sourceLogoById,
  trackedStatus,
  onTrack,
}: {
  title: WatchmodeTitleDetails;
  region: string;
  selectedProviderIds: number[];
  sourceLogoById: Map<number, string>;
  trackedStatus: OTTStatus | undefined;
  onTrack: () => void;
}) {
  const poster = title.posterMedium || title.posterLarge || title.poster || '';
  const rating = title.user_rating ? Number(title.user_rating.toFixed(1)) : null;
  const runtime = formatRuntimeMinutes(title.runtime_minutes);

  const subSources = uniqueSourcesById(
    (title.sources || []).filter(s => s.type === 'sub' && (!region || s.region === region))
  );

  const topSources = subSources
    .filter(s => (selectedProviderIds.length > 0 ? selectedProviderIds.includes(s.source_id) : true))
    .slice(0, 3);

  const watchUrl = topSources.find(s => !!s.web_url)?.web_url || subSources.find(s => !!s.web_url)?.web_url;
  const internalHref = title.type === 'movie' && title.imdb_id ? `/movies/${title.imdb_id}` : null;

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-white/5 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-500/10 bg-gray-900/20">
      {poster ? (
        <img src={poster} className="w-full h-full object-cover aspect-[2/3]" alt={title.title} loading="lazy" />
      ) : (
        <div className="aspect-[2/3] w-full bg-gray-900/60" />
      )}

      {internalHref && (
        <Link to={internalHref} className="absolute inset-0 z-10" aria-label={`View details for ${title.title}`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Provider Badges */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-[12]">
        {topSources.map(s => {
          const logo = sourceLogoById.get(s.source_id);
          return (
            <div key={`${s.source_id}-${s.name}`} className="bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase flex items-center gap-1">
              {logo ? <img src={logo} alt={s.name} className="w-3 h-3 rounded-sm" loading="lazy" /> : null}
              <span className="truncate max-w-[80px]">{s.name}</span>
            </div>
          );
        })}
      </div>

      {trackedStatus ? (
        <div className="absolute top-2 right-2 z-[12] bg-cyan-500/10 border border-cyan-400/20 px-2 py-1 rounded-lg text-[10px] font-black text-cyan-300">
          {trackedStatus}
        </div>
      ) : null}

      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform z-[12]">
        <h4 className="text-white text-sm font-bold mb-1 line-clamp-1">{title.title}</h4>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 mb-3">
          <span>{title.year || ''}</span>
          <span>•</span>
          <span className="uppercase">{title.type === 'movie' ? 'Movie' : 'TV'}</span>
          {runtime ? (
            <>
              <span>•</span>
              <span>{runtime}</span>
            </>
          ) : null}
          {rating !== null ? (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400"><Star size={10} fill="currentColor" /> {rating}</span>
            </>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onTrack();
            }}
            className="flex-1 py-1.5 bg-cyan-500 text-gray-950 text-[10px] font-black uppercase rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={10} /> Track
          </button>

          {watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors z-[20]"
              aria-label={`Open on provider for ${title.title}`}
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function OTTTracker() {
  const { shows, loading: trackerLoading, addShow, updateShow, removeShow } = useOTTTracker();
  // Set Explore as default so the page doesn't look empty on load
  const [view, setView] = useState<'tracker' | 'explore'>('explore');
  const [filter, setFilter] = useState<OTTStatus | 'All'>('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShow, setNewShow] = useState<Partial<OTTShow>>({ status: 'Plan to Watch', progress: 0, total_episodes: 0 });
  const [adding, setAdding] = useState(false);

  // Detect and store the available region
  const [region, setRegion] = useState<string>(getDetectedRegion());

  // Explore / Discovery state (Watchmode)
  const [sourcesList, setSourcesList] = useState<WatchmodeSourceListItem[]>([]);
  const [discoveryTitles, setDiscoveryTitles] = useState<WatchmodeTitleDetails[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Search logic for Add Show
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const sourceLogoById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of sourcesList) {
      if (s.logo_100px) map.set(s.id, s.logo_100px);
    }
    return map;
  }, [sourcesList]);

  const selectedProviderIds = useMemo(() => {
    if (platformFilter === 'All') return [];
    return resolveProviderSourceIds(platformFilter, sourcesList);
  }, [platformFilter, sourcesList]);

  const trackedStatusByTitle = useMemo(() => {
    const map = new Map<string, OTTStatus>();
    for (const s of shows) {
      map.set(normalizeTitle(s.title), s.status);
    }
    return map;
  }, [shows]);

  // Detect available Watchmode region on mount
  useEffect(() => {
    detectAvailableRegion().then(detectedReg => {
      console.log(`[OTT Tracker] Detected Watchmode region: ${detectedReg}`);
      setRegion(detectedReg);
    }).catch(err => {
      console.error('[OTT Tracker] Region detection failed:', err);
      setRegion('IN'); // Fallback
    });
  }, []);

  useEffect(() => {
    if (view !== 'explore') return;
    if (sourcesList.length > 0) return;
    fetchSourcesList(region, 'sub').then(setSourcesList).catch(() => setSourcesList([]));
  }, [view, region, sourcesList.length]);

  const loadDiscovery = useCallback(async () => {
    if (view !== 'explore') return;
    setDiscoveryLoading(true);
    setDiscoveryError(null);

    try {
      const isProvider = platformFilter !== 'All';
      let sources = sourcesList;
      if (isProvider && sources.length === 0) {
        sources = await fetchSourcesList(region, 'sub');
        setSourcesList(sources);
      }

      const providerIds = isProvider ? resolveProviderSourceIds(platformFilter, sources) : [];

      if (isProvider && providerIds.length === 0) {
        setDiscoveryTitles([]);
        setDiscoveryError(`Could not resolve Watchmode provider for "${platformFilter}". Check your region/API plan.`);
        return;
      }

      const list = await listTitles({
        types: 'movie,tv_series',
        regions: region,
        sort_by: 'popularity_desc',
        source_types: isProvider ? undefined : 'sub',
        source_ids: isProvider ? providerIds.join(',') : undefined,
        limit: 50,
        page: 1,
      });

      const ids = (list.titles || []).map(t => t.id).slice(0, 36);

      const concurrency = 6;
      const results: WatchmodeTitleDetails[] = [];
      let index = 0;

      const workers = Array.from({ length: Math.min(concurrency, ids.length) }).map(async () => {
        while (index < ids.length) {
          const current = ids[index++];
          try {
            const details = await fetchTitleDetails(current, region, true);
            results.push(details);
          } catch (e) {
            // Ignore individual title failures to keep the grid populated.
          }
        }
      });

      await Promise.all(workers);

      // Keep a stable-ish order in case results resolve out of order.
      const byId = new Map(results.map(r => [r.id, r] as const));
      setDiscoveryTitles(ids.map(id => byId.get(id)).filter(Boolean) as WatchmodeTitleDetails[]);
    } catch (err: any) {
      const errMsg = (err?.message || 'Unknown error').trim();
      console.error('[OTT Tracker] Watchmode discovery failed:', err);

      let userMessage = errMsg;
      if (errMsg.includes('VITE_WATCHMODE_API_KEY')) {
        userMessage = 'Missing VITE_WATCHMODE_API_KEY in .env.local. Restart the dev server after updating env files.';
      } else if (errMsg.includes('not enabled')) {
        userMessage = `Watchmode API error: this region is not enabled for your API key. Using region: ${region}`;
      } else if (errMsg.includes('Watchmode API error')) {
        userMessage = errMsg;
      } else if (errMsg.includes('fetch error')) {
        userMessage = `Watchmode network error: ${errMsg}`;
      } else {
        userMessage = `Failed to load OTT content: ${errMsg}`;
      }

      setDiscoveryError(userMessage);
      setDiscoveryTitles([]);
    } finally {
      setDiscoveryLoading(false);
    }
  }, [platformFilter, region, sourcesList, view]);

  useEffect(() => {
    if (view !== 'explore') return;
    // Fetch on entry + whenever provider changes.
    loadDiscovery();
  }, [loadDiscovery, view]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        console.log('OTTTracker: Searching for:', searchQuery);
        const [movieRes, tvRes] = await Promise.all([
          searchMovies(searchQuery).catch((err) => {
             console.error('OMDb Search Error:', err);
             return { movies: [] };
          }),
          searchTvShows(searchQuery).catch((err) => {
             console.error('TVMaze Search Error:', err);
             return [];
          })
        ]);

        const movies = (movieRes as any).movies.map((m: any) => ({
          title: m.title,
          poster: m.poster,
          type: 'Movie',
          year: m.year,
          imdbID: m.imdbID
        }));

        const tvShows = (tvRes as any[]).map((t: any) => ({
          title: t.show.name,
          poster: t.show.image?.medium || t.show.image?.original || '',
          type: 'TV Show',
          year: t.show.premiered?.split('-')[0] || '',
          id: t.show.id
        }));

        const results = [...movies, ...tvShows].slice(0, 8);
        console.log('OTTTracker: Search results found:', results.length);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectShow = (item: any) => {
    setNewShow(prev => ({
      ...prev,
      title: item.title,
      poster_url: item.poster
    }));
    setSearchQuery(item.title);
    setSearchResults([]);
  };

  const filtered = useMemo(() => {
    return shows.filter(s => {
      const statusMatch = filter === 'All' || s.status === filter;
      const platformMatch = platformFilter === 'All' || s.platform === platformFilter;
      return statusMatch && platformMatch;
    });
  }, [shows, filter, platformFilter]);

  const stats = useMemo(() => ({
    total: shows.length,
    watching: shows.filter(s => s.status === 'Watching').length,
    completed: shows.filter(s => s.status === 'Completed').length,
    planToWatch: shows.filter(s => s.status === 'Plan to Watch').length,
  }), [shows]);

  const handleAddShow = async (e: FormEvent) => {
    e.preventDefault();
    if (!newShow.title || !newShow.platform) return;
    
    setAdding(true);
    try {
      await addShow({
        title: newShow.title,
        platform: newShow.platform,
        poster_url: newShow.poster_url || 'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: newShow.status as OTTStatus,
        progress: newShow.progress || 0,
        total_episodes: newShow.total_episodes || 0,
        genre: [],
      });
      setNewShow({ status: 'Plan to Watch', progress: 0, total_episodes: 0 });
      setSearchQuery('');
      setShowAddModal(false);
    } catch (err) {
      console.error('OTTTracker: Error adding show:', err);
    } finally {
      setAdding(false);
    }
  };

  const trackDiscoveryTitle = (t: WatchmodeTitleDetails) => {
    setNewShow({
      title: t.title,
      poster_url: t.posterMedium || t.posterLarge || t.poster || '',
      status: 'Plan to Watch',
      progress: 0,
      total_episodes: 0,
      platform: platformFilter !== 'All' ? platformFilter : undefined,
    });
    setSearchQuery(t.title);
    setShowAddModal(true);
  };

  const handleProgressChange = (id: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    updateShow(id, { progress: next });
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      {/* Header Section */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <SectionHeader
              title={view === 'tracker' ? "OTT Tracker" : "OTT Discovery"}
              subtitle={view === 'tracker' ? "Track your progress across all streaming platforms" : "Browse popular movies & TV with real provider availability"}
              accent="cyan"
              icon={view === 'tracker' ? <BookMarked className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
            />
            
            <div className="flex items-center gap-2 p-1 bg-gray-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
              <button
                onClick={() => setView('tracker')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  view === 'tracker' ? 'bg-cyan-500 text-gray-950 shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={18} />
                My Tracker
              </button>
              <button
                onClick={() => setView('explore')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  view === 'explore' ? 'bg-cyan-500 text-gray-950 shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass size={18} />
                Discover
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {[
              { label: 'Total Library', value: stats.total, color: 'text-white' },
              { label: 'Currently Watching', value: stats.watching, color: 'text-cyan-400' },
              { label: 'Completed', value: stats.completed, color: 'text-green-400' },
              { label: 'Plan to Watch', value: stats.planToWatch, color: 'text-amber-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 text-center group hover:border-white/10 transition-colors">
                <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'tracker' ? (
          <>
            {/* Tracker Filters */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPlatformFilter('All')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    platformFilter === 'All' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-900/50 border-white/5 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  All Platforms
                </button>
                {ottPlatforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlatformFilter(p.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      platformFilter === p.name ? 'border-white/20 text-white shadow-lg shadow-black/20' : 'bg-gray-900/50 border-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                    style={platformFilter === p.name ? { backgroundColor: p.color + '30', borderColor: p.color + '50' } : {}}
                  >
                    <span className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: p.color }}>{p.logo}</span>
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(['All', ...statuses] as const).map(s => {
                  const cfg = s !== 'All' ? statusConfig[s] : null;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        filter === s
                          ? (cfg ? cfg.color : 'bg-white/10 border-white/20 text-white shadow-lg shadow-black/20')
                          : 'bg-gray-900/50 border-white/5 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tracker Content */}
            {trackerLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-900/50 rounded-2xl border border-white/5" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(show => {
                  const cfg = statusConfig[show.status];
                  const StatusIcon = cfg.icon;
                  const progressPercent = show.total_episodes > 0 
                    ? Math.round((show.progress / show.total_episodes) * 100) 
                    : 0;
                  const platform = ottPlatforms.find(p => p.name === show.platform);

                  return (
                    <div key={show.id} className="bg-gray-900/40 backdrop-blur-sm border border-white/5 hover:border-cyan-400/20 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/50 group relative">
                      <div className="flex gap-4 p-4">
                        <div className="relative shrink-0">
                          <img
                            src={show.poster_url}
                            alt={show.title}
                            className="w-20 h-28 object-cover rounded-xl shadow-lg bg-gray-800"
                          />
                          {platform && (
                            <div
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white font-black shadow-lg border border-white/10"
                              style={{ backgroundColor: platform.color, fontSize: '8px' }}
                            >
                              {platform.logo}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-white text-base font-bold leading-tight line-clamp-1">{show.title}</h3>
                            <button
                              onClick={() => removeShow(show.id)}
                              className="shrink-0 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <p className="text-gray-500 text-xs font-medium mt-0.5">{show.platform}</p>

                          <div className="mt-auto space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                                <span>{show.progress} / {show.total_episodes || '?'} EPS</span>
                                <span className="text-cyan-400">{progressPercent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleProgressChange(show.id, show.progress, -1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors font-bold"
                                >
                                    -
                                </button>
                                <button 
                                    onClick={() => handleProgressChange(show.id, show.progress, 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors font-bold"
                                >
                                    +
                                </button>
                              </div>
                            </div>

                            <div className="relative group/status">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${cfg.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {show.status}
                                <ChevronDown className="w-3 h-3 opacity-50" />
                                <select
                                  value={show.status}
                                  onChange={e => updateShow(show.id, { status: e.target.value as OTTStatus })}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                >
                                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-gray-900/20">
                <BookMarked className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500 font-medium">Your tracker is empty</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-cyan-400 text-sm font-bold hover:underline"
                >
                  Add your first show
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Discover (Watchmode) */}
            <div>
              <div className="flex flex-col gap-6 mb-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Discover on OTT</h2>
                    <p className="text-gray-500 text-sm">Popular movies & TV currently available on major providers</p>
                  </div>
                  {discoveryLoading ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                </div>

                {/* Provider filter (API-driven) */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPlatformFilter('All')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      platformFilter === 'All' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-900/50 border-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    All Providers
                  </button>
                  {ottPlatforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatformFilter(p.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        platformFilter === p.name ? 'border-white/20 text-white shadow-lg shadow-black/20' : 'bg-gray-900/50 border-white/5 text-gray-500 hover:text-gray-300'
                      }`}
                      style={platformFilter === p.name ? { backgroundColor: p.color + '30', borderColor: p.color + '50' } : {}}
                    >
                      <span className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: p.color }}>
                        {p.logo || p.name.slice(0, 1)}
                      </span>
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Watch-status filter (combined with provider filter) */}
                <div className="flex flex-wrap gap-2">
                  {(['All', ...statuses] as const).map(s => {
                    const cfg = s !== 'All' ? statusConfig[s] : null;
                    return (
                      <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          filter === s
                            ? (cfg ? cfg.color : 'bg-white/10 border-white/20 text-white shadow-lg shadow-black/20')
                            : 'bg-gray-900/50 border-white/5 text-gray-500 hover:text-gray-300'
                        }`}
                        title={s === 'All' ? 'Show all titles' : 'Only show titles you have tracked with this status'}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {discoveryError && (
                <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-sm mb-8 flex items-center gap-3">
                  <X className="w-5 h-5" />
                  {discoveryError}
                </div>
              )}

              {discoveryLoading && discoveryTitles.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-gray-900/50 rounded-2xl animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : discoveryTitles.length > 0 ? (
                (() => {
                  const filteredTitles = discoveryTitles
                    .filter(t => {
                      if (platformFilter === 'All') return true;
                      if (selectedProviderIds.length === 0) return true;
                      const sources = (t.sources || []).filter(s => s.type === 'sub' && s.region === region);
                      return sources.some(s => selectedProviderIds.includes(s.source_id));
                    })
                    .filter(t => {
                      if (filter === 'All') return true;
                      const tracked = trackedStatusByTitle.get(normalizeTitle(t.title));
                      return tracked === filter;
                    });

                  if (filteredTitles.length === 0 && discoveryTitles.length > 0) {
                    return (
                      <div className="p-6 bg-gray-900/30 border border-white/5 rounded-2xl text-gray-400 text-sm">
                        No titles match the current watch-status filter. Try switching the status filter to “All”.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {filteredTitles.map(t => (
                        <DiscoveryCard
                          key={t.id}
                          title={t}
                          region={region}
                          selectedProviderIds={selectedProviderIds}
                          sourceLogoById={sourceLogoById}
                          trackedStatus={trackedStatusByTitle.get(normalizeTitle(t.title))}
                          onTrack={() => trackDiscoveryTitle(t)}
                        />
                      ))}
                    </div>
                  );
                })()
              ) : !discoveryLoading && (
                <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-gray-900/20">
                  <Compass className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-500 font-medium">No content found</p>
                  <button onClick={loadDiscovery} className="mt-4 text-cyan-400 text-sm font-bold hover:underline">
                    Try refreshing
                  </button>
                </div>
              )}

              <p className="text-gray-700 text-xs mt-8">
                Data provided by Watchmode. Availability may vary by region.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Show Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !adding && setShowAddModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in fade-in duration-300 overflow-visible">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Plus className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-white text-xl font-black tracking-tight">Add to Tracker</h3>
                  <p className="text-gray-500 text-xs">Search for a show or movie to track</p>
               </div>
            </div>

            <form onSubmit={handleAddShow} className="space-y-5">
              <div className="relative">
                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Search Title</label>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                   <input
                     autoFocus
                     required
                     value={searchQuery}
                     onChange={e => {
                       setSearchQuery(e.target.value);
                       if (!newShow.poster_url) setNewShow(prev => ({ ...prev, title: e.target.value }));
                     }}
                     placeholder="Search movies or TV series..."
                     className="w-full bg-gray-800/50 border border-white/10 focus:border-cyan-400/40 text-white placeholder-gray-600 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all"
                   />
                   {isSearching && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                     </div>
                   )}
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectShow(item)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                        >
                          <img src={item.poster || 'https://via.placeholder.com/150'} className="w-10 h-14 object-cover rounded-lg" alt={`${item.title} poster`} loading="lazy" />
                          <div>
                            <p className="text-white text-sm font-bold line-clamp-1">{item.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                              <span className="flex items-center gap-1">
                                {item.type === 'Movie' ? <Film size={10} /> : <Tv size={10} />}
                                {item.type}
                              </span>
                              <span>•</span>
                              <span>{item.year}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Platform</label>
                  <select
                    required
                    value={newShow.platform || ''}
                    onChange={e => setNewShow(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <option value="">Select platform</option>
                    {ottPlatforms.map(p => <option key={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Status</label>
                  <select
                    value={newShow.status || 'Plan to Watch'}
                    onChange={e => setNewShow(prev => ({ ...prev, status: e.target.value as OTTStatus }))}
                    className="w-full bg-gray-800/50 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Episodes Watched</label>
                  <input
                    type="number"
                    min="0"
                    value={newShow.progress || 0}
                    onChange={e => setNewShow(prev => ({ ...prev, progress: parseInt(e.target.value, 10) }))}
                    className="w-full bg-gray-800/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Total Episodes</label>
                  <input
                    type="number"
                    min="1"
                    value={newShow.total_episodes || 0}
                    onChange={e => setNewShow(prev => ({ ...prev, total_episodes: parseInt(e.target.value, 10) }))}
                    className="w-full bg-gray-800/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none"
                  />
                </div>
              </div>

              {newShow.poster_url && (
                <div className="flex items-center gap-3 p-3 bg-cyan-400/5 border border-cyan-400/20 rounded-2xl animate-in slide-in-from-bottom-2">
                   <img src={newShow.poster_url} className="w-12 h-16 object-cover rounded-lg" alt={`${newShow.title} poster`} loading="lazy" />
                   <div className="flex-1">
                      <p className="text-white text-xs font-bold leading-tight">Selected Title</p>
                      <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mt-1">{newShow.title}</p>
                   </div>
                   <button 
                    type="button"
                    onClick={() => {
                      setNewShow(prev => ({ ...prev, title: '', poster_url: '' }));
                      setSearchQuery('');
                    }}
                    className="p-1.5 text-gray-500 hover:text-white"
                   >
                     <X size={16} />
                   </button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newShow.title || !newShow.platform}
                  className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
                >
                  {adding ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
