import { Info, Target, Users, ShieldCheck } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';

export default function About() {
  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title="About Us" 
          subtitle="About CineVerse — an entertainment hub powered by AI"
          accent="cyan"
          icon={<Info className="w-6 h-6" />}
        />

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
              At CineVerse, our mission is to simplify the way you discover and track entertainment. In an era of streaming fragmentation, we provide a unified platform to browse movies, anime, and TV shows while managing your OTT subscriptions seamlessly. We leverage AI to bring you the most relevant content and trending insights across all major streaming services.
            </p>
          </section>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/40 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-cyan-400">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-white">Community First</h3>
              </div>
              <p className="text-gray-500 text-sm">
                Built for enthusiasts, by enthusiasts. We listen to our users to shape the future of digital content discovery.
              </p>
            </div>
            <div className="bg-gray-900/40 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-white">Data Integrity</h3>
              </div>
              <p className="text-gray-500 text-sm">
                We pull data from trusted sources like OMDb, TVMaze, and Watchmode to ensure accuracy and streaming reliability.
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
                "AI-curated trending feeds and personalized watchlists.",
                "Professional OTT tracker for managing episode progress.",
                "Modern, high-performance interface with dark mode as standard."
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
              Founded in 2026. Dedicated to the art of cinematic storytelling.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
