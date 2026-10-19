import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';

export default function ScreenerFilterSection({
  filters,
  onChangeFilter,
  onResetFilters,
  appliedCount
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('Popular');
  const [metricsSearch, setMetricsSearch] = useState('');

  // Exact 12 Tabs matching Investing.com
  const categoryTabs = [
    'Popular',
    'Price',
    'Valuation',
    'Insights',
    'Financials',
    'Dividends',
    'Growth',
    'Returns',
    'Risk',
    'Technical',
    'Efficiency',
    'Profile'
  ];

  // All Dropdowns with Tab Association
  const allMetricFilters = useMemo(() => [
    // POPULAR
    {
      id: 'marketCap',
      label: 'Market Cap',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any Market Cap' },
        { value: 'Mega', label: 'Mega-Cap (>200B)' },
        { value: 'Large', label: 'Large-Cap (100B - 200B)' },
        { value: 'Mid', label: 'Mid-Cap (20B - 100B)' },
        { value: 'Small', label: 'Small-Cap (<20B)' }
      ]
    },
    {
      id: 'peRatio',
      label: 'P/E Ratio (TTM)',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any P/E Multiple' },
        { value: 'low5', label: 'Deep Value (< 5.0x)' },
        { value: 'value10', label: 'Attractive (< 10.0x)' },
        { value: 'mod10-25', label: 'Moderate (10.0x - 25.0x)' },
        { value: 'high25', label: 'Growth (> 25.0x)' }
      ]
    },
    {
      id: 'dividendYield',
      label: 'Dividend Yield (%)',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any Dividend Yield' },
        { value: 'over5', label: 'Above 5.0%' },
        { value: 'over10', label: 'Above 10.0% (High Cash)' },
        { value: 'over14', label: 'Super Yield (> 14.0%)' }
      ]
    },
    {
      id: 'lastPrice',
      label: 'Last Price',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any Price' },
        { value: 'under50', label: 'Under 50' },
        { value: '50-200', label: '50 - 200' },
        { value: '200-500', label: '200 - 500' },
        { value: 'over500', label: 'Over 500' }
      ]
    },
    {
      id: 'volume',
      label: 'Volume (3M Avg)',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any Volume' },
        { value: 'over1m', label: 'Liquid (> 1.0M shares)' },
        { value: 'over3m', label: 'High Liquidity (> 3.0M)' },
        { value: 'over5m', label: 'Institutional (> 5.0M)' }
      ]
    },
    {
      id: 'change1Y',
      label: '1-Year Price Change',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any 1Y Performance' },
        { value: 'positive', label: 'Positive (> 0%)' },
        { value: 'over20', label: 'Outperform (> +20%)' },
        { value: 'over50', label: 'High Momentum (> +50%)' }
      ]
    },
    {
      id: 'piotroski',
      label: 'Piotroski F-Score',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'Any Piotroski Score' },
        { value: 'high7', label: 'High Quality (>= 7)' },
        { value: 'moderate', label: 'Moderate Quality (5 - 6)' }
      ]
    },
    {
      id: 'sector',
      label: 'Sector',
      tab: 'Popular',
      options: [
        { value: 'Any', label: 'All Sectors' },
        { value: 'Financials', label: 'Financials' },
        { value: 'Energy', label: 'Energy' },
        { value: 'Basic Materials', label: 'Basic Materials' },
        { value: 'Industrials', label: 'Industrials' },
        { value: 'Consumer Cyclicals', label: 'Consumer Cyclicals' },
        { value: 'Consumer Non-Cyclicals', label: 'Consumer Non-Cyclicals' },
        { value: 'Technology', label: 'Technology' },
        { value: 'Utilities', label: 'Utilities' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Real Estate', label: 'Real Estate' }
      ]
    },

    // PRICE TAB
    {
      id: 'range52',
      label: '52-Week Range Proximity',
      tab: 'Price',
      options: [
        { value: 'Any', label: 'Any 52W Proximity' },
        { value: 'nearHigh', label: 'Near 52W High (< 10% below peak)' },
        { value: 'nearLow', label: 'Near 52W Low (< 15% above trough)' }
      ]
    },
    {
      id: 'change24hPct',
      label: '24h Change (%)',
      tab: 'Price',
      options: [
        { value: 'Any', label: 'Any Daily Change' },
        { value: 'gainers', label: 'Top Gainers (> +1.5%)' },
        { value: 'losers', label: 'Pullbacks (< 0%)' }
      ]
    },

    // VALUATION TAB
    {
      id: 'pbRatio',
      label: 'Price to Book (P/B)',
      tab: 'Valuation',
      options: [
        { value: 'Any', label: 'Any P/B Ratio' },
        { value: 'below1', label: 'Discount to Book (< 1.0x)' },
        { value: '1-3', label: 'Fair Book (1.0x - 3.0x)' },
        { value: 'above3', label: 'Premium (> 3.0x)' }
      ]
    },
    {
      id: 'evEbitda',
      label: 'EV / EBITDA',
      tab: 'Valuation',
      options: [
        { value: 'Any', label: 'Any EV/EBITDA' },
        { value: 'low5', label: 'Deep Value (< 5.0x)' },
        { value: '5-10', label: 'Moderate (5.0x - 10.0x)' },
        { value: 'over10', label: 'Growth (> 10.0x)' }
      ]
    },
    {
      id: 'forwardPe',
      label: 'Forward P/E Ratio',
      tab: 'Valuation',
      options: [
        { value: 'Any', label: 'Any Forward P/E' },
        { value: 'low6', label: 'Attractive (< 6.0x)' },
        { value: '6-12', label: 'Fair (6.0x - 12.0x)' },
        { value: 'over12', label: 'Premium (> 12.0x)' }
      ]
    },

    // INSIGHTS TAB
    {
      id: 'fairValue',
      label: 'Fair Value Upside',
      tab: 'Insights',
      options: [
        { value: 'Any', label: 'Any Upside' },
        { value: 'over10', label: 'Upside > 10%' },
        { value: 'over20', label: 'Upside > 20%' },
        { value: 'over30', label: 'High Discount (> 30%)' }
      ]
    },
    {
      id: 'analystUpside',
      label: 'Analyst Target Upside',
      tab: 'Insights',
      options: [
        { value: 'Any', label: 'Any Target Upside' },
        { value: 'over10', label: 'Target Upside > 10%' },
        { value: 'over20', label: 'Target Upside > 20%' },
        { value: 'over30', label: 'Strong Target (> 30%)' }
      ]
    },
    {
      id: 'analystRating',
      label: 'Analyst Consensus',
      tab: 'Insights',
      options: [
        { value: 'Any', label: 'Any Consensus' },
        { value: 'Strong Buy', label: 'Strong Buy' },
        { value: 'Buy', label: 'Buy' },
        { value: 'Hold', label: 'Hold' }
      ]
    },

    // FINANCIALS TAB
    {
      id: 'salesLevel',
      label: 'Sales / Revenue Level',
      tab: 'Financials',
      options: [
        { value: 'Any', label: 'Any Revenue' },
        { value: 'over100b', label: 'Mega Sales (> 100B)' },
        { value: '20-100b', label: 'Mid-Scale (20B - 100B)' },
        { value: 'under20b', label: 'Emerging (< 20B)' }
      ]
    },
    {
      id: 'netProfit',
      label: 'Net Profit Margin',
      tab: 'Financials',
      options: [
        { value: 'Any', label: 'Any Margin' },
        { value: 'over20pct', label: 'High Margin (> 20%)' },
        { value: '10-20pct', label: 'Stable Margin (10% - 20%)' }
      ]
    },
    {
      id: 'debtEquity',
      label: 'Debt-to-Equity Ratio',
      tab: 'Financials',
      options: [
        { value: 'Any', label: 'Any Leverage' },
        { value: 'zeroDebt', label: 'Virtually Debt-Free (< 0.10)' },
        { value: 'lowDebt', label: 'Conservative (< 0.50)' },
        { value: 'modDebt', label: 'Moderate Leverage (< 1.00)' }
      ]
    },

    // DIVIDENDS TAB
    {
      id: 'payoutRatio',
      label: 'Dividend Payout Ratio',
      tab: 'Dividends',
      options: [
        { value: 'Any', label: 'Any Payout Ratio' },
        { value: 'sustainable', label: 'Sustainable (< 60%)' },
        { value: 'highPayout', label: 'Generous (> 60%)' }
      ]
    },
    {
      id: 'divGrowth',
      label: '5-Year Dividend Growth',
      tab: 'Dividends',
      options: [
        { value: 'Any', label: 'Any Dividend Growth' },
        { value: 'growing', label: 'Positive CAGR (> 5%)' },
        { value: 'highGrowth', label: 'Rapid CAGR (> 15%)' }
      ]
    },

    // GROWTH TAB
    {
      id: 'epsGrowth',
      label: 'EPS Growth YoY',
      tab: 'Growth',
      options: [
        { value: 'Any', label: 'Any EPS Growth' },
        { value: 'over25', label: 'High Velocity (> +25%)' },
        { value: '10-25', label: 'Solid (+10% to +25%)' },
        { value: 'positive', label: 'Positive Growth (> 0%)' }
      ]
    },
    {
      id: 'revenueGrowth',
      label: 'Revenue Growth YoY',
      tab: 'Growth',
      options: [
        { value: 'Any', label: 'Any Revenue Growth' },
        { value: 'over20', label: 'Rapid (> +20%)' },
        { value: '10-20', label: 'Expansion (+10% to +20%)' }
      ]
    },

    // RETURNS TAB
    {
      id: 'ytdChange',
      label: 'YTD Price Change',
      tab: 'Returns',
      options: [
        { value: 'Any', label: 'Any YTD Return' },
        { value: 'over20', label: 'Outperform (> +20%)' },
        { value: 'over50', label: 'Super Outperform (> +50%)' },
        { value: 'positive', label: 'Positive (> 0%)' }
      ]
    },
    {
      id: 'return3M',
      label: '3-Month Performance',
      tab: 'Returns',
      options: [
        { value: 'Any', label: 'Any 3M Return' },
        { value: 'over10', label: 'Strong (+10% or higher)' },
        { value: 'positive', label: 'Positive (> 0%)' }
      ]
    },

    // RISK TAB
    {
      id: 'beta',
      label: 'Beta (5Y Monthly)',
      tab: 'Risk',
      options: [
        { value: 'Any', label: 'Any Beta' },
        { value: 'lowBeta', label: 'Low Volatility (< 0.80)' },
        { value: 'marketBeta', label: 'Market Tracking (0.80 - 1.20)' },
        { value: 'highBeta', label: 'High Volatility (> 1.20)' }
      ]
    },
    {
      id: 'altmanZ',
      label: 'Altman Z-Score',
      tab: 'Risk',
      options: [
        { value: 'Any', label: 'Any Z-Score' },
        { value: 'safe3', label: 'Safe Balance Sheet (>= 3.0)' },
        { value: 'grey', label: 'Grey Zone (1.8 - 2.9)' }
      ]
    },

    // TECHNICAL TAB
    {
      id: 'rsi',
      label: 'RSI (14-Day)',
      tab: 'Technical',
      options: [
        { value: 'Any', label: 'Any RSI Level' },
        { value: 'oversold', label: 'Oversold (< 35)' },
        { value: 'neutral', label: 'Neutral Zone (35 - 70)' },
        { value: 'overbought', label: 'Overbought (> 70)' }
      ]
    },
    {
      id: 'technicalRating',
      label: 'Technical Rating',
      tab: 'Technical',
      options: [
        { value: 'Any', label: 'Any Technical Signal' },
        { value: 'Strong Buy', label: 'Strong Buy Setup' },
        { value: 'Buy', label: 'Buy Trend' },
        { value: 'Hold', label: 'Hold / Consolidation' }
      ]
    },

    // EFFICIENCY TAB
    {
      id: 'roe',
      label: 'Return on Equity (ROE)',
      tab: 'Efficiency',
      options: [
        { value: 'Any', label: 'Any ROE' },
        { value: 'over25', label: 'High Efficiency (> 25%)' },
        { value: '15-25', label: 'Strong Capital (15% - 25%)' }
      ]
    },
    {
      id: 'roic',
      label: 'Return on Invested Capital (ROIC)',
      tab: 'Efficiency',
      options: [
        { value: 'Any', label: 'Any ROIC' },
        { value: 'over20pct', label: 'Peerless Compounding (> 20%)' },
        { value: '10-20pct', label: 'Quality Capital (10% - 20%)' }
      ]
    },

    // PROFILE TAB
    {
      id: 'exchange',
      label: 'Primary Exchange',
      tab: 'Profile',
      options: [
        { value: 'Any', label: 'All Exchanges' },
        { value: 'Karachi', label: 'PSX Karachi' },
        { value: 'NASDAQ', label: 'NASDAQ' },
        { value: 'NYSE', label: 'NYSE' },
        { value: 'LSE', label: 'London (LSE)' },
        { value: 'Tadawul', label: 'Saudi Tadawul' },
        { value: 'Tokyo', label: 'Tokyo (TSE)' }
      ]
    },
    {
      id: 'industry',
      label: 'Industry Classification',
      tab: 'Profile',
      options: [
        { value: 'Any', label: 'Any Industry' },
        { value: 'Oil & Gas', label: 'Oil & Gas' },
        { value: 'Banking Services', label: 'Banking Services' },
        { value: 'Chemicals', label: 'Chemicals' },
        { value: 'Construction Materials', label: 'Construction Materials' },
        { value: 'Textiles & Apparel', label: 'Textiles & Apparel' },
        { value: 'Automobiles & Auto Parts', label: 'Automobiles & Auto Parts' },
        { value: 'Food & Tobacco', label: 'Food & Tobacco' },
        { value: 'Software & IT Services', label: 'Software & IT Services' },
        { value: 'Telecommunications', label: 'Telecommunications' },
        { value: 'Pharmaceuticals', label: 'Pharmaceuticals' }
      ]
    },
    {
      id: 'equityType',
      label: 'Equity Type',
      tab: 'Profile',
      options: [
        { value: 'Any', label: 'Any Equity Type' },
        { value: 'Common Stock', label: 'Common Stock' },
        { value: 'Preferred Stock', label: 'Preferred Stock' },
        { value: 'ADR', label: 'ADR / GDR' },
        { value: 'REIT', label: 'REIT' }
      ]
    },
    {
      id: 'nextEarnings',
      label: 'Next Earnings Date',
      tab: 'Profile',
      options: [
        { value: 'Any', label: 'Any Earnings Horizon' },
        { value: 'thisMonth', label: 'Reporting This Month' },
        { value: 'nextMonth', label: 'Reporting Next Month' },
        { value: 'q4', label: 'Q4 Fiscal Close' }
      ]
    }
  ], []);

  // Filter dropdowns by active tab OR search query
  const displayedFilters = useMemo(() => {
    const q = metricsSearch.toLowerCase().trim();
    if (q) {
      return allMetricFilters.filter(f => 
        f.label.toLowerCase().includes(q) || f.tab.toLowerCase().includes(q)
      );
    }
    return allMetricFilters.filter(f => f.tab === activeCategoryTab);
  }, [allMetricFilters, activeCategoryTab, metricsSearch]);

  return (
    <div className="w-full bg-white dark:bg-[#0A1726] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      
      {/* 1. Header Bar: Filters Label + Applied Count + Metric Search */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/70 dark:bg-[#06111F]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#00E676]/10 flex items-center justify-center border border-[#00E676]/20">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Filters
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-600/10 text-blue-600 dark:bg-[#00E676]/20 dark:text-[#00E676] border border-blue-600/20 dark:border-[#00E676]/30">
            Applied Filters {appliedCount}
          </span>
        </div>

        {/* Search for 100+ metrics input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for 100+ metrics..."
            value={metricsSearch}
            onChange={(e) => setMetricsSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0A1726] border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-medium"
          />
        </div>
      </div>

      {/* 2. 12 Filter Category Tabs Bar */}
      <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-none bg-gray-50/40 dark:bg-[#0A1726]">
        {categoryTabs.map((tab) => {
          const isActive = activeCategoryTab === tab && !metricsSearch;
          // Count active filters in this tab
          const tabFilterIds = allMetricFilters.filter(f => f.tab === tab).map(f => f.id);
          const activeInTab = tabFilterIds.filter(id => filters[id] && filters[id] !== 'Any').length;

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveCategoryTab(tab);
                setMetricsSearch('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white dark:bg-[#00E676] dark:text-[#06111F] shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab}</span>
              {activeInTab > 0 && (
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  isActive ? 'bg-white text-blue-600 dark:bg-[#06111F] dark:text-[#00E676]' : 'bg-blue-600 text-white dark:bg-[#00E676] dark:text-[#06111F]'
                }`}>
                  {activeInTab}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Filter Dropdowns Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedFilters.map((metric) => {
          const isFilterActive = filters[metric.id] && filters[metric.id] !== 'Any';

          return (
            <div key={metric.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <span>{metric.label}</span>
                  {metricsSearch && (
                    <span className="text-[10px] px-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-normal">
                      {metric.tab}
                    </span>
                  )}
                </label>
                {isFilterActive && (
                  <span className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-[#00E676] font-bold">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <select
                value={filters[metric.id] || 'Any'}
                onChange={(e) => onChangeFilter(metric.id, e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors ${
                  isFilterActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-400 dark:border-blue-500 text-blue-900 dark:text-blue-200'
                    : 'bg-gray-50 dark:bg-[#06111F] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {metric.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {displayedFilters.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
            No screening metrics match "{metricsSearch}". Try browsing the category tabs above.
          </div>
        )}
      </div>

      {/* 4. Bottom Action Bar: Reset Filters */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#06111F]/70 flex items-center justify-between">
        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
          Showing filters for <strong className="text-gray-900 dark:text-gray-100">{metricsSearch ? `Search "${metricsSearch}"` : activeCategoryTab}</strong> • Changes apply in real-time.
        </span>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

    </div>
  );
}
