import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  onViewAll?: () => void;
  accent?: 'cyan' | 'orange' | 'blue' | 'emerald';
  icon?: ReactNode;
}

export default function SectionHeader({ title, subtitle, viewAllTo, onViewAll, accent = 'cyan', icon }: Props) {
  const accentColor = {
    cyan: 'from-cyan-400 to-blue-500',
    orange: 'from-orange-400 to-red-500',
    blue: 'from-blue-400 to-cyan-500',
    emerald: 'from-emerald-400 to-teal-600',
  }[accent];

  const borderColor = {
    cyan: 'bg-cyan-400',
    orange: 'bg-orange-400',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
  }[accent];

  const textColor = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
  }[accent];

  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-1 h-6 ${borderColor} rounded-full`} />
          {icon && <span className={textColor}>{icon}</span>}
          <h2 className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${accentColor}`}>
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-gray-500 text-sm ml-4">{subtitle}</p>}
      </div>
      {(viewAllTo || onViewAll) && (
        onViewAll ? (
          <button
            onClick={onViewAll}
            className={`flex items-center gap-1 ${textColor} text-sm font-medium hover:opacity-80 transition-opacity`}
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            to={viewAllTo!}
            className={`flex items-center gap-1 ${textColor} text-sm font-medium hover:opacity-80 transition-opacity`}
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )
      )}
    </div>
  );
}
