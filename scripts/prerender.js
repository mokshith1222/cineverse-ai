import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

console.log('[Prerender] Starting static page generation...');

// Read the build template index.html
if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('[Prerender] Error: dist/index.html not found! Run "vite build" first.');
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

// Shared components - Navbar and Footer
const navbarHtml = `
<nav class="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 border-b border-white/5 shadow-2xl">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between gap-3 h-16">
      <a href="/" class="flex items-center gap-2 mb-0">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect><polyline points="17 2 21 7 12 7"></polyline><polyline points="7 2 11 7 2 7"></polyline><path d="M2 12h20"></path><path d="M2 17h20"></path><path d="M8 12v10"></path><path d="M16 12v10"></path></svg>
        </div>
        <span class="text-xl font-bold">
          <span class="text-white">Cine</span>
          <span class="text-cyan-400">Verse</span>
          <span class="text-cyan-300 text-xs font-medium ml-1">AI</span>
        </span>
      </a>
      <div class="hidden md:flex flex-1 min-w-0 items-center justify-center px-4">
        <div class="flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap py-1 px-1">
          <div class="flex min-w-max items-center gap-1">
            <a href="/" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Home</a>
            <a href="/movies" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Movies</a>
            <a href="/anime" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Anime</a>
            <a href="/tv" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">TV Shows</a>
            <a href="/trailers" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Trailers</a>
            <a href="/editorial-picks" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Editorial Picks</a>
            <a href="/weekly-picks" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Weekly Picks</a>
            <a href="/calendar" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Release Calendar</a>
            <a href="/ott" class="flex flex-none items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">OTT Tracker</a>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a href="/login" class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Log In</a>
        <a href="/signup" class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all shadow-lg shadow-cyan-600/20">Sign Up</a>
      </div>
    </div>
  </div>
</nav>
`;

const footerHtml = `
<footer class="bg-gray-950 border-t border-white/5 mt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
      <div class="md:col-span-2">
        <a href="/" class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect><polyline points="17 2 21 7 12 7"></polyline><polyline points="7 2 11 7 2 7"></polyline><path d="M2 12h20"></path><path d="M2 17h20"></path><path d="M8 12v10"></path><path d="M16 12v10"></path></svg>
          </div>
          <span class="text-xl font-bold">
            <span class="text-white">Cine</span>
            <span class="text-cyan-400">Verse</span>
            <span class="text-cyan-300 text-xs font-medium ml-1">AI</span>
          </span>
        </a>
        <p class="text-gray-400 text-sm leading-relaxed max-w-xs">
          Discover movies, anime, TV shows, trailers, ratings and AI-powered entertainment recommendations on CineVerse AI. Your ultimate guide to global cinema and streaming.
        </p>
      </div>
      <div>
        <h4 class="text-white text-sm font-semibold mb-3">Discover</h4>
        <ul class="space-y-2">
          <li><a href="/movies" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Movies</a></li>
          <li><a href="/anime" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Anime</a></li>
          <li><a href="/trailers" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Trailers</a></li>
          <li><a href="/editorial-picks" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Editorial Picks</a></li>
          <li><a href="/weekly-picks" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Weekly Picks</a></li>
          <li><a href="/ott" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">OTT Tracker</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white text-sm font-semibold mb-3">Company</h4>
        <ul class="space-y-2">
          <li><a href="/about" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">About Us</a></li>
          <li><a href="/contact" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white text-sm font-semibold mb-3">Legal</h4>
        <ul class="space-y-2">
          <li><a href="/privacy" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Terms & Conditions</a></li>
          <li><a href="/disclaimer" class="text-gray-400 hover:text-gray-300 text-sm transition-colors">Disclaimer</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/5 mt-8 pt-6 flex flex-col gap-3">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-gray-400 text-xs">&copy; 2026 CineVerse AI. All rights reserved.</p>
        <p class="text-gray-300 text-xs">Built for entertainment enthusiasts</p>
      </div>
      <p class="text-gray-300 text-xs">
        Cookie notice: CineVerse may use cookies for essential functionality, analytics, and (where enabled) advertising. Data is provided by third-party APIs and may be inaccurate. CineVerse does not host or stream media. See <a href="/privacy" class="text-cyan-400 hover:underline">Privacy</a> and <a href="/disclaimer" class="text-cyan-400 hover:underline">Disclaimer</a>.
      </p>
    </div>
  </div>
</footer>
`;

