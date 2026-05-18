import React, { useEffect } from 'react';
import Seo from '../components/Seo';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | CineVerse AI';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Privacy policy for CineVerse AI — cookies, ads, and third-party data sources.');
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
      <Seo title="Privacy Policy | CineVerse AI" description="Privacy policy for CineVerse AI — cookies, ads, and third-party data sources." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-4">Privacy Policy</h1>
        <p className="text-gray-400 leading-relaxed mb-4">
          CineVerse AI is a discovery platform that emphasizes editorial recommendations and third-party data aggregation. We do not host, stream, or distribute media. We rely on external providers (for example TMDB, OMDb, TVMaze, Watchmode) for title metadata and artwork. These providers have their own privacy practices; CineVerse does not control data those services collect and encourages users to review their policies.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          We use cookies and similar technologies for essential site functionality, analytics, and to support advertising features when enabled. Where advertising is present, third-party services such as Google AdSense may place cookies and collect non-personally-identifying information to serve and measure ads. We do not combine or sell personal data to advertisers.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          No personal data collection by default: You can browse CineVerse without creating an account. If you choose to create an account, we only store the information you provide (for example an email) to enable features such as watchlists and sync. We do not require or collect sensitive personal information.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          Third-party data note: Title images, posters, and metadata may be supplied by TMDB and other providers. We cache and display this information to improve performance, but the authoritative record remains with the original provider. If you have concerns about specific content supplied by a third party, please contact that provider directly.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          Security and retention: We store only essential account data required to provide service features and may retain logs and aggregated analytics for operational purposes. You can request deletion of your account by contacting the address below.
        </p>

        <div className="mt-6 bg-gray-900/50 p-4 rounded-lg border border-white/5">
          <p className="text-gray-400 text-sm">Questions or deletion requests: contact us at <a href="mailto:[YOUR_EMAIL]" className="text-cyan-400 hover:underline">[YOUR_EMAIL]</a>.</p>
        </div>
      </div>
    </div>
  );
}
