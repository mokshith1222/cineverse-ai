import React, { useEffect } from 'react';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact | CineVerse AI';
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', 'Contact CineVerse AI — reach out for editorial inquiries, partnerships, or support.');
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen pt-24 pb-16 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-4">Contact</h1>
        <p className="text-gray-400 mb-4">Have a question, partnership request, or editorial tip? Email us at <a href="mailto:[YOUR_EMAIL]" className="text-cyan-400 hover:underline">[YOUR_EMAIL]</a>.</p>
        <div className="mt-6 rounded-xl bg-gray-900 border border-white/5 p-6">
          <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Message (no backend)</label>
          <textarea className="w-full bg-gray-800 border border-white/10 rounded p-3 text-sm text-white min-h-[120px]" placeholder="Type your message here — this is a placeholder form." />
          <div className="mt-4 flex items-center justify-end">
            <button className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 px-4 py-2 rounded font-bold">Copy email</button>
          </div>
        </div>
      </div>
    </div>
  );
}
