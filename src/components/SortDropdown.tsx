import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SortDropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ options, selected, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 min-w-[140px] px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800 hover:border-white/20 text-white'
        }`}
      >
        <span className="truncate">{selected}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                  selected === option ? 'text-cyan-400 font-semibold bg-cyan-400/5' : 'text-gray-300'
                }`}
              >
                {option}
                {selected === option && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
