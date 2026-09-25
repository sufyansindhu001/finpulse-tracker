import React from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export default function CryptoTickerBar({ cryptoList = [], onSelectCoin }) {
  if (!cryptoList || cryptoList.length === 0) {
    return (
      <div className="w-full bg-slate-950 border-b border-slate-800 text-xs py-2 px-4 flex items-center justify-center gap-2 text-slate-400 sticky top-0 z-40">
        <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
        <span className="font-mono text-[11px]">Connecting to live cryptocurrency ticker feed...</span>
      </div>
    );
  }

  // Duplicate list to achieve continuous infinite marquee loop
  const tickerItems = [...cryptoList, ...cryptoList];

  return (
    <div className="w-full bg-[#070A12]/95 border-b border-white/[0.06] text-xs py-1.5 overflow-hidden select-none backdrop-blur-xl sticky top-0 z-40">
      <div className="animate-marquee flex items-center gap-7 whitespace-nowrap">
        {tickerItems.map((coin, index) => {
          const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
          return (
            <div
              key={`${coin.id}-${index}`}
              onClick={() => onSelectCoin && onSelectCoin(coin)}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full cursor-pointer hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
              title={`Click to convert ${coin.name} in fiat`}
            >
              {coin.image && (
                <img src={coin.image} alt={coin.name} className="w-3.5 h-3.5 rounded-full" />
              )}
              <span className="font-semibold text-slate-200 uppercase tracking-tight text-[11px]">{coin.symbol}</span>
              <span className="text-slate-300 font-mono font-medium text-[11px] tabular-nums">
                ${coin.current_price < 1 
                  ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                  : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-semibold font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
                  isPositive 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                )}
                {isPositive ? '+' : ''}
                {coin.price_change_percentage_24h !== undefined && coin.price_change_percentage_24h !== null
                  ? coin.price_change_percentage_24h.toFixed(2)
                  : '0.00'}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
