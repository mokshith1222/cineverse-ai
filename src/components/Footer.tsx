import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Github, Twitter, Instagram } from 'lucide-react';
import { fallbackCmsHome } from '../cms/fallbackContent';
import { fetchHomeCms } from '../cms/sanityClient';
import type { CmsFooter } from '../cms/types';

export default function Footer() {
  const [footer, setFooter] = useState<CmsFooter>(fallbackCmsHome.footer);

  useEffect(() => {
    let cancelled = false;
    fetchHomeCms().then(payload => {
      if (!cancelled) setFooter(payload.footer);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const socialIcons = [Github, Twitter, Instagram];

  return (
    <footer className="bg-gray-950 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Cine</span>
                <span className="text-cyan-400">Verse</span>
                <span className="text-cyan-300 text-xs font-medium ml-1">AI</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {footer.description}
            </p>
            <div className="flex gap-3 mt-4">
              {footer.socialLinks.map((link, i) => {
                const Icon = socialIcons[i % socialIcons.length];
                return (
                <a key={link.id} href={link.href} aria-label={link.label} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-white text-sm font-semibold mb-3">Discover</h2>
            <ul className="space-y-2">
              {[
                { to: '/movies', label: 'Movies' },
                { to: '/anime', label: 'Anime' },
                { to: '/trailers', label: 'Trailers' },
                { to: '/editorial-picks', label: 'Editorial Picks' },
                { to: '/weekly-picks', label: 'Weekly Picks' },
                { to: '/ott', label: 'OTT Tracker' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-white text-sm font-semibold mb-3">Company</h2>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-white text-sm font-semibold mb-3">Legal</h2>
            <ul className="space-y-2">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/disclaimer', label: 'Disclaimer' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-gray-400 text-xs">© 2026 CineVerse AI. All rights reserved.</p>
            <p className="text-gray-300 text-xs">Built for entertainment enthusiasts</p>
          </div>
          <p className="text-gray-300 text-xs text-center sm:text-left">{footer.attribution}</p>
          <p className="text-gray-300 text-xs text-center sm:text-left">
            Cookie notice: CineVerse may use cookies for essential functionality, analytics, and (where enabled) advertising. Data is provided by third-party APIs and may be inaccurate. CineVerse does not host or stream media. See{' '}
            <Link to="/privacy" className="text-cyan-400 underline hover:no-underline">Privacy</Link>
            {' '}and{' '}
            <Link to="/disclaimer" className="text-cyan-400 underline hover:no-underline">Disclaimer</Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
