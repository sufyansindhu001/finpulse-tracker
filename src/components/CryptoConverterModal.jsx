import React, { useState, useMemo } from 'react';
import { CURRENCIES, getCurrencyInfo } from '../data/currencies';
import { convertCurrency } from '../services/forexService';
import { X } from 'lucide-react';

export default function CryptoConverterModal({ coin, rates, onClose }) {
  const [cryptoAmount, setCryptoAmount] = useState('1');
  const [fiatCurrency, setFiatCurrency] = useState('USD');

  const fiatObj = useMemo(() => getCurrencyInfo(fiatCurrency), [fiatCurrency]);

  const numAmount = parseFloat(cryptoAmount) || 0;
  
  // Coin price is in USD from CoinGecko live feed
  const totalUsdValue = numAmount * (coin?.current_price || 0);

  // Convert USD total dynamically to target fiat currency using live rates
  const convertedFiat = useMemo(() => {
    return convertCurrency(totalUsdValue, 'USD', fiatCurrency, rates);
  }, [totalUsdValue, fiatCurrency, rates]);

  if (!coin) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          {coin.image ? (
            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
              {coin.symbol.slice(0, 3)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{coin.name} to Fiat</span>
              <span className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-semibold">
                {coin.symbol}
              </span>
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              Live Price: ${coin.current_price < 1 ? coin.current_price.toFixed(4) : coin.current_price.toLocaleString()} USD
            </p>
          </div>
        </div>

        {/* Calculation Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-400 mb-1.5">
              Crypto Amount ({coin.symbol.toUpperCase()})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={cryptoAmount}
              onChange={(e) => setCryptoAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 text-base"
              placeholder="1.0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-400 mb-1.5">
              Target Fiat Currency
            </label>
            <select
              value={fiatCurrency}
              onChange={(e) => setFiatCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick preset amount chips */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Presets:</span>
            {[0.1, 0.5, 1, 5, 10].map((p) => (
              <button
                key={p}
                onClick={() => setCryptoAmount(p.toString())}
                className={`text-[11px] px-2 py-0.5 rounded border font-mono font-semibold transition-colors cursor-pointer ${
                  numAmount === p 
                    ? 'bg-blue-50 dark:bg-blue-600/30 border-blue-500 text-blue-600 dark:text-blue-300' 
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Calculated Output Card */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              Live Converted Total
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {fiatObj.symbol} {convertedFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">
              {numAmount} {coin.symbol.toUpperCase()} = {convertedFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fiatCurrency}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
