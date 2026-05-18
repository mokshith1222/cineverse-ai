import { Link } from 'react-router-dom';
import { AlertOctagon, HelpCircle, HardDrive, Cpu } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';

export default function Disclaimer() {
  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16">
      <Seo
        title="Disclaimer | CineVerse AI"
        description="Read CineVerse AI's disclaimer covering media hosting, third-party APIs, trademarks, advertising, and external links."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title="Disclaimer" 
          subtitle="Legal notices and platform limitations"
          accent="cyan"
          icon={<AlertOctagon className="w-6 h-6" />}
        />

        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4 text-cyan-400">
                <HardDrive className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white">No Media Hosting</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                CineVerse does <strong>not</strong> host, store, stream, or upload any video, film, media file, or torrent. We function strictly as an information index and discovery platform. Trailer content is embedded from third-party platforms (for example, official YouTube channels) when available.
              </p>
            </section>

            <section className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4 text-cyan-400">
                <Cpu className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white">Third-Party APIs & Accuracy</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Metadata, ratings, availability, and other information may be sourced from third-party APIs (for example, OMDb, TVMaze, Watchmode) and may change without notice. While we aim to keep information current, we cannot guarantee accuracy, completeness, or regional availability.
              </p>
            </section>
          </div>

          <section className="bg-gray-900/40 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center gap-3 mb-6 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Trademarks & Affiliations</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              CineVerse is an independent platform and is <strong>not</strong> affiliated with, endorsed by, or partnered with Netflix, Amazon Prime Video, Disney+, HBO, or any other service provider mentioned on this site. All trademarks, logos, and brand names are the property of their respective owners.
            </p>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <p className="text-gray-500 text-xs">
                Brand names and availability information are shown for identification and informational purposes only.
              </p>
            </div>
          </section>

          <section className="bg-gray-900/40 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center gap-3 mb-6 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Cookies & Advertising</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineVerse may use cookies and similar technologies for essential functionality (such as authentication), analytics, and to support advertising. Third-party vendors (including ad networks) may also use cookies to measure performance and deliver relevant ads.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mt-4">
              For details and choices, see our{' '}
              <Link to="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="bg-red-400/5 rounded-3xl p-8 border border-red-400/10">
            <h2 className="text-white font-bold mb-4">External Links</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our Service may contain links to third-party web sites or services that are not owned or controlled by CineVerse. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
            </p>
          </section>

          <div className="bg-cyan-500/5 border border-cyan-400/10 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-xs">
              Questions about this Disclaimer? Contact us at{' '}
              <a href="mailto:mokshithnaik932@gmail.com" className="text-cyan-400 hover:underline">
                mokshithnaik932@gmail.com
              </a>
              .
            </p>
          </div>

          <footer className="text-center pt-8">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
              Standard Compliance Notice - CineVerse AI
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
