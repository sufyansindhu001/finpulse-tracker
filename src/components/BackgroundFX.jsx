import React, { useEffect, useRef } from 'react';

/**
 * BackgroundFX:
 * High-performance animated financial background with glowing grid,
 * flowing gradient waves, and dynamic scroll responsiveness.
 */
export default function BackgroundFX() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;
    let time = 0;
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.008;
      // Smooth interpolation for scroll
      scrollY += (targetScrollY - scrollY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle glowing grid
      const gridSize = 48;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      const yOffset = (scrollY * 0.2) % gridSize;
      for (let y = -gridSize; y < height + gridSize; y += gridSize) {
        const actualY = y - yOffset;
        ctx.moveTo(0, actualY);
        ctx.lineTo(width, actualY);
      }
      ctx.stroke();

      // 2. Glowing intersection dots
      const stepDots = gridSize * 2;
      for (let x = stepDots; x < width; x += stepDots) {
        for (let y = stepDots; y < height; y += stepDots) {
          const actualY = y - yOffset;
          const pulse = Math.sin(time * 2 + (x * 0.01) + (y * 0.01));
          if (pulse > 0.4) {
            ctx.beginPath();
            ctx.arc(x, actualY, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 230, 118, ${(pulse - 0.4) * 0.35})`;
            ctx.fill();
          }
        }
      }

      // 3. Flowing financial wave curves
      const waveBaseY = height * 0.65 - (scrollY * 0.15);
      const waves = [
        {
          color: 'rgba(0, 230, 118, 0.15)',
          fillTop: 'rgba(0, 230, 118, 0.04)',
          amplitude: 36,
          freq: 0.002,
          speed: time * 1.2,
          y: waveBaseY
        },
        {
          color: 'rgba(0, 255, 136, 0.12)',
          fillTop: 'rgba(6, 182, 212, 0.03)',
          amplitude: 28,
          freq: 0.003,
          speed: time * 0.9 + 1,
          y: waveBaseY + 40
        }
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 6) {
          const y = w.y + Math.sin(x * w.freq + w.speed) * w.amplitude + Math.cos(x * 0.001 - time * 0.5) * 15;
          if (x === 0) ctx.lineTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, w.y - w.amplitude, 0, height);
        grad.addColorStop(0, w.fillTop);
        grad.addColorStop(1, 'rgba(6, 17, 31, 0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y = w.y + Math.sin(x * w.freq + w.speed) * w.amplitude + Math.cos(x * 0.001 - time * 0.5) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep ambient radial gradient spheres */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(0, 230, 118, 0.25) 0%, rgba(6, 17, 31, 0) 70%)' }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[700px] h-[700px] rounded-full blur-[150px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 17, 31, 0) 70%)' }}
      />
      <div 
        className="hidden dark:block absolute bottom-0 left-1/4 w-[800px] h-[500px] rounded-full blur-[160px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(13, 27, 42, 0.8) 0%, rgba(6, 17, 31, 0) 70%)' }}
      />
      
      {/* Interactive dynamic canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
