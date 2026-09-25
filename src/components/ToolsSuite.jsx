import React, { useState, useMemo } from 'react';
import { CURRENCIES, getCurrencyInfo } from '../data/currencies';
import { convertCurrency, getExchangeRate, DEFAULT_RATES } from '../services/forexService';
import { 
  Calculator, 
  ArrowLeftRight, 
  Coins, 
  ShieldAlert, 
  Copy, 
  Check, 
  TrendingUp, 
  DollarSign,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ToolsSuite({ rates = DEFAULT_RATES, cryptoList = [] }) {
  const [activeTool, setActiveTool] = useState('forex'); // 'forex', 'crypto', 'risk'

  // Tool 1: Forex Converter State
  const [forexAmount, setForexAmount] = useState('500');
  const [forexBase, setForexBase] = useState('USD');
  const [forexTarget, setForexTarget] = useState('PKR');

  // Tool 2: Crypto Converter State
  const [cryptoToken, setCryptoToken] = useState('btc');
  const [cryptoQty, setCryptoQty] = useState('0.25');
  const [cryptoFiat, setCryptoFiat] = useState('USD');

  // Tool 3: Position Size & Pip Risk Calculator State
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1.5');
  const [stopLossPips, setStopLossPips] = useState('25');
  const [tradingPair, setTradingPair] = useState('EUR/USD');

  const [copied, setCopied] = useState(false);

  const activeRates = useMemo(() => {
    return (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  }, [rates]);

  // Calculations for Tool 1 (Forex)
  const numForexAmount = parseFloat(forexAmount) || 0;
  const forexConverted = useMemo(() => {
    return convertCurrency(numForexAmount, forexBase, forexTarget, activeRates);
  }, [numForexAmount, forexBase, forexTarget, activeRates]);

  const forexDirectRate = useMemo(() => {
    return getExchangeRate(forexBase, forexTarget, activeRates);
  }, [forexBase, forexTarget, activeRates]);

  // Calculations for Tool 2 (Crypto)
  const selectedCoin = useMemo(() => {
    return cryptoList.find(c => c.id === cryptoToken || c.symbol.toLowerCase() === cryptoToken.toLowerCase()) || {
      name: 'Bitcoin', symbol: 'BTC', current_price: 96850
    };
  }, [cryptoList, cryptoToken]);

  const numCryptoQty = parseFloat(cryptoQty) || 0;
  const cryptoTotalUsd = numCryptoQty * (selectedCoin.current_price || 0);
  const cryptoConvertedFiat = useMemo(() => {
    return convertCurrency(cryptoTotalUsd, 'USD', cryptoFiat, activeRates);
  }, [cryptoTotalUsd, cryptoFiat, activeRates]);
  const fiatObj = useMemo(() => getCurrencyInfo(cryptoFiat), [cryptoFiat]);

  // Calculations for Tool 3 (Pip Risk Calculator)
  const numBalance = parseFloat(accountBalance) || 0;
  const numRiskPct = parseFloat(riskPercent) || 0;
  const numPips = parseFloat(stopLossPips) || 0;

  const riskCalculations = useMemo(() => {
    const moneyAtRisk = (numBalance * numRiskPct) / 100;
    
    // Standard pip calculation: for EUR/USD, 1 standard lot (100,000 units) = $10 / pip
    // Pip value per lot varies slightly for JPY pairs (e.g., $6.50 - $7.00 depending on USD/JPY rate)
    let pipValuePerLot = 10;
    if (tradingPair.includes('JPY')) {
      const jpyRate = activeRates.JPY || 153.2;
      pipValuePerLot = (1000 / jpyRate);
    }

    const lotSize = numPips > 0 && pipValuePerLot > 0 
      ? moneyAtRisk / (numPips * pipValuePerLot) 
      : 0;

    const totalUnits = lotSize * 100000;
    const pipValueForPosition = lotSize * pipValuePerLot;

    return {
      moneyAtRisk,
      lotSize: lotSize.toFixed(2),
      miniLots: (lotSize * 10).toFixed(1),
      microLots: (lotSize * 100).toFixed(0),
      totalUnits: Math.round(totalUnits).toLocaleString(),
      pipValueForPosition: pipValueForPosition.toFixed(2)
    };
  }, [numBalance, numRiskPct, numPips, tradingPair, activeRates]);

  const handleCopyResult = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="tools" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 font-mono uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Institutional Calculation Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Financial Tools & Risk Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Precision calculators for spot foreign exchange, digital assets valuation, and position size risk management.
            </p>
          </div>

          {/* Tool Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] self-start md:self-end">
            <button
              onClick={() => setActiveTool('forex')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'forex'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Currency Converter</span>
            </button>
            <button
              onClick={() => setActiveTool('crypto')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'crypto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Crypto Calculator</span>
            </button>
            <button
              onClick={() => setActiveTool('risk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'risk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Position & Pip Risk</span>
            </button>
          </div>
        </div>

        {/* TOOL 1: CURRENCY CONVERTER */}
        {activeTool === 'forex' && (
          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-2xl animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-4 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Amount to Exchange
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={forexAmount}
                  onChange={(e) => setForexAmount(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none"
                  placeholder="100.00"
                />
              </div>

              <div className="lg:col-span-3 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  From Currency
                </label>
                <select
                  value={forexBase}
                  onChange={(e) => setForexBase(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-base focus:outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex justify-center py-1 lg:py-0">
                <button
                  onClick={() => {
                    const temp = forexBase;
                    setForexBase(forexTarget);
                    setForexTarget(temp);
                  }}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-transform hover:rotate-180 shadow-xs"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>
              </div>

              <div className="lg:col-span-3 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  To Currency
                </label>
                <select
                  value={forexTarget}
                  onChange={(e) => setForexTarget(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-base focus:outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Result Display */}
            <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Exchange Value Output
                </div>
                <div className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                  {getCurrencyInfo(forexTarget).symbol} {forexConverted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">{forexTarget}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 tabular-nums">
                  1 {forexBase} = {forexDirectRate < 0.001 ? forexDirectRate.toFixed(6) : forexDirectRate.toFixed(4)} {forexTarget}
                </div>
              </div>

              <button
                onClick={() => handleCopyResult(`${numForexAmount} ${forexBase} = ${forexConverted.toFixed(2)} ${forexTarget}`)}
                className="px-4 py-2.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-800 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-white/[0.08] cursor-pointer shadow-xs active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Value'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TOOL 2: CRYPTO-TO-FIAT CALCULATOR */}
        {activeTool === 'crypto' && (
          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-2xl animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-4 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Crypto Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cryptoQty}
                  onChange={(e) => setCryptoQty(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none"
                  placeholder="1.0"
                />
              </div>

              <div className="lg:col-span-4 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Select Digital Asset
                </label>
                <select
                  value={cryptoToken}
                  onChange={(e) => setCryptoToken(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-base focus:outline-none cursor-pointer"
                >
                  {(cryptoList.length > 0 ? cryptoList : [
                    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', current_price: 96850 },
                    { id: 'eth', name: 'Ethereum', symbol: 'ETH', current_price: 2780 },
                    { id: 'sol', name: 'Solana', symbol: 'SOL', current_price: 194.20 },
                    { id: 'bnb', name: 'BNB', symbol: 'BNB', current_price: 645.10 }
                  ]).map(c => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">
                      {c.name} ({c.symbol.toUpperCase()}) - ${c.current_price?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Destination Fiat
                </label>
                <select
                  value={cryptoFiat}
                  onChange={(e) => setCryptoFiat(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-base focus:outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Crypto Result Display */}
            <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Liquid Fiat Valuation
                </div>
                <div className="text-3xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {fiatObj.symbol} {cryptoConvertedFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-900 dark:text-white text-xl font-bold">{cryptoFiat}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 tabular-nums">
                  {numCryptoQty} {selectedCoin.symbol?.toUpperCase()} = ${cryptoTotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
              </div>

              <button
                onClick={() => handleCopyResult(`${numCryptoQty} ${selectedCoin.symbol?.toUpperCase()} = ${fiatObj.symbol}${cryptoConvertedFiat.toFixed(2)} ${cryptoFiat}`)}
                className="px-4 py-2.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-800 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white text-xs font-semibold flex items-center gap-2 border border-slate-300 dark:border-white/[0.08] cursor-pointer shadow-xs active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Valuation'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TOOL 3: POSITION SIZE & PIP RISK CALCULATOR */}
        {activeTool === 'risk' && (
          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-2xl animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Account Balance (USD)
                </label>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500 mr-1.5 font-mono">$</span>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    className="w-full bg-transparent text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Risk Tolerance (%)
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    className="w-full bg-transparent text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none"
                    placeholder="1.0"
                  />
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500 ml-1.5 font-mono">%</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Stop Loss (Pips)
                </label>
                <input
                  type="number"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(e.target.value)}
                  className="w-full bg-transparent text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none"
                  placeholder="25"
                />
              </div>

              <div className="bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono mb-1">
                  Trading Asset
                </label>
                <select
                  value={tradingPair}
                  onChange={(e) => setTradingPair(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-base focus:outline-none cursor-pointer mt-1"
                >
                  <option value="EUR/USD" className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">EUR/USD</option>
                  <option value="GBP/USD" className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">GBP/USD</option>
                  <option value="USD/JPY" className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">USD/JPY</option>
                  <option value="USD/CHF" className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">USD/CHF</option>
                  <option value="AUD/USD" className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">AUD/USD</option>
                  <option value="USD/CAD" className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">USD/CAD</option>
                </select>
              </div>

            </div>

            {/* Risk Calculation Outputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08]">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Capital at Risk</div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-1">
                  ${riskCalculations.moneyAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Exact max drawdown for this trade
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08]">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Recommended Position Size</div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                  {riskCalculations.lotSize} <span className="text-base text-slate-700 dark:text-slate-300 font-normal">Lots</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {riskCalculations.totalUnits} units of {tradingPair.split('/')[0]}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08]">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Calculated Pip Value</div>
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums mt-1">
                  ${riskCalculations.pipValueForPosition} <span className="text-base text-slate-700 dark:text-slate-300 font-normal">/ pip</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Loss per adverse pip movement
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
