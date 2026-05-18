import React, { useEffect } from 'react';
import Seo from '../components/Seo';

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service | CineVerse AI';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Terms of service for CineVerse AI — discovery platform, not a streaming service.');
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
      <Seo title="Terms of Service | CineVerse AI" description="Terms of service for CineVerse AI — discovery platform, not a streaming service." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-4">Terms of Service</h1>
        <p className="text-gray-400 leading-relaxed mb-4">
          CineVerse AI is an editorial and discovery platform that aggregates metadata and availability information from third-party providers. We do not host, store, or stream copyrighted video content. When CineVerse links to streaming services or lists availability, the actual playback experience is delivered by external providers. Users must comply with the terms and conditions of those services when accessing or streaming content.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          TMDB and other third-party content providers: CineVerse may use data, artwork, and metadata supplied by TMDB, OMDb, TVMaze, Jikan, and other licensed APIs. These providers retain ownership of their data and maintain separate licenses and usage terms. CineVerse uses this information under their APIs’ terms and displays attribution where required.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          Acceptable use: You agree not to misuse the platform, attempt to extract copyrighted content from third-party partners via CineVerse, or engage in abusive behavior. The service is provided as-is and CineVerse disclaims liability for third-party content and availability.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          If you rely on availability information for critical decisions, double-check with the official streaming provider. For requests, disputes, or licensing inquiries, contact us via the address in the site footer.
        </p>
      </div>
    </div>
  );
}
