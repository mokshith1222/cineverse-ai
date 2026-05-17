import React from 'react';
import { X, Lightbulb, Search, Star, Film } from 'lucide-react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in fade-in duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent">
          <div className="flex items-center gap-2 text-cyan-400">
            <Lightbulb className="w-5 h-5" />
            <h2 className="text-lg font-bold tracking-tight">Pro Search Tips</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 text-sm">Smart Searching</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Enter at least 2 characters. OMDb search is global, so try searching by specific keywords for better precision.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 text-sm">Ratings & Metadata</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Search results show basic data. Deep-dive ratings, runtimes, and plot synopses appear once you click a movie card.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 text-sm">Trending Picks</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Clear the search bar to see our curated trending list, powered by OMDb's most popular metadata.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800/50 flex justify-end border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-all transform active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;
