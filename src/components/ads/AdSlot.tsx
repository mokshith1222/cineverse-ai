import { isFeatureEnabled } from '../../config/platform';
import type { CmsAdSlot } from '../../cms/types';

interface Props {
  slot?: CmsAdSlot;
  className?: string;
}

export default function AdSlot({ slot, className = '' }: Props) {
  if (!slot?.enabled || !isFeatureEnabled('ads')) return null;

  return (
    <aside className={`rounded-xl border border-white/10 bg-gray-900/50 p-4 ${className}`} aria-label={slot.label}>
      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{slot.label}</div>
      {slot.html ? (
        <div dangerouslySetInnerHTML={{ __html: slot.html }} />
      ) : (
        <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-gray-400">
          Ad slot: {slot.name}
        </div>
      )}
    </aside>
  );
}
