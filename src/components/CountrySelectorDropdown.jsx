import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { WORLD_COUNTRIES } from '../data/stocksData';

export default function CountrySelectorDropdown({ 
  selectedCountry, 
  onSelectCountry, 
  primaryListing, 
  onTogglePrimaryListing 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCountry = useMemo(() => {
    return WORLD_COUNTRIES.find(c => c.id === selectedCountry) || WORLD_COUNTRIES[0];
  }, [selectedCountry]);

  // Filter countries alphabetically
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return WORLD_COUNTRIES.filter(c => {
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.exchange.toLowerCase().includes(q);
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button (Exact Investing.com Style: Flag + PK + Chevron) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#06111F] dark:hover:bg-white/10 border border-gray-300 dark:border-white/15 text-xs font-bold text-gray-900 dark:text-gray-100 transition-colors cursor-pointer shadow-xs"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{activeCountry.flag}</span>
        <span className="font-mono tracking-wider">{activeCountry.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Overlay Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-xl bg-white dark:bg-[#0A1726] border border-gray-200 dark:border-white/15 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Top Panel: Primary Listing Toggle Switch */}
          <div className="p-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#06111F]">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Primary Listing
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={primaryListing}
                onChange={(e) => onTogglePrimaryListing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Active Selected Country Radio Item at Top */}
          <div className="px-3 py-2.5 bg-blue-50/70 dark:bg-blue-500/10 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-white dark:bg-gray-900 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <span className="text-base select-none">{activeCountry.flag}</span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {activeCountry.name}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>

          {/* Type to search input box */}
          <div className="p-2 border-b border-gray-100 dark:border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#06111F] border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Scrollable A–Z List of 50+ World Countries */}
          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-gray-100 dark:divide-white/[0.03]">
            {filteredCountries.map((c) => {
              const isSelected = c.id === selectedCountry;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelectCountry(c.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${
                    isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected 
                        ? 'border-blue-600 bg-white dark:bg-gray-900' 
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="text-base select-none">{c.flag}</span>
                    <span className={`text-xs ${isSelected ? 'font-black text-blue-600 dark:text-blue-400' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 font-semibold">
                    {c.code}
                  </span>
                </button>
              );
            })}

            {filteredCountries.length === 0 && (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No countries match "{searchQuery}"
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#06111F] text-[10px] text-gray-500 dark:text-gray-400 text-center font-mono">
            Covering 50+ World Stock Exchanges
          </div>

        </div>
      )}
    </div>
  );
}
