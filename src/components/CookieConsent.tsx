import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cineverse_cookie_consent');
    if (!hasConsented) {
      // Small delay to ensure it doesn't block initial render abruptly
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cineverse_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pb-20 sm:pb-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 animate-in slide-in-from-bottom-10 fade-in duration-500 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          
          <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400">
            <Cookie className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">We value your privacy</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies. 
              Read our <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link> for more information.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors whitespace-nowrap"
            >
              Accept All
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors flex items-center justify-center sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => setIsVisible(false)}
            className="hidden sm:flex absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
