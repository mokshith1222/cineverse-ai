import { FileText, Gavel, AlertTriangle, Scale } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';

export default function Terms() {
  const lastUpdated = "May 16, 2026";

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16">
      <Seo
        title="Terms & Conditions | CineVerse AI"
        description="Review the terms for using CineVerse AI, including permitted use, third-party data, advertising, and legal disclaimers."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title="Terms & Conditions" 
          subtitle={`Last updated: ${lastUpdated}`}
          accent="cyan"
          icon={<FileText className="w-6 h-6" />}
          as="h1"
        />

        <div className="mt-12 bg-gray-900/40 rounded-3xl p-8 sm:p-12 border border-white/5 backdrop-blur-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <section>
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Gavel className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Agreement to Terms</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              By accessing or using CineVerse, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Scale className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Use of Service</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              CineVerse provides an informational and tracking platform. You agree to:
            </p>
            <ul className="grid gap-3">
              {[
                "Use the service for personal, non-commercial purposes only.",
                "Provide accurate information when creating an account.",
                "Maintain the security of your account credentials.",
                "Not attempt to scrape, reverse engineer, or disrupt the platform.",
                "Not use the Service to infringe intellectual property rights or violate applicable laws."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-gray-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Content Disclaimer</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineVerse does not host or distribute any media content (movies, TV shows, anime). We provide metadata, trailers (via YouTube), and streaming availability data for informational purposes. All intellectual property rights for the media belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Third-Party Services & Links</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The Service may display data and links sourced from third-party providers (for example, OMDb, TVMaze, Watchmode, and YouTube) and may include links to external websites. We do not control third-party content and are not responsible for their availability, accuracy, or policies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Cookies & Advertising</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineVerse may use cookies and similar technologies to support core functionality, improve the Service, and (where enabled) display advertising. Third-party ad providers may also use cookies. For details, please review our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Disclaimer of Warranties</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The Service is provided on an “as is” and “as available” basis. To the maximum extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Limitation of Liability</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              To the maximum extent permitted by law, CineVerse and its operators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-4">Account Termination</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of CineVerse or us.
            </p>
          </section>

          <section className="pt-8 border-t border-white/5">
            <h2 className="text-white font-bold mb-4">Changes to Terms</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We may modify these terms at any time. We will notify you of any changes by posting the new terms on this page. Your continued use of CineVerse after changes are posted constitutes your acceptance of the new terms.
            </p>
          </section>

          <div className="bg-cyan-500/5 border border-cyan-400/10 rounded-2xl p-6 text-center">
            <p className="text-gray-400 text-xs">
              Questions about these Terms? Contact{' '}
              <a href="mailto:mokshithnaik932@gmail.com" className="text-cyan-400 hover:underline">
                mokshithnaik932@gmail.com
              </a>
              . For copyright notices, include “DMCA” or “Copyright” in the subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
