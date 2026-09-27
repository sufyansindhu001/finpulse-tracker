import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart2, ShieldCheck, Zap, Globe, Sparkles, TrendingUp } from 'lucide-react';

export default function HeroSection({ onExploreMarkets, onViewData }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  // Interactive Financial Depth & Wave Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);
    window.addEventListener('resize', resize);

    const render = () => {
      step += 0.015;
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      const isDark = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)';
      ctx.lineWidth = 1;
      const gridSpacing = 36;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Financial waves (Bid Depth in blue, Ask Depth in emerald, Secondary in indigo)
      const waves = [
        {
          color: 'rgba(59, 130, 246, 0.4)', // Blue
          fillGradient: ['rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.0)'],
          amplitude: 24,
          frequency: 0.008,
          speed: step,
          yOffset: height * 0.52
        },
        {
          color: 'rgba(16, 185, 129, 0.45)', // Emerald
          fillGradient: ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.0)'],
          amplitude: 18,
          frequency: 0.012,
          speed: step * 1.2 + 1,
          yOffset: height * 0.58
        },
        {
          color: 'rgba(129, 140, 248, 0.28)', // Indigo
          fillGradient: ['rgba(129, 140, 248, 0.06)', 'rgba(129, 140, 248, 0.0)'],
          amplitude: 14,
          frequency: 0.015,
          speed: step * 0.8 + 2,
          yOffset: height * 0.64
        }
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 4) {
          let mouseInfluence = 0;
          if (mousePos.active) {
            const dist = Math.abs(x - mousePos.x);
            if (dist < 120) {
              mouseInfluence = Math.cos((dist / 120) * (Math.PI / 2)) * -20;
            }
          }

          const y = wave.yOffset + 
            Math.sin(x * wave.frequency + wave.speed) * wave.amplitude +
            Math.cos(x * 0.003 + wave.speed * 0.6) * 8 +
            mouseInfluence;

          if (x === 0) ctx.lineTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, wave.yOffset - wave.amplitude, 0, height);
        grad.addColorStop(0, wave.fillGradient[0]);
        grad.addColorStop(1, wave.fillGradient[1]);
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          let mouseInfluence = 0;
          if (mousePos.active) {
            const dist = Math.abs(x - mousePos.x);
            if (dist < 120) {
              mouseInfluence = Math.cos((dist / 120) * (Math.PI / 2)) * -20;
            }
          }
          const y = wave.yOffset + 
            Math.sin(x * wave.frequency + wave.speed) * wave.amplitude +
            Math.cos(x * 0.003 + wave.speed * 0.6) * 8 +
            mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Subtle luminous nodes riding the waves
      const nodes = [
        { xRatio: 0.22, yRatio: 0.52, color: '#10B981' },
        { xRatio: 0.52, yRatio: 0.44, color: '#3B82F6' },
        { xRatio: 0.82, yRatio: 0.58, color: '#818CF8' }
      ];

      nodes.forEach((node) => {
        const nx = width * node.xRatio;
        const ny = height * node.yRatio + Math.sin(step * 1.5 + nx) * 5;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [mousePos]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, active: false }));
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-slate-200/80 dark:border-white/[0.06]">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/[0.05] dark:bg-blue-600/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Institutional Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px] font-mono tracking-wider uppercase">Live Terminal Feed</span>
            <span className="text-slate-300 dark:text-white/[0.2]">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold tabular-nums">160+ Currencies & Crypto</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Understand Markets.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Make Smarter Decisions.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Real-time market data, financial insights, research and powerful tools designed to help you understand global markets.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreMarkets}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore Markets</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onViewData}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 dark:bg-[#0C1017] dark:hover:bg-[#111622] dark:text-slate-200 dark:hover:text-white font-semibold text-sm transition-all border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
            >
              <BarChart2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>View Market Data</span>
            </button>
          </div>
        </div>

        {/* Interactive Financial Depth & Wave Canvas Visualizer */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div 
            className="relative rounded-2xl bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] p-2 sm:p-4 overflow-hidden shadow-lg dark:shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Visualizer Header Bar: Dedicated Two-Column Row */}
            <div className="flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 border-b border-slate-100 dark:border-white/[0.05] text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="flex gap-1 sm:gap-1.5 shrink-0">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="font-mono text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate ml-1 sm:ml-1.5">
                  FINPULSE_MARKET_DEPTH_FLOW
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-mono">
                <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[10px] sm:text-xs shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  Order Flow: Balanced
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs hidden md:inline shrink-0">
                  Latency &lt; 40ms
                </span>
              </div>
            </div>

            {/* Dynamic HTML5 Wave Canvas Container: w-full h-44 sm:h-52 */}
            <div className="relative w-full h-44 sm:h-52 overflow-hidden rounded-xl bg-slate-50/50 dark:bg-black/20">
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-crosshair"
              />

              {/* Responsive Market Price Tags (clean flex spacing, no hardcoded left percentages) */}
              <div className="absolute inset-x-0 bottom-2.5 sm:bottom-3 px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-none z-10">
                <div className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#07090E]/90 border border-slate-200/90 dark:border-white/10 backdrop-blur-md shadow-xs flex items-center gap-1.5 text-[10px] sm:text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-slate-900 dark:text-white font-bold">BTC/USD</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">+2.4%</span>
                </div>

                <div className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#07090E]/90 border border-slate-200/90 dark:border-white/10 backdrop-blur-md shadow-xs flex items-center gap-1.5 text-[10px] sm:text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-900 dark:text-white font-bold">USD/PKR</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold tabular-nums">278.09</span>
                </div>

                <div className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#07090E]/90 border border-slate-200/90 dark:border-white/10 backdrop-blur-md shadow-xs flex items-center gap-1.5 text-[10px] sm:text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-slate-900 dark:text-white font-bold">EUR/USD</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">1.084</span>
                </div>
              </div>
            </div>

            {/* Metric Footer Ribbon: 2x2 grid on mobile, 4 columns on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.05] text-xs font-mono">
              <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200/80 dark:border-white/[0.04] min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 uppercase font-semibold truncate">Live Fiat Pairs</div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold tabular-nums mt-0.5 truncate">160+ Currencies</div>
              </div>
              <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200/80 dark:border-white/[0.04] min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 uppercase font-semibold truncate">CoinGecko Feed</div>
                <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-bold tabular-nums mt-0.5 truncate">20 Top Cryptos</div>
              </div>
              <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200/80 dark:border-white/[0.04] min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 uppercase font-semibold truncate">Benchmark USD/PKR</div>
                <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold tabular-nums mt-0.5 truncate">278.09 Baseline</div>
              </div>
              <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200/80 dark:border-white/[0.04] min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 uppercase font-semibold truncate">Markup Spread</div>
                <div className="text-xs sm:text-sm text-slate-900 dark:text-white font-bold tabular-nums mt-0.5 truncate">0.00% Zero Fee</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
