import { Info, Target, Users, ShieldCheck } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';

export default function About() {
  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16">
      <Seo
        title="About CineVerse AI | Editorial Entertainment Discovery"
        description="Learn how CineVerse AI combines live entertainment data, curated editorial recommendations, and a premium browsing experience to help users discover what to watch next."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title="About Us" 
          subtitle="A premium discovery platform that combines live entertainment data with original editorial value"
          accent="cyan"
          icon={<Info className="w-6 h-6" />}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Original value', value: 'Editorial picks' },
            { label: 'Trust first', value: 'Legal pages, disclosures, and no media hosting' },
            { label: 'Product focus', value: 'Discovery, retention, and fast browsing' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">{item.label}</p>
              <p className="mt-2 text-sm font-bold text-white leading-6">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Mission */}
          <section className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Our Mission</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              CineVerse exists to make entertainment discovery feel curated, premium, and worth returning to. We combine live movie, anime, and TV data with editorial collections, mood-based recommendations, and trustworthy legal disclosure so the platform feels like a real startup product instead of a thin API wrapper.
            </p>
          </section>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/40 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-cyan-400">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-white">Editorial-first discovery</h3>
              </div>
              <p className="text-gray-500 text-sm">
                Every recommendation layer is written to help viewers understand why something is worth opening, not just what the title is.
              </p>
            </div>
            <div className="bg-gray-900/40 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-white">Trust and transparency</h3>
              </div>
              <p className="text-gray-500 text-sm">
                We pull data from trusted sources like OMDb, TVMaze, Jikan, Watchmode, and Supabase-backed services, while clearly stating that we do not host or stream media.
              </p>
            </div>
          </div>

          {/* Why CineVerse? */}
          <section className="prose prose-invert max-w-none">
            <h2 className="text-white text-2xl font-black mb-4">Why CineVerse?</h2>
            <div className="grid gap-4">
              {[
                "Unified discovery across all major OTT platforms.",
                "Real-time streaming availability and provider badges.",
                  "Original editorial collections that add real browsing value.",
                  "AI-curated trending feeds and personalized watchlists.",
                "Professional OTT tracker for managing episode progress.",
                  "Modern, high-performance interface with cinematic motion and fast loading states."
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                  <p className="text-gray-400 text-sm m-0">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Founded in 2026. Built as a premium entertainment discovery product with original editorial content and clear trust signals.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
