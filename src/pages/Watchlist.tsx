import { useMemo, useState } from 'react';
import { Bookmark, Brain, Film, Layers, PlayCircle, Sparkles, Tv, Zap, Trash2, ArrowRight, BookmarkX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWatchlist, ItemType } from '../contexts/WatchlistContext';
import MovieCard from '../components/MovieCard';
import AnimeCard from '../components/AnimeCard';
import TvCard from '../components/TvCard';
import SectionHeader from '../components/SectionHeader';
import { Movie, Anime, TvShow } from '../types';

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState<ItemType>('movie');
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();

  const filteredItems = watchlist.filter((item) => item.item_type === activeTab);
  const grouped = useMemo(() => ({
    movie: watchlist.filter(item => item.item_type === 'movie'),
    anime: watchlist.filter(item => item.item_type === 'anime'),
    tv: watchlist.filter(item => item.item_type === 'tv'),
  }), [watchlist]);

  const collections = useMemo(() => {
    const titleIncludes = (terms: string[]) => watchlist.filter(item => {
      const title = item.title.toLowerCase();
      return terms.some(term => title.includes(term));
    });

    return [
      { title: 'Action Energy', items: titleIncludes(['war', 'fight', 'hero', 'mission', 'attack', 'dragon']), icon: Zap },
      { title: 'Mystery Mode', items: titleIncludes(['detective', 'night', 'dark', 'death', 'case', 'secret']), icon: Brain },
      { title: 'Comfort Queue', items: titleIncludes(['love', 'family', 'home', 'friend', 'life']), icon: Sparkles },
    ].filter(collection => collection.items.length > 0);
  }, [watchlist]);

  const continueWatching = useMemo(
    () => watchlist.slice(0, 6),
    [watchlist],
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
        <BookmarkX className="w-10 h-10 text-gray-600" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Your watchlist is empty</h2>
      <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm leading-relaxed">
        You haven't added any {activeTab === 'movie' ? 'movies' : activeTab === 'tv' ? 'TV shows' : 'anime'} yet.
      </p>
      <Link
        to={activeTab === 'movie' ? '/movies' : activeTab === 'tv' ? '/tv' : '/anime'}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all transform active:scale-95 shadow-lg shadow-indigo-600/20"
      >
        Browse {activeTab === 'movie' ? 'Movies' : activeTab === 'tv' ? 'TV' : 'Anime'}
        <ArrowRight size={18} />
      </Link>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-900/50 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-in fade-in duration-500">
        {filteredItems.map((item) => {
          // Adapt WatchlistItem to Card props
          if (item.item_type === 'movie') {
            const movie: Movie = {
              id: item.item_id,
              imdbID: item.item_id,
              title: item.title,
              poster: item.poster_url,
              backdrop: '',
              rating: 0,
              year: 0,
              genre: [],
              description: '',
              duration: '',
            };
            return (
              <div key={item.item_id} className="relative group">
                <MovieCard movie={movie} />
                <button
                  onClick={() => removeFromWatchlist(item.item_id, 'movie')}
                  className="absolute top-2 right-2 z-30 p-2 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          } else if (item.item_type === 'anime') {
            const anime: Anime = {
              id: parseInt(item.item_id, 10),
              title: item.title,
              poster: item.poster_url,
              backdrop: '',
              rating: 0,
              year: 0,
              genre: [],
              description: '',
              episodes: 0,
              status: 'Completed',
            };
            return (
              <div key={item.item_id} className="relative group">
                <AnimeCard anime={anime} />
                <button
                  onClick={() => removeFromWatchlist(item.item_id, 'anime')}
                  className="absolute top-2 right-2 z-30 p-2 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          } else {
            const tv: TvShow = {
              id: parseInt(item.item_id, 10),
              title: item.title,
              poster: item.poster_url,
              backdrop: '',
              rating: 0,
              year: 0,
              genre: [],
              description: '',
            };
            return (
              <div key={item.item_id} className="relative group">
                <TvCard show={tv} />
                <button
                  onClick={() => removeFromWatchlist(item.item_id, 'tv')}
                  className="absolute top-2 right-2 z-30 p-2 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const tabs = [
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'anime', label: 'Anime', icon: Zap },
    { id: 'tv', label: 'TV Shows', icon: Tv },
  ];

  return (
    <div className="bg-gray-950 min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        <SectionHeader
          title="Your Watchlist"
          subtitle="All your saved movies, anime, and TV series in one place"
          accent="cyan"
          icon={<Bookmark className="w-6 h-6" />}
        />

        {watchlist.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 mb-10">
            <div className="rounded-xl border border-white/5 bg-gray-900/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h2 className="text-white font-black">Auto Groups</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const count = grouped[tab.id as ItemType].length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ItemType)}
                      className="rounded-lg bg-gray-950/60 border border-white/5 p-3 text-left hover:border-cyan-400/30 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-cyan-400 mb-2" />
                      <p className="text-xl font-black text-white">{count}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-500">{tab.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-900/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-white font-black">Continue Watching</h2>
              </div>
              <div className="space-y-2">
                {continueWatching.slice(0, 4).map(item => (
                  <Link
                    key={`${item.item_type}-${item.item_id}`}
                    to={item.item_type === 'movie' ? `/movies/${item.item_id}` : item.item_type === 'anime' ? `/anime/${item.item_id}` : `/tv/${item.item_id}`}
                    className="flex items-center gap-3 rounded-lg bg-gray-950/60 hover:bg-gray-950 border border-white/5 p-2 transition-colors"
                  >
                    <img src={item.poster_url} alt="" className="w-8 h-11 rounded object-cover bg-gray-800" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.title}</p>
                      <p className="text-[10px] uppercase text-gray-500">{item.item_type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-900/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h2 className="text-white font-black">Smart Collections</h2>
              </div>
              {collections.length > 0 ? (
                <div className="space-y-2">
                  {collections.map(collection => {
                    const Icon = collection.icon;
                    return (
                      <div key={collection.title} className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 p-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-cyan-400" />
                          <p className="text-sm font-bold text-white">{collection.title}</p>
                          <span className="ml-auto text-xs text-cyan-300">{collection.items.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Add more titles and CineVerse will build themed collections automatically.</p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 mb-10 p-1 bg-gray-900/50 rounded-2xl w-fit border border-white/5 backdrop-blur-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ItemType)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Watchlist;
