import React, { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About | CineVerse AI';
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', 'CineVerse AI is an AI-powered entertainment discovery platform with editorial collections and curated picks.');
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-4">About CineVerse AI</h1>
        <p className="text-gray-400 leading-relaxed mb-4">
          CineVerse AI is an AI-powered editorial discovery platform that blends live metadata from trusted sources with original editorial opinions and curated collections. Our goal is to help viewers find meaningful, watchable content quickly. 
        </p>
        <p className="text-gray-400 leading-relaxed mb-4">
          Creator: [YOUR_NAME] — this is a placeholder for the site owner/creator name. Replace with the real name where appropriate.
        </p>
        <p className="text-gray-400 leading-relaxed">
          We emphasize editorial value, trust signals, and a polished browsing experience rather than hosting or streaming media. CineVerse aggregates provider metadata and links to external streaming platforms.
        </p>
      </div>
    </div>
  );
}
