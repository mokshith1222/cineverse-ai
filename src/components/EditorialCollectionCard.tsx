import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { EditorialCollection } from '../data/editorialCollections';

const accentMap = {
  cyan: {
    glow: 'from-cyan-400/15 via-cyan-400/5 to-transparent',
    border: 'border-cyan-400/20 hover:border-cyan-300/40',
    tag: 'bg-cyan-400/10 text-cyan-200 border-cyan-400/20',
    link: 'text-cyan-300 hover:text-cyan-200',
  },
  blue: {
    glow: 'from-blue-400/15 via-blue-400/5 to-transparent',
    border: 'border-blue-400/20 hover:border-blue-300/40',
    tag: 'bg-blue-400/10 text-blue-200 border-blue-400/20',
    link: 'text-blue-300 hover:text-blue-200',
  },
  emerald: {
    glow: 'from-emerald-400/15 via-emerald-400/5 to-transparent',
    border: 'border-emerald-400/20 hover:border-emerald-300/40',
    tag: 'bg-emerald-400/10 text-emerald-200 border-emerald-400/20',
    link: 'text-emerald-300 hover:text-emerald-200',
  },
  orange: {
    glow: 'from-orange-400/15 via-orange-400/5 to-transparent',
    border: 'border-orange-400/20 hover:border-orange-300/40',
    tag: 'bg-orange-400/10 text-orange-200 border-orange-400/20',
    link: 'text-orange-300 hover:text-orange-200',
  },
} as const;

type Props = {
  collection: EditorialCollection;
  index: number;
};

export default function EditorialCollectionCard({ collection, index }: Props) {
  const accent = accentMap[collection.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-3xl border bg-gray-950/70 p-6 shadow-[0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-colors ${accent.border}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.glow} opacity-80`} />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${accent.link}`}>Editorial Discovery</p>
            <h3 className="mt-2 text-xl font-black text-white">{collection.title}</h3>
          </div>
          <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] ${accent.tag}`}>
            AI assisted
          </div>
        </div>

        <p className="text-sm leading-6 text-gray-400">{collection.subtitle}</p>
        <p className="mt-3 text-sm leading-6 text-gray-400">{collection.summary}</p>

        <div className="mt-5 space-y-3">
          {collection.items.map(item => (
            <Link
              key={item.title}
              to={item.href}
              className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:border-white/10 hover:bg-white/[0.06]"
            >
              <span className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] ${accent.tag}`}>
                {item.tag}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-sm font-bold text-white group-hover:text-white">{item.title}</h4>
                  <span className={`shrink-0 text-[10px] font-black uppercase tracking-[0.25em] ${accent.link}`}>Open</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-400">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
