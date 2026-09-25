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

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      step += 0.015;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
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

      // Financial waves (Bid Depth wave in cyan/blue, Ask Depth wave in emerald)
      const waves = [
        {
          color: 'rgba(59, 130, 246, 0.35)', // Blue
          fillGradient: ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.0)'],
          amplitude: 38,
          frequency: 0.007,
          speed: step,
          yOffset: height * 0.55
        },
        {
          color: 'rgba(16, 185, 129, 0.4)', // Emerald
          fillGradient: ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.0)'],
          amplitude: 28,
          frequency: 0.011,
          speed: step * 1.3 + 1,
          yOffset: height * 0.62
        },
        {
          color: 'rgba(129, 140, 248, 0.25)', // Indigo
          fillGradient: ['rgba(129, 140, 248, 0.08)', 'rgba(129, 140, 248, 0.0)'],
          amplitude: 20,
          frequency: 0.014,
          speed: step * 0.8 + 2,
          yOffset: height * 0.68
        }
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 4) {
          // Dynamic mouse elevation effect
          let mouseInfluence = 0;
          if (mousePos.active) {
            const dist = Math.abs(x - mousePos.x);
            if (dist < 150) {
              mouseInfluence = Math.cos((dist / 150) * (Math.PI / 2)) * -25;
            }
          }

          const y = wave.yOffset + 
            Math.sin(x * wave.frequency + wave.speed) * wave.amplitude +
            Math.cos(x * 0.003 + wave.speed * 0.6) * 12 +
            mouseInfluence;

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Fill wave gradient
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
            if (dist < 150) {
              mouseInfluence = Math.cos((dist / 150) * (Math.PI / 2)) * -25;
            }
          }
          const y = wave.yOffset + 
            Math.sin(x * wave.frequency + wave.speed) * wave.amplitude +
            Math.cos(x * 0.003 + wave.speed * 0.6) * 12 +
            mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Floating market liquidity price points
      const points = [
        { x: width * 0.22, yRatio: 0.52, label: 'BTC/USD +2.4%', color: '#10B981' },
        { x: width * 0.55, yRatio: 0.44, label: 'USD/PKR 278.09', color: '#3B82F6' },
        { x: width * 0.82, yRatio: 0.58, label: 'EUR/USD 1.084', color: '#818CF8' }
      ];

      points.forEach((pt) => {
        const py = height * pt.yRatio + Math.sin(step * 1.5 + pt.x) * 6;
        
        // Dot
        ctx.beginPath();
        ctx.arc(pt.x, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label pill
        ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        const textWidth = 85;
        ctx.beginPath();
        ctx.roundRect(pt.x - textWidth / 2, py - 26, textWidth, 18, 9);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pt.label, pt.x, py - 17);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-white/[0.06]">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Institutional Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C1017] border border-white/[0.08] text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono tracking-wider uppercase">Live Terminal Feed</span>
            <span className="text-white/[0.2]">•</span>
            <span className="text-emerald-400 font-mono text-[11px] font-semibold tabular-nums">160+ Currencies & Crypto</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Understand Markets.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Make Smarter Decisions.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Real-time market data, financial insights, research and powerful tools designed to help you understand global markets.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreMarkets}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore Markets</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onViewData}
              className="px-6 py-3.5 rounded-xl bg-[#0C1017] hover:bg-[#111622] text-slate-200 hover:text-white font-semibold text-sm transition-all border border-white/[0.08] hover:border-white/[0.15] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span>View Market Data</span>
            </button>
          </div>
        </div>

        {/* Interactive Financial Depth & Wave Canvas Visualizer */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div 
            className="relative rounded-2xl bg-[#0C1017] border border-white/[0.08] p-2 sm:p-4 overflow-hidden shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Visualizer Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="font-mono text-[11px] text-slate-500 ml-2">FINPULSE_MARKET_DEPTH_FLOW</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Order Flow: Balanced
                </span>
                <span className="text-slate-500 hidden sm:inline">Latency &lt; 40ms</span>
              </div>
            </div>

            {/* Dynamic HTML5 Wave Canvas */}
            <div className="relative w-full h-48 sm:h-64">
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-crosshair"
              />
            </div>

            {/* Metric Footer Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.05] text-[11px] font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-[#07090E] border border-white/[0.04]">
                <div className="text-slate-500 uppercase">Live Fiat Pairs</div>
                <div className="text-slate-200 font-bold tabular-nums">160+ Currencies</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#07090E] border border-white/[0.04]">
                <div className="text-slate-500 uppercase">CoinGecko Feed</div>
                <div className="text-emerald-400 font-bold tabular-nums">20 Top Cryptos</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#07090E] border border-white/[0.04]">
                <div className="text-slate-500 uppercase">Benchmark USD/PKR</div>
                <div className="text-blue-400 font-bold tabular-nums">278.09 Baseline</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#07090E] border border-white/[0.04]">
                <div className="text-slate-500 uppercase">Markup Spread</div>
                <div className="text-white font-bold tabular-nums">0.00% Zero Fee</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
