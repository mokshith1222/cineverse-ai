import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, MapPin, Loader2 } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Seo from '../components/Seo';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16">
      <Seo
        title="Contact CineVerse AI | Partnerships, Support & Editorial Requests"
        description="Contact the CineVerse AI team for support, advertising, editorial feedback, copyright concerns, or partnership inquiries."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title="Contact Us" 
          subtitle="Support, editorial, advertising, and copyright contact in one place"
          accent="cyan"
          icon={<Mail className="w-6 h-6" />}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Response window', value: '24-48 hours' },
            { label: 'Use this for', value: 'Support, partnerships, feedback, and copyright requests' },
            { label: 'Tone', value: 'Professional, concise, and advertiser-friendly' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">{item.label}</p>
              <p className="mt-2 text-sm font-bold text-white leading-6">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <h3 className="text-white text-xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Email Us</p>
                    <a href="mailto:mokshithnaik932@gmail.com" className="text-gray-400 text-sm hover:text-cyan-400 transition-colors">
                      mokshithnaik932@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Location</p>
                    <p className="text-gray-400 text-sm">Global / Remote Hub</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Support</p>
                    <p className="text-gray-400 text-sm">Best for troubleshooting, content feedback, and partnership inquiries.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl p-8 border border-cyan-400/10">
              <p className="text-gray-400 text-sm">
                For copyright concerns or reporting content, please use "REPORT" or "DMCA" in your email subject line so the request is triaged quickly.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <h3 className="text-white text-xl font-bold mb-4">Editorial & ad policy</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                CineVerse maintains clear separation between editorial discovery content, metadata sources, and advertising placements. If you are a brand, studio, or media publisher, this is the right channel for collaboration requests and correction notices.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 rounded-3xl p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Send className="w-32 h-32" />
              </div>

              {submitted ? (
                <div className="text-center py-16 animate-in zoom-in fade-in duration-500">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                    <Send className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We've received your inquiry and will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-cyan-400 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Your Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full bg-gray-800/50 border border-white/10 focus:border-cyan-400/40 text-white placeholder-gray-600 text-sm rounded-xl px-4 py-3 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full bg-gray-800/50 border border-white/10 focus:border-cyan-400/40 text-white placeholder-gray-600 text-sm rounded-xl px-4 py-3 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Subject</label>
                    <select className="w-full bg-gray-800/50 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-3 outline-none cursor-pointer">
                      <option>General Inquiry</option>
                      <option>Support Request</option>
                      <option>Bug Report</option>
                      <option>Copyright/DMCA</option>
                      <option>Advertising</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Message</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full bg-gray-800/50 border border-white/10 focus:border-cyan-400/40 text-white placeholder-gray-600 text-sm rounded-xl px-4 py-3 outline-none transition-all resize-none"
                    ></textarea>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-black rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send size={18} /></>}
                  </button>

                  <p className="text-gray-400 text-xs leading-relaxed">
                    By submitting this form, you agree that we may use your details to respond. Please avoid sharing sensitive information. See our{' '}
                    <Link to="/privacy" className="text-cyan-400 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
