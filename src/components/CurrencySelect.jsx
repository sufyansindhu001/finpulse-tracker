// src/components/CurrencySelect.jsx - Custom Searchable Currency Dropdown
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import CurrencyFlag from './CurrencyFlag';
import { CURRENCIES, getCurrencyInfo } from '../data/currencies';
import { getCountrySearchTerms } from '../data/currencyCountries';

/**
 * Custom Searchable Currency Picker Dropdown / Modal
 * - Real-time filtering by Code, Name, and Country/Region
 * - Keyboard navigation (Up/Down arrows, Enter to select, Esc to close)
 * - Dynamic FlagCDN flags and institutional bullion badges
 * - Mobile responsive without layout shift or viewport overflow
 */
export default function CurrencySelect({
  value = 'USD',
  onChange,
  currencies = CURRENCIES,
  align = 'auto', // 'left', 'right', 'auto'
  disabled = false,
  className = '',
  buttonClassName = '',
  placeholder = 'Select currency',
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Selected currency object
  const selectedCurrency = useMemo(() => {
    return getCurrencyInfo(value) || { code: value, name: value, symbol: value };
  }, [value]);

  // Real-time Instant Filtering (by Code, Name, Country/Region aliases)
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currencies;

    return currencies
      .filter((c) => {
        const codeMatch = c.code.toLowerCase().includes(q);
        const nameMatch = c.name.toLowerCase().includes(q);
        const symbolMatch = c.symbol ? c.symbol.toLowerCase().includes(q) : false;
        const countryMatch = getCountrySearchTerms(c.code).toLowerCase().includes(q);
        return codeMatch || nameMatch || symbolMatch || countryMatch;
      })
      .sort((a, b) => {
        // Prioritize exact code matches, then prefix matches
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        if (aCode === q) return -1;
        if (bCode === q) return 1;
        if (aCode.startsWith(q) && !bCode.startsWith(q)) return -1;
        if (!aCode.startsWith(q) && bCode.startsWith(q)) return 1;
        return 0;
      });
  }, [currencies, searchQuery]);

  // Handle Dropdown Open / Focus
  useEffect(() => {
    if (isOpen) {
      // Find initial highlighted index of selected currency
      const idx = filteredCurrencies.findIndex((c) => c.code === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);

      // Auto-focus search field immediately on open
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setHighlightedIndex(0);
    }
  }, [isOpen, value, filteredCurrencies]);

  // Click outside to close (desktop & mobile touch)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll highlighted option into view during keyboard navigation
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-currency-item]');
      const activeItem = items[highlightedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Selection Handler
  const handleSelect = (code) => {
    if (onChange) {
      onChange(code);
    }
    setIsOpen(false);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredCurrencies.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : Math.max(0, filteredCurrencies.length - 1)
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (filteredCurrencies[highlightedIndex]) {
          handleSelect(filteredCurrencies[highlightedIndex].code);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // Alignment classes for desktop & mobile
  const alignmentClass = useMemo(() => {
    if (align === 'right') {
      return 'right-0 left-auto sm:right-0 sm:left-auto';
    }
    if (align === 'left') {
      return 'left-0 right-auto sm:left-0 sm:right-auto';
    }
    // Auto alignment
    return 'left-0 right-0 sm:right-auto sm:w-[360px]';
  }, [align]);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 text-left bg-transparent border-0 p-0 text-sm sm:text-base font-bold text-slate-900 dark:text-white cursor-pointer group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CurrencyFlag code={selectedCurrency.code} className="w-5 h-5 shrink-0 shadow-xs" />
          <span className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
            {selectedCurrency.code}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-[130px] sm:max-w-[200px]">
            {selectedCurrency.name}
          </span>
          {selectedCurrency.symbol && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
              ({selectedCurrency.symbol})
            </span>
          )}
        </div>

        <div className="flex items-center shrink-0 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-500' : ''
            }`}
          />
        </div>
      </button>

      {/* Custom Dropdown Menu / Modal */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute top-full mt-2 w-full min-w-[280px] sm:min-w-[350px] max-w-[calc(100vw-32px)] bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.12] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${alignmentClass}`}
        >
          {/* Sticky Search Bar at Top */}
          <div className="sticky top-0 bg-white dark:bg-[#0C1017] p-2.5 border-b border-slate-100 dark:border-white/[0.08] z-10 space-y-1.5 backdrop-blur-md">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search currency or country (e.g. PKR, Euro, Japan)..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-white/[0.05] border border-transparent focus:border-blue-500/50 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setHighlightedIndex(0);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>
                {filteredCurrencies.length}{' '}
                {filteredCurrencies.length === 1 ? 'Currency' : 'Currencies'}
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-400 dark:text-slate-500 lowercase font-normal">
                use ↑↓ & enter to select
              </span>
            </div>
          </div>

          {/* Scrollable Currency Items List with max-h-64 sm:max-h-80 */}
          <div
            ref={listRef}
            className="max-h-64 sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04] p-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10"
          >
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((c, index) => {
                const isSelected = c.code === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={c.code}
                    data-currency-item
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(c.code)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100/90 dark:bg-white/[0.06] text-slate-900 dark:text-white'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CurrencyFlag code={c.code} className="w-5 h-5 shrink-0 shadow-xs" />
                      <div className="min-w-0 flex items-baseline gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                          {c.code}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[130px] sm:max-w-[180px]">
                          {c.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {c.symbol && (
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.06] tabular-nums">
                          {c.symbol}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center px-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 mb-2">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  No currencies found
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  No results matching "{searchQuery}". Try searching by code (PKR), country (Japan), or name.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
