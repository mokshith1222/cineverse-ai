import React from 'react';
import { Sparkles, Film, Tv, Zap, CheckCircle2, HelpCircle } from 'lucide-react';

export default function HomeSEOContent() {
  return (
    <section className="border-t border-white/5 bg-gray-950/80 mt-16 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-300 space-y-12">
        
        {/* Header / Intro */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white md:text-4xl">CineVerse AI: Your Ultimate Entertainment Discovery Platform</h2>
          <p className="leading-relaxed text-lg">
            Welcome to <strong className="text-cyan-400">CineVerse AI</strong>, the most advanced <strong>Entertainment Discovery Platform</strong> designed to revolutionize how you find your next favorite movie, TV show, anime, or streaming content. In a digital world overflowing with endless choices across dozens of OTT platforms, deciding what to watch can often take longer than actually watching it. CineVerse AI eliminates this frustration by serving as your personal, intelligent entertainment guide.
          </p>
          <p className="leading-relaxed text-lg">
            By utilizing cutting-edge artificial intelligence, our <strong>AI Movie Finder</strong> and <strong>TV Show Recommendations</strong> engine analyzes your preferences, viewing history, and specific moods to deliver hyper-personalized suggestions. Whether you're searching for blockbuster action, thought-provoking sci-fi, comforting anime, or the latest binge-worthy series on popular streaming services, CineVerse AI connects you directly to the content you'll love.
          </p>
        </div>

        {/* What is CineVerse AI */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Sparkles className="text-cyan-400" /> What is CineVerse AI?</h2>
          <p className="leading-relaxed">
            CineVerse AI is a comprehensive, AI-driven media hub that aggregates, curates, and recommends entertainment content from across the globe. Unlike standard streaming platform algorithms that only promote their own content, CineVerse AI provides unbiased, cross-platform <strong>OTT Recommendations</strong>. We bring together vast databases of global cinema, television broadcasts, and Japanese animation into one seamless, easy-to-navigate interface.
          </p>
          <p className="leading-relaxed">
            Our platform allows users to search and discover content based on an incredibly wide array of filters: specific genres, emotional moods, critical ratings, favorite actors, visionary directors, and niche interests. By understanding the intricate nuances of what makes a film or show great, our platform ensures that your next watch is always a hit.
          </p>
        </div>

        {/* How AI Recommendations Help */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How AI-Powered Recommendations Transform Your Experience</h2>
          <p className="leading-relaxed">
            The core strength of CineVerse AI lies in its sophisticated artificial intelligence framework. Traditional recommendation systems rely on simple tags, but our <strong>Personalized Recommendations</strong> go much deeper. The AI analyzes narrative structures, pacing, visual styles, and thematic elements to understand <em>why</em> you enjoy certain media.
          </p>
          <p className="leading-relaxed">
            This means you spend significantly less time endlessly scrolling through menus and more time enjoying high-quality entertainment. The AI bridges the gap between your current mood and the vast ocean of available content, uncovering hidden gems and under-the-radar masterpieces that you might otherwise miss. It's not just about what's popular; it's about what's perfect for <em>you</em> at this exact moment.
          </p>
        </div>

        {/* Deep Dive Categories */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white border-b border-white/10 pb-4">Explore Our Expansive Content Library</h2>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2"><Film className="w-5 h-5" /> Ultimate Movie Recommendations</h3>
            <p className="leading-relaxed">
              Dive into the magic of cinema with our meticulously categorized movie database. Our <strong>Movie Recommendations</strong> span every era and language, ensuring a diverse viewing experience.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Action Movies</strong>
                Get your adrenaline pumping with explosive blockbusters, high-octane thrillers, and martial arts epics.
              </li>
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Comedy Movies</strong>
                Find the perfect laugh, from witty satires and romantic comedies to slapstick and dark humor.
              </li>
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Drama Movies</strong>
                Immerse yourself in emotionally resonant, character-driven narratives that explore the human condition.
              </li>
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Horror Movies</strong>
                Experience spine-tingling terror, psychological dread, and supernatural scares curated for horror aficionados.
              </li>
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Thriller Movies</strong>
                Stay on the edge of your seat with gripping suspense, mind-bending twists, and intense mysteries.
              </li>
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Science Fiction Movies</strong>
                Explore futuristic worlds, space operas, and speculative technologies that challenge the imagination.
              </li>
              <li className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Romance Movies</strong>
                Discover stories of love, passion, and heartbreak across different times and cultures.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2"><Tv className="w-5 h-5" /> Unbeatable TV Show Recommendations</h3>
            <p className="leading-relaxed">
              The golden age of television requires a smart guide. Whether you are looking for a quick sitcom to lighten your evening or a dense, multi-season prestige drama to obsess over, our platform tracks current airings, completed series, and upcoming premieres to keep your watchlist full.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2"><Zap className="w-5 h-5" /> Ultimate Anime Discovery</h3>
            <p className="leading-relaxed">
              Anime is a vast medium, not just a genre. Our <strong>Anime Discovery</strong> tools help you navigate through Shonen powerhouses, intricate Seinen dramas, cozy Slice-of-Life stories, and breathtaking feature films. We integrate seamlessly with global anime databases to bring you the highest-rated and most culturally significant Japanese animation.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Cross-Platform OTT Recommendations</h3>
            <p className="leading-relaxed">
              Don't know where a movie is streaming? We've got you covered. CineVerse AI tracks availability across major OTT (Over-The-Top) platforms like Netflix, Amazon Prime Video, Hulu, Disney+, Max, and local regional streaming services. We point you exactly to where you can press play.
            </p>
          </div>
        </div>

        {/* Why Choose & How it Works */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 bg-gray-900/40 p-6 rounded-2xl border border-white/5">
            <h3 className="text-2xl font-bold text-white">Why Choose CineVerse AI?</h3>
            <ul className="space-y-3">
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> <span><strong>Saves Time:</strong> Stop searching and start watching within minutes.</span></li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> <span><strong>Unbiased Suggestions:</strong> We recommend content based on quality, not corporate streaming agendas.</span></li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> <span><strong>All-in-One Hub:</strong> Movies, TV, and Anime consolidated in one beautiful interface.</span></li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> <span><strong>Real-Time Updates:</strong> Live data integration ensures you see the latest releases.</span></li>
            </ul>
          </div>

          <div className="space-y-4 bg-gray-900/40 p-6 rounded-2xl border border-white/5">
            <h3 className="text-2xl font-bold text-white">How CineVerse AI Works</h3>
            <p className="leading-relaxed text-sm text-gray-400">
              Our system utilizes natural language processing and metadata analysis. Simply input your mood, a favorite actor, or a vague concept like "dark psychological thriller set in space," and our engine queries vast databases (like OMDb, TMDB, Jikan, and Watchmode) to synthesize a tailored list of recommendations instantly.
            </p>
          </div>
        </div>

        {/* Additional Info Sections */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Trending Movies and Shows</h3>
            <p className="leading-relaxed">
              Stay ahead of the cultural conversation with our dynamically updated Trending Content section. We track global popularity metrics, box office results, and social media buzz to highlight what the world is watching right now. If a new series drops and takes the internet by storm, you'll find it featured front and center on CineVerse AI.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Benefits of AI Recommendations</h3>
            <p className="leading-relaxed">
              The benefits of using an AI-driven system go beyond mere convenience. It expands your cinematic horizons. Algorithms designed by CineVerse AI actively work against the "echo chamber" effect, gently introducing you to foreign films, indie darlings, and classic cinema that align with your core tastes but fall outside your usual browsing habits. It is an educational journey through the art of filmmaking and storytelling.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6 pt-8 border-t border-white/10">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><HelpCircle className="text-cyan-400" /> Frequently Asked Questions (FAQs)</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">1. What is CineVerse AI?</h4>
              <p className="text-sm text-gray-400">CineVerse AI is an advanced Entertainment Discovery Platform that uses artificial intelligence to provide highly personalized movie, TV show, and anime recommendations across various streaming services.</p>
            </div>
            
            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">2. Is CineVerse AI free to use?</h4>
              <p className="text-sm text-gray-400">Yes, our platform is completely free to use for discovering content, browsing catalogs, and reading information. You only pay for the third-party streaming services (like Netflix or Prime) where you choose to watch the content.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">3. How does the AI Movie Finder work?</h4>
              <p className="text-sm text-gray-400">It analyzes vast amounts of metadata including genres, plot keywords, cast, crew, user ratings, and your specific query or mood to mathematically determine the best possible match for your current viewing desire.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">4. Does CineVerse AI host movies or TV shows?</h4>
              <p className="text-sm text-gray-400">No, we do not host or pirate video content. We are a discovery and recommendation engine that provides metadata, trailers, and legitimate links to official OTT platforms where you can stream the content legally.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">5. Can I find where a movie is streaming?</h4>
              <p className="text-sm text-gray-400">Absolutely! Our OTT Recommendations feature integrates live data to show you exactly which platforms (Netflix, Hulu, Prime Video, etc.) currently have the rights to stream a specific title in your region.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">6. How accurate are the anime recommendations?</h4>
              <p className="text-sm text-gray-400">Highly accurate. We pull data from specialized, dedicated anime databases (like MyAnimeList via Jikan API) to ensure our Anime Discovery tools respect the unique genres, studios, and release seasons of the anime industry.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">7. Can I search by mood?</h4>
              <p className="text-sm text-gray-400">Yes, our platform includes mood-based filtering. Whether you want something "epic," "cozy," "dark," or "mind-bending," our AI curates selections that match that exact emotional tone.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">8. Do I need to create an account?</h4>
              <p className="text-sm text-gray-400">While you can browse and discover content without an account, creating a free account allows you to save watchlists, track what you've seen, and receive even more tailored personalized recommendations over time.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">9. Are international films included?</h4>
              <p className="text-sm text-gray-400">Yes, our database is global. We provide recommendations for Hollywood blockbusters, European cinema, Bollywood hits, Korean dramas, and much more.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">10. How often is the trending content updated?</h4>
              <p className="text-sm text-gray-400">Our trending lists are updated in near real-time by polling live APIs, ensuring you always see what is currently popular and buzzing in the entertainment world.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">11. Can I search by actor or director?</h4>
              <p className="text-sm text-gray-400">Yes, our powerful search engine allows you to find content based on specific cast members, visionary directors, or even production studios.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">12. Does it recommend new TV show episodes?</h4>
              <p className="text-sm text-gray-400">Yes, we feature a live TV schedule and an upcoming episodes section so you can track when your favorite current shows are airing new episodes.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">13. Is CineVerse AI suitable for families?</h4>
              <p className="text-sm text-gray-400">Yes, our extensive database includes genre tags for family-friendly content, animation, and children's movies, making it easy to find safe and entertaining options for movie night.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">14. What makes this different from Netflix's recommendations?</h4>
              <p className="text-sm text-gray-400">We don't limit you to one platform's catalog. We scan the entire cinematic universe and tell you what the best movie is for you right now, regardless of which corporation owns the streaming rights.</p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-2">15. How do I start finding movies?</h4>
              <p className="text-sm text-gray-400">Simply use the search bar at the top of the page, select a mood from our AI Mood Picks, or browse our curated trending categories below to begin your cinematic journey.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-8 rounded-3xl border border-cyan-400/30 text-center mt-12">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Discover Your Next Favorite Story?</h2>
          <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto">
            Stop scrolling endlessly. Let our AI uncover the perfect movie, show, or anime for your current mood. Join the future of entertainment discovery today!
          </p>
          <a href="#search" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-block bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/25">
            Start Exploring Now
          </a>
        </div>

      </div>
    </section>
  );
}