// Define the static page metadata and body contents
const PAGES = [
  {
    route: '/',
    title: 'CineVerse AI - Your Entertainment Universe',
    description: 'Discover movies, anime, TV shows, and AI-powered recommendations on CineVerse AI. Your ultimate guide to global streaming availability.',
    canonical: 'https://cineverse-ai-gules.vercel.app',
    body: `
      <section class="border-t border-white/5 bg-gray-950/80 mt-16 pt-16 pb-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-300 space-y-12">
          <div class="space-y-6">
            <h1 class="text-3xl font-black text-white md:text-4xl">CineVerse AI: Your Ultimate Entertainment Discovery Platform</h1>
            <p class="leading-relaxed text-lg">
              Welcome to <strong class="text-cyan-400">CineVerse AI</strong>, the most advanced <strong>Entertainment Discovery Platform</strong> designed to revolutionize how you find your next favorite movie, TV show, anime, or streaming content. In a digital world overflowing with endless choices across dozens of OTT platforms, deciding what to watch can often take longer than actually watching it. CineVerse AI eliminates this frustration by serving as your personal, intelligent entertainment guide.
            </p>
            <p class="leading-relaxed text-lg">
              By utilizing cutting-edge artificial intelligence, our <strong>AI Movie Finder</strong> and <strong>TV Show Recommendations</strong> engine analyzes your preferences, viewing history, and specific moods to deliver hyper-personalized suggestions. Whether you're searching for blockbuster action, thought-provoking sci-fi, comforting anime, or the latest binge-worthy series on popular streaming services, CineVerse AI connects you directly to the content you'll love.
            </p>
          </div>
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">What is CineVerse AI?</h2>
            <p class="leading-relaxed">
              CineVerse AI is a comprehensive, AI-driven media hub that aggregates, curates, and recommends entertainment content from across the globe. Unlike standard streaming platform algorithms that only promote their own content, CineVerse AI provides unbiased, cross-platform <strong>OTT Recommendations</strong>. We bring together vast databases of global cinema, television broadcasts, and Japanese animation into one seamless, easy-to-navigate interface.
            </p>
            <p class="leading-relaxed">
              Our platform allows users to search and discover content based on an incredibly wide array of filters: specific genres, emotional moods, critical ratings, favorite actors, visionary directors, and niche interests. By understanding the intricate nuances of what makes a film or show great, our platform ensures that your next watch is always a hit.
            </p>
          </div>
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-white">How AI-Powered Recommendations Transform Your Experience</h2>
            <p class="leading-relaxed">
              The core strength of CineVerse AI lies in its sophisticated artificial intelligence framework. Traditional recommendation systems rely on simple tags, but our <strong>Personalized Recommendations</strong> go much deeper. The AI analyzes narrative structures, pacing, visual styles, and thematic elements to understand <em>why</em> you enjoy certain media.
            </p>
            <p class="leading-relaxed">
              This means you spend significantly less time endlessly scrolling through menus and more time enjoying high-quality entertainment. The AI bridges the gap between your current mood and the vast ocean of available content, uncovering hidden gems and under-the-radar masterpieces that you might otherwise miss. It's not just about what's popular; it's about what's perfect for <em>you</em> at this exact moment.
            </p>
          </div>
          <div class="space-y-8">
            <h2 class="text-3xl font-bold text-white border-b border-white/10 pb-4">Explore Our Expansive Content Library</h2>
            <div class="space-y-6">
              <h3 class="text-xl font-bold text-cyan-300">Ultimate Movie Recommendations</h3>
              <p class="leading-relaxed">
                Dive into the magic of cinema with our meticulously categorized movie database. Our <strong>Movie Recommendations</strong> span every era and language, ensuring a diverse viewing experience.
              </p>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <li class="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                  <strong class="text-white block mb-1">Action Movies</strong>
                  Get your adrenaline pumping with explosive blockbusters, high-octane thrillers, and martial arts epics.
                </li>
                <li class="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                  <strong class="text-white block mb-1">Comedy Movies</strong>
                  Find the perfect laugh, from witty satires and romantic comedies to slapstick and dark humor.
                </li>
                <li class="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                  <strong class="text-white block mb-1">Drama Movies</strong>
                  Immerse yourself in emotionally resonant, character-driven narratives that explore the human condition.
                </li>
                <li class="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                  <strong class="text-white block mb-1">Horror Movies</strong>
                  Experience spine-tingling terror, psychological dread, and supernatural scares curated for horror aficionados.
                </li>
              </ul>
            </div>
          </div>
          <div class="space-y-6 pt-8 border-t border-white/10">
            <h2 class="text-3xl font-bold text-white mb-8">Frequently Asked Questions (FAQs)</h2>
            <div class="space-y-4">
              <div class="bg-gray-900/30 p-5 rounded-xl border border-white/5">
                <h4 class="font-bold text-white mb-2">1. What is CineVerse AI?</h4>
                <p class="text-sm text-gray-400">CineVerse AI is an advanced Entertainment Discovery Platform that uses artificial intelligence to provide highly personalized movie, TV show, and anime recommendations across various streaming services.</p>
              </div>
              <div class="bg-gray-900/30 p-5 rounded-xl border border-white/5">
                <h4 class="font-bold text-white mb-2">2. Does CineVerse AI host movies or TV shows?</h4>
                <p class="text-sm text-gray-400">No, we do not host or pirate video content. We are a discovery and recommendation engine that provides metadata, trailers, and legitimate links to official OTT platforms where you can stream the content legally.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `
  },
  {
    route: '/about',
    title: 'About CineVerse AI | Editorial Entertainment Discovery',
    description: 'Learn how CineVerse AI combines live entertainment data with curated recommendations to help you discover what to watch next.',
    canonical: 'https://cineverse-ai-gules.vercel.app/about',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-8 border-b border-white/5 pb-6">
            <h1 class="text-3xl font-black text-white">About Us</h1>
            <p class="mt-2 text-gray-400">A premium discovery platform that combines live entertainment data with original editorial value</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Original value</p>
              <p class="mt-2 text-sm font-bold text-white leading-6">Editorial picks</p>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Trust first</p>
              <p class="mt-2 text-sm font-bold text-white leading-6">Legal pages, disclosures, and no media hosting</p>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Product focus</p>
              <p class="mt-2 text-sm font-bold text-white leading-6">Discovery, retention, and fast browsing</p>
            </div>
          </div>
          <div class="mt-12 space-y-12">
            <section class="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <h2 class="text-2xl font-black text-white mb-6">Our Mission</h2>
              <p class="text-gray-400 leading-relaxed">
                CineVerse exists to make entertainment discovery feel curated, premium, and worth returning to. We combine live movie, anime, and TV data with editorial collections, mood-based recommendations, and trustworthy legal disclosure so the platform feels like a real startup product instead of a thin API wrapper.
              </p>
            </section>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-900/40 rounded-3xl p-6 border border-white/5">
                <h3 class="font-bold text-white mb-2">Editorial-first discovery</h3>
                <p class="text-gray-400 text-sm">Every recommendation layer is written to help viewers understand why something is worth opening, not just what the title is.</p>
              </div>
              <div class="bg-gray-900/40 rounded-3xl p-6 border border-white/5">
                <h3 class="font-bold text-white mb-2">Trust and transparency</h3>
                <p class="text-gray-400 text-sm">We pull data from trusted sources like OMDb, TVMaze, Jikan, Watchmode, and Supabase-backed services, while clearly stating that we do not host or stream media.</p>
              </div>
            </div>
            <section class="prose prose-invert max-w-none">
              <h2 class="text-white text-2xl font-black mb-4">Why CineVerse?</h2>
              <div class="grid gap-4">
                <div class="flex gap-3 items-start"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></div><p class="text-gray-400 text-sm m-0">Unified discovery across all major OTT platforms.</p></div>
                <div class="flex gap-3 items-start"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></div><p class="text-gray-400 text-sm m-0">Real-time streaming availability and provider badges.</p></div>
                <div class="flex gap-3 items-start"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></div><p class="text-gray-400 text-sm m-0">Original editorial collections that add real browsing value.</p></div>
                <div class="flex gap-3 items-start"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></div><p class="text-gray-400 text-sm m-0">AI-curated trending feeds and personalized watchlists.</p></div>
                <div class="flex gap-3 items-start"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></div><p class="text-gray-400 text-sm m-0">Professional OTT tracker for managing episode progress.</p></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `
  },
  {
    route: '/contact',
    title: 'Contact CineVerse AI | Partnerships, Support & Editorial Requests',
    description: 'Contact the CineVerse AI team for support, advertising, editorial feedback, copyright concerns, or partnership inquiries.',
    canonical: 'https://cineverse-ai-gules.vercel.app/contact',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-8 border-b border-white/5 pb-6">
            <h1 class="text-3xl font-black text-white">Contact Us</h1>
            <p class="mt-2 text-gray-400">Support, editorial, advertising, and copyright contact in one place</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Response window</p>
              <p class="mt-2 text-sm font-bold text-white leading-6">24-48 hours</p>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Use this for</p>
              <p class="mt-2 text-sm font-bold text-white leading-6">Support, partnerships, feedback, and copyright requests</p>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Tone</p>
              <p class="mt-2 text-sm font-bold text-white leading-6">Professional, concise, and advertiser-friendly</p>
            </div>
          </div>
          <div class="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-1 space-y-6">
              <div class="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
                <h3 class="text-white text-xl font-bold mb-6">Contact Information</h3>
                <div class="space-y-6">
                  <div>
                    <p class="text-white text-sm font-bold">Email Us</p>
                    <a href="mailto:mokshithnaik932@gmail.com" class="text-gray-400 text-sm hover:text-cyan-400 transition-colors">mokshithnaik932@gmail.com</a>
                  </div>
                  <div>
                    <p class="text-white text-sm font-bold">Location</p>
                    <p class="text-gray-400 text-sm">Global / Remote Hub</p>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl p-8 border border-cyan-400/10">
                <p class="text-gray-400 text-sm">For copyright concerns or reporting content, please use "REPORT" or "DMCA" in your email subject line so the request is triaged quickly.</p>
              </div>
            </div>
            <div class="lg:col-span-2">
              <div class="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
                <h3 class="text-white text-xl font-bold mb-4">Send us a message</h3>
                <form class="space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label class="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Your Name</label>
                      <input required type="text" placeholder="John Doe" class="w-full bg-gray-800/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div>
                      <label class="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Email Address</label>
                      <input required type="email" placeholder="john@example.com" class="w-full bg-gray-800/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label class="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Subject</label>
                    <select class="w-full bg-gray-800/50 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-3 outline-none">
                      <option>General Inquiry</option>
                      <option>Support Request</option>
                      <option>Bug Report</option>
                      <option>Copyright/DMCA</option>
                      <option>Advertising</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Message</label>
                    <textarea required rows="5" placeholder="How can we help you?" class="w-full bg-gray-800/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none resize-none"></textarea>
                  </div>
                  <button class="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black rounded-xl transition-all shadow-lg">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | CineVerse AI',
    description: 'Read how CineVerse AI collects, uses, and protects personal data, cookies, analytics, and advertising-related information.',
    canonical: 'https://cineverse-ai-gules.vercel.app/privacy',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-8 border-b border-white/5 pb-6">
            <h1 class="text-3xl font-black text-white">Privacy Policy</h1>
            <p class="mt-2 text-gray-400">Last updated: May 16, 2026</p>
          </div>
          <div class="bg-gray-900/40 rounded-3xl p-8 sm:p-12 border border-white/5 backdrop-blur-sm space-y-10">
            <section>
              <h2 class="text-xl font-bold text-white mb-4">Introduction</h2>
              <p class="text-gray-400 text-sm leading-relaxed">
                CineVerse ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our entertainment platform.
              </p>
            </section>
            <section>
              <h2 class="text-xl font-bold text-white mb-4">Data Collection</h2>
              <p class="text-gray-400 text-sm leading-relaxed mb-4">We collect information that you provide directly to us, such as:</p>
              <ul class="grid gap-3">
                <li class="flex gap-3 items-start text-gray-400 text-sm"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0"></div>Account information (email address and optional profile details)</li>
                <li class="flex gap-3 items-start text-gray-400 text-sm"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0"></div>Watchlist preferences and tracking data</li>
                <li class="flex gap-3 items-start text-gray-400 text-sm"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0"></div>OTT platform preferences</li>
              </ul>
            </section>
            <section>
              <h2 class="text-xl font-bold text-white mb-4">Cookies & Advertising (Google AdSense)</h2>
              <p class="text-gray-400 text-sm leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, remember your login session, support essential features, and analyze site performance. Cookies are small data files stored on your device.
              </p>
              <div class="bg-white/5 rounded-2xl p-5 border border-white/5 mt-5 space-y-3">
                <p class="text-gray-400 text-sm font-bold">Google AdSense and the DoubleClick DART Cookie</p>
                <ul class="text-gray-400 text-xs leading-relaxed list-disc list-inside space-y-2">
                  <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</li>
                  <li>Users may opt-out of personalized advertising by visiting Google Ad Settings.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    `
  },
  {
    route: '/terms',
    title: 'Terms & Conditions | CineVerse AI',
    description: 'Review the terms for using CineVerse AI, including permitted use, third-party data, advertising, and legal disclaimers.',
    canonical: 'https://cineverse-ai-gules.vercel.app/terms',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-8 border-b border-white/5 pb-6">
            <h1 class="text-3xl font-black text-white">Terms & Conditions</h1>
            <p class="mt-2 text-gray-400">Last updated: May 16, 2026</p>
          </div>
          <div class="bg-gray-900/40 rounded-3xl p-8 sm:p-12 border border-white/5 backdrop-blur-sm space-y-10">
            <section>
              <h2 class="text-xl font-bold text-white mb-4">Agreement to Terms</h2>
              <p class="text-gray-400 text-sm leading-relaxed">
                By accessing or using CineVerse, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>
            <section>
              <h2 class="text-xl font-bold text-white mb-4">Use of Service</h2>
              <p class="text-gray-400 text-sm leading-relaxed mb-4">CineVerse provides an informational and tracking platform. You agree to use the service for personal, non-commercial purposes only, and maintain security of your credentials.</p>
            </section>
            <section>
              <h2 class="text-xl font-bold text-white mb-4">Content Disclaimer</h2>
              <p class="text-gray-400 text-sm leading-relaxed">
                CineVerse does not host or distribute any media content (movies, TV shows, anime). We provide metadata, trailers (via YouTube), and streaming availability data for informational purposes. All intellectual property rights for the media belong to their respective owners.
              </p>
            </section>
          </div>
        </div>
      </div>
    `
  },
  {
    route: '/disclaimer',
    title: 'Disclaimer | CineVerse AI',
    description: 'Read CineVerse AI\'s disclaimer covering media hosting, third-party APIs, trademarks, advertising, and external links.',
    canonical: 'https://cineverse-ai-gules.vercel.app/disclaimer',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-8 border-b border-white/5 pb-6">
            <h1 class="text-3xl font-black text-white">Disclaimer</h1>
            <p class="mt-2 text-gray-400">Legal notices and platform limitations</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <section class="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <h2 class="text-xl font-bold text-white mb-4">No Media Hosting</h2>
              <p class="text-gray-400 text-sm leading-relaxed">
                CineVerse does <strong>not</strong> host, store, stream, or upload any video, film, media file, or torrent. We function strictly as an information index and discovery platform. Trailer content is embedded from third-party platforms (for example, official YouTube channels) when available.
              </p>
            </section>
            <section class="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <h2 class="text-xl font-bold text-white mb-4">Third-Party APIs & Accuracy</h2>
              <p class="text-gray-400 text-sm leading-relaxed">
                Metadata, ratings, availability, and other information may be sourced from third-party APIs (for example, OMDb, TVMaze, Watchmode) and may change without notice. While we aim to keep information current, we cannot guarantee accuracy, completeness, or regional availability.
              </p>
            </section>
          </div>
        </div>
      </div>
    `
  },
  {
    route: '/editorial-picks',
    title: 'Editorial Picks | CineVerse AI',
    description: 'Editor-curated picks across global cinema — original opinions and recommendations from CineVerse editors.',
    canonical: 'https://cineverse-ai-gules.vercel.app/editorial-picks',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-black mb-4">Editorial Picks</h1>
          <p class="text-gray-400 mb-6">Original, opinionated recommendations from CineVerse editors — a rotating collection of global cinema.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article class="rounded-xl bg-gray-900 border border-white/5 overflow-hidden shadow-lg shadow-black/20 p-4">
              <h2 class="text-white font-bold text-lg leading-tight">Interstellar</h2>
              <p class="text-gray-400 text-xs mt-1">Sci-Fi (2014)</p>
              <p class="mt-2 text-sm text-gray-300 leading-relaxed">A breathtaking sci-fi journey through wormholes, black holes, and higher dimensions. Underpinned by spectacular visuals, sound design, and emotional themes of parenthood and human survival.</p>
            </article>
            <article class="rounded-xl bg-gray-900 border border-white/5 overflow-hidden shadow-lg shadow-black/20 p-4">
              <h2 class="text-white font-bold text-lg leading-tight">Spirited Away</h2>
              <p class="text-gray-400 text-xs mt-1">Anime (2001)</p>
              <p class="mt-2 text-sm text-gray-300 leading-relaxed">Hayao Miyazaki's masterpiece follows a young girl trapped in a mysterious spirit world. A sublime piece of animated cinema full of wonder, folklore, and unforgettable characters.</p>
            </article>
            <article class="rounded-xl bg-gray-900 border border-white/5 overflow-hidden shadow-lg shadow-black/20 p-4">
              <h2 class="text-white font-bold text-lg leading-tight">Parasite</h2>
              <p class="text-gray-400 text-xs mt-1">Thriller (2019)</p>
              <p class="mt-2 text-sm text-gray-300 leading-relaxed">Bong Joon Ho's genre-bending social satire and thriller about greed and class discrimination. A gripping, funny, and tragic study of modern society that won the Academy Award for Best Picture.</p>
            </article>
          </div>
        </div>
      </div>
    `
  },
  {
    route: '/weekly-picks',
    title: 'Weekly Picks | CineVerse AI',
    description: 'Our five highlighted picks of the week with short reasons to watch and where to stream.',
    canonical: 'https://cineverse-ai-gules.vercel.app/weekly-picks',
    body: `
      <div class="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-black mb-4">Weekly Picks</h1>
          <p class="text-gray-400 mb-6">Our five highlighted picks of the week with short reasons to watch and where to stream.</p>
          <div class="grid grid-cols-1 gap-6">
            <div class="rounded-xl bg-gray-900 border border-white/5 p-4 flex gap-4 shadow-lg shadow-black/20">
              <div>
                <h2 class="text-white font-bold text-lg">Demon Slayer</h2>
                <p class="text-gray-300 text-sm mt-1">Stunning animation by ufotable, emotional character bonds, and thrilling battles make it an essential weekly watch.</p>
                <p class="text-gray-400 text-xs mt-2">Where: <span class="text-cyan-300 font-semibold">Crunchyroll</span></p>
              </div>
            </div>
            <div class="rounded-xl bg-gray-900 border border-white/5 p-4 flex gap-4 shadow-lg shadow-black/20">
              <div>
                <h2 class="text-white font-bold text-lg">Succession</h2>
                <p class="text-gray-300 text-sm mt-1">The ultimate corporate family drama about the fight to inherit a media empire, loaded with razor-sharp satire and tragedy.</p>
                <p class="text-gray-400 text-xs mt-2">Where: <span class="text-cyan-300 font-semibold">HBO / JioCinema</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
];

// Helper function to replace default metadata and body content
function prerenderPage(page) {
  let content = template;

  // 1. Replace Title
  content = content.replace(/<title>.*?<\/title>/i, `<title>${page.title}</title>`);

  // 2. Replace Meta Description
  const descRegex = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
  const newDesc = `<meta name="description" content="${page.description}" />`;
  if (descRegex.test(content)) {
    content = content.replace(descRegex, newDesc);
  } else {
    content = content.replace('</head>', `  ${newDesc}\n  </head>`);
  }

  // 3. Replace Canonical Link
  const canonicalRegex = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const newCanonical = `<link rel="canonical" href="${page.canonical}" />`;
  if (canonicalRegex.test(content)) {
    content = content.replace(canonicalRegex, newCanonical);
  } else {
    content = content.replace('</head>', `  ${newCanonical}\n  </head>`);
  }

  // 3b. Replace Open Graph and Twitter URLs to match canonical link
  content = content.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/gi, `<meta property="og:url" content="${page.canonical}" />`);
  content = content.replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/gi, `<meta name="twitter:url" content="${page.canonical}" />`);

  // 3c. Replace Open Graph and Twitter Titles to match page title
  content = content.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/gi, `<meta property="og:title" content="${page.title}" />`);
  content = content.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/gi, `<meta name="twitter:title" content="${page.title}" />`);

  // 3d. Replace Open Graph and Twitter Descriptions to match page description
  content = content.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/gi, `<meta property="og:description" content="${page.description}" />`);
  content = content.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/gi, `<meta name="twitter:description" content="${page.description}" />`);

  // 4. Inject Navbar, Content, and Footer into <div id="root"></div>
  const rootDiv = '<div id="root"></div>';
  const preRenderedContent = `
    <div id="root">
      ${navbarHtml}
      <main class="relative z-10 pt-16 md:pt-20">
        ${page.body}
      </main>
      ${footerHtml}
    </div>
  `.trim();

  content = content.replace(rootDiv, preRenderedContent);

  // Write file
  if (page.route === '/') {
    fs.writeFileSync(TEMPLATE_PATH, content, 'utf-8');
    console.log(`[Prerender] Successfully pre-rendered homepage: /index.html`);
  } else {
    const pageDir = path.join(DIST_DIR, page.route);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    const filePath = path.join(pageDir, 'index.html');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[Prerender] Successfully pre-rendered: ${page.route}/index.html`);
  }
}

// Generate all pages
PAGES.forEach(prerenderPage);

console.log('[Prerender] Completed static page generation successfully!');
