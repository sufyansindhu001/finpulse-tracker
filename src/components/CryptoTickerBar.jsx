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
    <div className="w-full bg-slate-950/90 border-b border-slate-800 text-xs py-2 overflow-hidden select-none backdrop-blur-md sticky top-0 z-40">
      <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
        {tickerItems.map((coin, index) => {
          const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
          return (
            <div
              key={`${coin.id}-${index}`}
              onClick={() => onSelectCoin && onSelectCoin(coin)}
              className="inline-flex items-center gap-2 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-800/80 transition-colors"
              title={`Click to convert ${coin.name} in fiat`}
            >
              {coin.image && (
                <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
              )}
              <span className="font-semibold text-slate-200 uppercase">{coin.symbol}</span>
              <span className="text-slate-300 font-mono">
                ${coin.current_price < 1 
                  ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                  : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-medium font-mono ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3 h-3 stroke-[2.5]" />
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
