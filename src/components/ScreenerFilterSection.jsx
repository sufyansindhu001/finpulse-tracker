import React, { useState } from 'react';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function ScreenerFilterSection({
  filters,
  onChangeFilter,
  onResetFilters,
  appliedCount
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('Popular');
  const [metricsSearch, setMetricsSearch] = useState('');

  const categoryTabs = [
    'Popular',
    'Price',
    'Valuation',
    'Growth',
    'Efficiency',
    'Dividends',
    'Financial',
    'Technical',
    'Performance',
    'Risk',
    'Forecasts',
    'Profile',
    'Insiders'
  ];

  return (
    <div className="w-full bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden transition-colors">
      
      {/* 1. Header Bar: Filters Label + Applied Count + Metric Search */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#06111F]/70">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-[#00E676]" />
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-600/10 text-blue-600 dark:bg-[#00E676]/20 dark:text-[#00E676] border border-blue-600/20 dark:border-[#00E676]/30">
            Applied Filters {appliedCount}
          </span>
        </div>

        {/* Search for 100+ metrics input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for 100+ metrics..."
            value={metricsSearch}
            onChange={(e) => setMetricsSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/15 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 2. 13 Filter Category Tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none bg-slate-50/30 dark:bg-[#0A1726]">
        {categoryTabs.map((tab) => {
          const isActive = activeCategoryTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveCategoryTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-200 dark:bg-white/15 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 3. 19 Filter Dropdowns in a 4-Column Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Market Cap */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Market Cap</label>
          <select
            value={filters.marketCap || 'Any'}
            onChange={(e) => onChangeFilter('marketCap', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Market Cap</option>
            <option value="Mega">Mega-Cap (&gt;200B)</option>
            <option value="Large">Large-Cap (100B - 200B)</option>
            <option value="Mid">Mid-Cap (20B - 100B)</option>
            <option value="Small">Small-Cap (&lt;20B)</option>
          </select>
        </div>

        {/* 2. Last Price */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Last Price</label>
          <select
            value={filters.lastPrice || 'Any'}
            onChange={(e) => onChangeFilter('lastPrice', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Price</option>
            <option value="under50">Under 50</option>
            <option value="50-200">50 - 200</option>
            <option value="200-500">200 - 500</option>
            <option value="over500">Over 500</option>
          </select>
        </div>

        {/* 3. Volume (3M Avg) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Volume (3M Avg)</label>
          <select
            value={filters.volume || 'Any'}
            onChange={(e) => onChangeFilter('volume', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Volume</option>
            <option value="over500k">Over 500K</option>
            <option value="over1m">Over 1M</option>
            <option value="over5m">Over 5M</option>
          </select>
        </div>

        {/* 4. 1-Year Change (%) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">1-Year Change (%)</label>
          <select
            value={filters.change1Y || 'Any'}
            onChange={(e) => onChangeFilter('change1Y', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any 1Y Change</option>
            <option value="positive">Positive (&gt; 0%)</option>
            <option value="over20">Over +20%</option>
            <option value="over50">Over +50%</option>
            <option value="negative">Negative (&lt; 0%)</option>
          </select>
        </div>

        {/* 5. Fair Value Upside */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Fair Value Upside</label>
          <select
            value={filters.fairValue || 'Any'}
            onChange={(e) => onChangeFilter('fairValue', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Fair Value</option>
            <option value="over10">Over +10% Upside</option>
            <option value="over25">Over +25% Upside</option>
            <option value="over50">Over +50% Upside</option>
          </select>
        </div>

        {/* 6. Analyst Target Upside */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Analyst Target Upside</label>
          <select
            value={filters.analystUpside || 'Any'}
            onChange={(e) => onChangeFilter('analystUpside', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Target Upside</option>
            <option value="over10">Over +10%</option>
            <option value="over20">Over +20%</option>
            <option value="over30">Over +30%</option>
          </select>
        </div>

        {/* 7. P/E Ratio */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">P/E Ratio</label>
          <select
            value={filters.peRatio || 'Any'}
            onChange={(e) => onChangeFilter('peRatio', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any P/E</option>
            <option value="low5">Frontier Deep Value (&lt; 5.0x)</option>
            <option value="value10">Value (&lt; 10.0x)</option>
            <option value="mod10-25">Moderate (10x - 25x)</option>
            <option value="high25">High Growth (&gt; 25x)</option>
          </select>
        </div>

        {/* 8. Price / Book (P/B) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Price / Book (P/B)</label>
          <select
            value={filters.pbRatio || 'Any'}
            onChange={(e) => onChangeFilter('pbRatio', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any P/B</option>
            <option value="below1">Below Book Value (&lt; 1.0x)</option>
            <option value="1-3">Fair (1.0x - 3.0x)</option>
            <option value="above3">Premium (&gt; 3.0x)</option>
          </select>
        </div>

        {/* 9. Relative Strength Index (RSI 14d) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">RSI (14d)</label>
          <select
            value={filters.rsi || 'Any'}
            onChange={(e) => onChangeFilter('rsi', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any RSI</option>
            <option value="oversold">Oversold (&lt; 35)</option>
            <option value="neutral">Neutral (35 - 70)</option>
            <option value="overbought">Overbought (&gt; 70)</option>
          </select>
        </div>

        {/* 10. Piotroski F-Score */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Piotroski F-Score</label>
          <select
            value={filters.piotroski || 'Any'}
            onChange={(e) => onChangeFilter('piotroski', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any F-Score</option>
            <option value="high7">Strong Quality (7 - 9)</option>
            <option value="mid5">Average (5 - 6)</option>
            <option value="low4">Low (&lt;= 4)</option>
          </select>
        </div>

        {/* 11. Altman Z-Score */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Altman Z-Score</label>
          <select
            value={filters.altmanZ || 'Any'}
            onChange={(e) => onChangeFilter('altmanZ', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Z-Score</option>
            <option value="safe3">Safe Zone (&gt; 3.0)</option>
            <option value="grey">Grey Zone (1.8 - 3.0)</option>
            <option value="distress">Distress (&lt; 1.8)</option>
          </select>
        </div>

        {/* 12. EV / EBITDA */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">EV / EBITDA</label>
          <select
            value={filters.evEbitda || 'Any'}
            onChange={(e) => onChangeFilter('evEbitda', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any EV/EBITDA</option>
            <option value="under5">Under 5.0x</option>
            <option value="5-10">5.0x - 10.0x</option>
            <option value="over10">Over 10.0x</option>
          </select>
        </div>

        {/* 13. Index */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Index</label>
          <select
            value={filters.index || 'Any'}
            onChange={(e) => onChangeFilter('index', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Benchmark Index</option>
            <option value="primary">Benchmark Top Index</option>
            <option value="islamic">Islamic Shariah Compliant</option>
            <option value="all">All Share Index</option>
          </select>
        </div>

        {/* 14. Dividend Yield (%) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Dividend Yield (%)</label>
          <select
            value={filters.dividendYield || 'Any'}
            onChange={(e) => onChangeFilter('dividendYield', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Dividend Yield</option>
            <option value="over5">Over 5% Yield</option>
            <option value="over10">Over 10% Yield</option>
            <option value="over14">Over 14% Super Yield</option>
          </select>
        </div>

        {/* 15. 52-Week Range (%) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">52-Week Range (%)</label>
          <select
            value={filters.range52 || 'Any'}
            onChange={(e) => onChangeFilter('range52', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Range Position</option>
            <option value="nearHigh">Near 52W High (&gt;80%)</option>
            <option value="nearLow">Near 52W Low (&lt;25%)</option>
            <option value="mid">Mid-Range (25% - 80%)</option>
          </select>
        </div>

        {/* 16. Exchange */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Exchange</label>
          <select
            value={filters.exchange || 'Any'}
            onChange={(e) => onChangeFilter('exchange', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Exchange</option>
            <option value="Karachi">Karachi (PSX)</option>
            <option value="NASDAQ">NASDAQ</option>
            <option value="NYSE">NYSE</option>
            <option value="LSE">London Stock Exchange</option>
          </select>
        </div>

        {/* 17. Sector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Sector</label>
          <select
            value={filters.sector || 'Any'}
            onChange={(e) => onChangeFilter('sector', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Sector</option>
            <option value="Financials">Financials</option>
            <option value="Energy">Energy</option>
            <option value="Basic Materials">Basic Materials</option>
            <option value="Consumer Cyclicals">Consumer Cyclicals</option>
            <option value="Consumer Non-Cyclicals">Consumer Non-Cyclicals</option>
            <option value="Technology">Technology</option>
            <option value="Utilities">Utilities</option>
            <option value="Industrials">Industrials</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>

        {/* 18. Industry */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Industry</label>
          <select
            value={filters.industry || 'Any'}
            onChange={(e) => onChangeFilter('industry', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Industry</option>
            <option value="Oil & Gas">Oil & Gas</option>
            <option value="Banking Services">Banking Services</option>
            <option value="Chemicals">Chemicals</option>
            <option value="Construction Materials">Construction Materials</option>
            <option value="Textiles & Apparel">Textiles & Apparel</option>
            <option value="Automobiles & Auto Parts">Automobiles & Auto Parts</option>
            <option value="Food & Tobacco">Food & Tobacco</option>
            <option value="Software & IT Services">Software & IT Services</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Pharmaceuticals">Pharmaceuticals</option>
          </select>
        </div>

        {/* 19. Equity Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Equity Type</label>
          <select
            value={filters.equityType || 'Any'}
            onChange={(e) => onChangeFilter('equityType', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Any">Any Equity Type</option>
            <option value="Common Stock">Common Stock</option>
            <option value="Preferred Stock">Preferred Stock</option>
            <option value="ADR">ADR</option>
            <option value="REIT">REIT</option>
          </select>
        </div>

      </div>

      {/* 4. Bottom Action Bar: Reset Filters */}
      <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#06111F] flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          *All filters apply in real-time across active exchange listings.
        </span>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

    </div>
  );
}
