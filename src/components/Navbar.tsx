import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, Film, Languages, Play, BookMarked, TrendingUp, Search, Menu, X, Zap, MonitorPlay, LogIn, LogOut, User as UserIcon, Bookmark, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { languageOptions, useLanguage } from '../contexts/LanguageContext';
import VoiceSearchButton from './VoiceSearchButton';
import { buildSearchUrl } from '../lib/smartSearch';
import { Logo } from './Logo';

function navActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

const navLinks = [
  { to: '/', labelKey: 'home', icon: TrendingUp },
  { to: '/movies', labelKey: 'movies', icon: Film },
  { to: '/anime', labelKey: 'anime', icon: Zap },
  { to: '/tv', labelKey: 'tv', icon: MonitorPlay },
  { to: '/trailers', labelKey: 'trailers', icon: Play },
  { to: '/editorial-picks', labelKey: 'editorial', icon: Star },
  { to: '/weekly-picks', labelKey: 'weekly', icon: Star },
  { to: '/calendar', labelKey: 'calendar', icon: CalendarDays },
  { to: '/notifications', labelKey: 'notifications', icon: Bell },
  { to: '/ott', labelKey: 'ott', icon: BookMarked },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(buildSearchUrl(query.trim()));
      setSearchOpen(false);
      setQuery('');
    }
  };

  const handleVoiceSearch = (text: string) => {
    const q = text.trim();
    if (!q) return;
    navigate(buildSearchUrl(q));
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-gray-950/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-gradient-to-b from-gray-950/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 min-w-0 items-center justify-center px-4">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap py-1 px-1">
              <div className="flex min-w-max items-center gap-1">
                {navLinks.map(({ to, labelKey, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      navActive(location.pathname, to)
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Try voice or type..."
                  className="bg-gray-800 border border-white/10 text-white placeholder-gray-500 text-sm rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                />
                <VoiceSearchButton
                  onTranscript={handleVoiceSearch}
                  className="p-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-cyan-400/30 transition-all"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(''); }} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <VoiceSearchButton
                  onTranscript={handleVoiceSearch}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-cyan-400/20"
                />
              </div>
            )}

            <div className="hidden md:flex items-center gap-2 ml-2 border-l border-white/10 pl-4">
              <label className="relative flex items-center gap-1 text-gray-400 hover:text-white">
                <Languages className="w-4 h-4" />
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as typeof language)}
                  className="bg-transparent text-xs outline-none cursor-pointer"
                  title="Language"
                >
                  {languageOptions.map(option => (
                    <option key={option.code} value={option.code} className="bg-gray-950 text-white">
                      {option.nativeLabel}
                    </option>
                  ))}
                </select>
              </label>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/watchlist"
                    className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                    title="Watchlist"
                  >
                    <Bookmark className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-cyan-400 truncate max-w-[100px]">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all shadow-lg shadow-cyan-600/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>


            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-950/98 backdrop-blur-xl border-t border-white/5 animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, labelKey, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  navActive(location.pathname, to)
                    ? 'text-cyan-400 bg-cyan-400/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(labelKey)}
              </Link>
            ))}
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400">
              <Languages className="w-4 h-4" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as typeof language)}
                className="bg-gray-900 border border-white/10 rounded-lg px-2 py-1 text-gray-300 outline-none"
              >
                {languageOptions.map(option => (
                  <option key={option.code} value={option.code}>{option.nativeLabel}</option>
                ))}
              </select>
            </label>
            
            <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <Link
                    to="/watchlist"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    Watchlist
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
