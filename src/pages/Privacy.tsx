import { Shield, Eye, Lock, Globe } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';

export default function Privacy() {
  const lastUpdated = "May 16, 2026";

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16">
      <Seo
        title="Privacy Policy | CineVerse AI"
        description="Read how CineVerse AI collects, uses, and protects personal data, cookies, analytics, and advertising-related information."
        noIndex={false}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title="Privacy Policy" 
          subtitle={`Last updated: ${lastUpdated}`}
          accent="cyan"
          icon={<Shield className="w-6 h-6" />}
          as="h1"
        />

        <div className="mt-12 bg-gray-900/40 rounded-3xl p-8 sm:p-12 border border-white/5 backdrop-blur-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <section>
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Eye className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Introduction</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineVerse ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our entertainment platform.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Lock className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Data Collection</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              We collect information that you provide directly to us, such as:
            </p>
            <ul className="grid gap-3">
              {[
                "Account information (email address and optional profile details)",
                "Watchlist preferences and tracking data",
                "OTT platform preferences",
                "Communication details if you contact us"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-400 text-sm leading-relaxed mt-5">
              We may also automatically collect basic usage and device data (such as pages viewed, approximate location based on IP, browser type, and error logs) to keep the platform secure and improve performance.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Globe className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Cookies & Advertising (Google AdSense)</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience, remember your login session, support essential features, and analyze site performance. Cookies are small data files stored on your device.
            </p>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mt-5 space-y-3">
              <p className="text-gray-400 text-sm font-bold">Google AdSense and the DoubleClick DART Cookie</p>
              <ul className="text-gray-400 text-xs leading-relaxed list-disc list-inside space-y-2">
                <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
                <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</li>
                <li>Users may opt-out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ad Settings</a>.</li>
                <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.aboutads.info</a>.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">How We Use Your Data</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your data is used solely to provide and improve CineVerse services, including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                "Personalizing your dashboard",
                "Synchronizing your OTT tracker",
                "Providing streaming availability data",
                "Improving our AI discovery algorithms"
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-gray-300 text-xs font-bold">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t border-white/5">
            <h2 className="text-white font-bold mb-4">Third-Party Services</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineVerse integrates with external APIs (OMDb, TVMaze, Watchmode) and Supabase for authentication. While we protect your data on our end, these services have their own privacy policies. We do not sell your personal data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Data Retention</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We keep personal data only as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Your Choices & Rights</h2>
            <ul className="grid gap-3">
              {[
                "Access and update your account information where available.",
                "Request deletion of your account and associated data.",
                "Control cookies in your browser and review ad personalization settings from your device or ad provider.",
                "Opt out of non-essential marketing communications (if any are sent)."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Children’s Privacy</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineVerse is not directed to children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided personal data, please contact us so we can take appropriate action.
            </p>
          </section>

          <div className="bg-cyan-500/5 border border-cyan-400/10 rounded-2xl p-6 text-center">
             <p className="text-gray-400 text-xs">
               If you have any questions about this Privacy Policy, please contact us at <a href="mailto:mokshithnaik932@gmail.com" className="text-cyan-400 hover:underline">mokshithnaik932@gmail.com</a>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
