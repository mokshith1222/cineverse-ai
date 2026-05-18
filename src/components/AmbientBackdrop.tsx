import { motion } from 'framer-motion';

export default function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.2),_transparent_35%)]" />

      <motion.div
        className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
        animate={{ y: [0, 18, 0], x: [0, 12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-5rem] top-[18rem] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-6rem] left-1/3 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl"
        animate={{ y: [0, -10, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        {[
          'left-[12%] top-[20%] h-2 w-2',
          'left-[78%] top-[16%] h-1.5 w-1.5',
          'left-[30%] top-[68%] h-1.5 w-1.5',
          'left-[65%] top-[72%] h-2 w-2',
        ].map((className, index) => (
          <motion.span
            key={className}
            className={`absolute rounded-full bg-white/50 blur-[1px] ${className}`}
            animate={{ y: [0, -10 - index * 2, 0], opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: 8 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}