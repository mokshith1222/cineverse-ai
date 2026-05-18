export type EditorialAccent = 'cyan' | 'blue' | 'emerald' | 'orange';

export type EditorialItem = {
  title: string;
  description: string;
  href: string;
  tag: string;
};

export type EditorialCollection = {
  title: string;
  subtitle: string;
  summary: string;
  accent: EditorialAccent;
  items: EditorialItem[];
};

const q = (value: string) => `/search?q=${encodeURIComponent(value)}`;

function getWeekNumber(): number {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

export const editorialCollections: EditorialCollection[] = [
  {
    title: 'AI Picks of the Week',
    subtitle: 'A polished, high-signal mix for when you want one confident starting point.',
    summary: 'These picks are framed like a concierge shortlist: broad enough for discovery, specific enough to feel curated.',
    accent: 'cyan',
    items: [
      { title: 'Dune: Part Two', description: 'Big-screen scale, dense worldbuilding, and enough momentum to anchor a weekend watch.', href: q('Dune Part Two'), tag: 'Epic' },
      { title: 'The Wild Robot', description: 'Warm, premium family viewing with visual detail that feels intentionally chosen.', href: q('The Wild Robot'), tag: 'Family' },
      { title: 'Shogun', description: 'A prestige series choice for viewers who want cinematic pacing and layered stakes.', href: q('Shogun'), tag: 'Prestige' },
    ],
  },
  {
    title: 'Movies Like Interstellar',
    subtitle: 'For viewers who want scale, emotion, and ideas that linger after the credits.',
    summary: 'Instead of generic similarity lists, this cluster leans into cosmic stakes, emotional gravity, and rewatch value.',
    accent: 'blue',
    items: [
      { title: 'Arrival', description: 'First contact with a deeply human core and a slow-burn reveal that rewards patience.', href: q('Arrival'), tag: 'Sci-Fi Drama' },
      { title: 'Ad Astra', description: 'A reflective space journey that keeps the same lonely, awe-struck energy.', href: q('Ad Astra'), tag: 'Space' },
      { title: 'The Martian', description: 'More grounded optimism, but still a survival puzzle with satisfying momentum.', href: q('The Martian'), tag: 'Survival' },
    ],
  },
  {
    title: 'Best Mind-Bending Movies',
    subtitle: 'Curated for the viewers who want theory, tension, and a second-watch payoff.',
    summary: 'These recommendations favor structural twists, visual precision, and conversation-starting endings.',
    accent: 'emerald',
    items: [
      { title: 'Inception', description: 'A genre-defining puzzle box with strong mainstream appeal and premium rewatch value.', href: q('Inception'), tag: 'Puzzle' },
      { title: 'Tenet', description: 'Built for viewers who like scale, logic games, and cinematic spectacle over explanations.', href: q('Tenet'), tag: 'Time' },
      { title: 'Primer', description: 'Low-budget, high-concept, and famous for the kind of complexity enthusiasts love to unpack.', href: q('Primer'), tag: 'Cult' },
    ],
  },
  {
    title: 'Top Sci-Fi Recommendations',
    subtitle: 'A balanced mix of prestige, accessibility, and genuine imagination.',
    summary: 'The goal here is not just “best sci-fi.” It is sci-fi that feels durable, rewatchable, and useful for browsing.',
    accent: 'orange',
    items: [
      { title: 'Blade Runner 2049', description: 'Saturated visuals and a slow, immersive mood for viewers who want atmosphere first.', href: q('Blade Runner 2049'), tag: 'Neo-Noir' },
      { title: 'Ex Machina', description: 'Small scale, sharp dialogue, and a clean concept that lands with premium precision.', href: q('Ex Machina'), tag: 'Thriller' },
      { title: 'Children of Men', description: 'A grounded future that still feels intense, human, and visually unforgettable.', href: q('Children of Men'), tag: 'Dystopian' },
    ],
  },
  {
    title: 'Trending Anime Picks',
    subtitle: 'Anime discovery with enough editorial framing to feel hand-guided instead of scraped.',
    summary: 'This section spotlights momentum, cultural buzz, and series that feel worth opening right now.',
    accent: 'cyan',
    items: [
      { title: 'Frieren', description: 'A quietly emotional fantasy series that has become a high-trust recommendation.', href: q('Frieren'), tag: 'Fantasy' },
      { title: 'Solo Leveling', description: 'Action-first, highly bingeable, and ideal for viewers who want immediate momentum.', href: q('Solo Leveling'), tag: 'Action' },
      { title: 'Kaiju No. 8', description: 'A modern monster-scale pick with broad appeal and strong visual identity.', href: q('Kaiju No. 8'), tag: 'Monster' },
    ],
  },
  {
    title: 'Editor Recommendations',
    subtitle: 'A startup-style editorial layer that reads like a trusted in-house programming team.',
    summary: 'These are chosen for range: one movie, one series, one anime, all with strong first-click potential.',
    accent: 'blue',
    items: [
      { title: 'Spider-Man: Across the Spider-Verse', description: 'A visually daring film that looks and feels premium in every frame.', href: q('Spider-Man Across the Spider-Verse'), tag: 'Visual' },
      { title: 'The Bear', description: 'High-intensity character storytelling that keeps viewers moving through episodes.', href: q('The Bear'), tag: 'Series' },
      { title: 'Dandadan', description: 'Fast, weird, and unmistakably current, which makes it a natural retention magnet.', href: q('Dandadan'), tag: 'Anime' },
    ],
  },
  {
    title: 'Mood-Based Movie Discovery',
    subtitle: 'A practical way to browse by feeling instead of by genre alone.',
    summary: 'This gives the homepage utility beyond catalog browsing by translating moods into instant next steps.',
    accent: 'emerald',
    items: [
      { title: 'Late-Night Thinkers', description: 'Search for stories that are calm on the surface and thought-provoking underneath.', href: q('philosophical sci fi'), tag: 'Reflective' },
      { title: 'Comfort Rewatch', description: 'Great for relaxed nights when users want something familiar, warm, and easy to enter.', href: q('feel good movies'), tag: 'Cozy' },
      { title: 'High-Energy Escapes', description: 'A quick path to action-heavy titles when attention is low and momentum matters.', href: q('action thriller movies'), tag: 'Pulse' },
    ],
  },
  {
    title: 'Weekend Watch Recommendations',
    subtitle: 'Designed for longer session duration with a clear reason to keep browsing.',
    summary: 'Each pick solves a different weekend scenario: one night, one film, one binge, one mood reset.',
    accent: 'orange',
    items: [
      { title: 'Friday Night Blockbuster', description: 'Pick something kinetic and recognizable to get the weekend moving immediately.', href: q('blockbuster movies'), tag: 'Friday' },
      { title: 'Saturday Marathon', description: 'A series-first route for viewers who want to settle in and stay longer.', href: q('binge worthy series'), tag: 'Marathon' },
      { title: 'Sunday Reset', description: 'Slower, emotionally satisfying titles that close the weekend on a cleaner note.', href: q('comfort drama movies'), tag: 'Reset' },
    ],
  },
  {
    title: 'Hidden Gem Movies',
    subtitle: 'A discovery section that rewards curiosity instead of only popularity.',
    summary: 'These picks are here to make CineVerse feel smarter than a basic “trending now” surface.',
    accent: 'blue',
    items: [
      { title: 'Columbus', description: 'A quiet, beautifully composed drama for viewers who value tone and space.', href: q('Columbus movie'), tag: 'Indie' },
      { title: 'Short Term 12', description: 'Intimate and emotionally grounded, with the kind of word-of-mouth that drives trust.', href: q('Short Term 12'), tag: 'Drama' },
      { title: 'A Ghost Story', description: 'A meditative choice that stands out precisely because it refuses to rush.', href: q('A Ghost Story'), tag: 'Art-House' },
    ],
  },
  {
    title: 'Underrated Anime Collections',
    subtitle: 'A collector-style section that helps the platform feel editorially aware.',
    summary: 'This is where CineVerse can look less like a database and more like a knowledgeable programming desk.',
    accent: 'cyan',
    items: [
      { title: 'Planetes', description: 'A grounded sci-fi anime that often surprises viewers who only know the big names.', href: q('Planetes anime'), tag: 'Sci-Fi' },
      { title: 'Ping Pong the Animation', description: 'Stylized, emotional, and distinctive enough to feel like a true hidden recommendation.', href: q('Ping Pong the Animation'), tag: 'Sports' },
      { title: 'The Eccentric Family', description: 'Offbeat and warm, with enough character to reward adventurous browsing.', href: q('The Eccentric Family'), tag: 'Slice of Life' },
    ],
  },
];

export function getRotatedEditorialCollections(): EditorialCollection[] {
  const week = getWeekNumber();
  const rotationOffset = week % editorialCollections.length;
  
  return [
    ...editorialCollections.slice(rotationOffset),
    ...editorialCollections.slice(0, rotationOffset),
  ].slice(0, 4);
}