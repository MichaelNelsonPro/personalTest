import { useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { Activity } from 'lucide-react';

interface SpectrumAnalyzerProps {
  barCount?: number;
  color?: 'green' | 'orange' | 'red' | 'cyan' | 'multi';
}

const SpectrumAnalyzer: FC<SpectrumAnalyzerProps> = ({ 
  barCount = 24,
  color = 'multi'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    barsRef.current = Array.from({ length: barCount }, () => Math.random() * 0.3);
  }, [barCount]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;

    const getBarColor = (index: number, value: number) => {
      if (color === 'green') return `hsl(120, 100%, ${40 + value * 40}%)`;
      if (color === 'orange') return `hsl(30, 100%, ${40 + value * 40}%)`;
      if (color === 'red') return `hsl(350, 100%, ${40 + value * 40}%)`;
      if (color === 'cyan') return `hsl(180, 100%, ${40 + value * 40}%)`;
      const hue = (index / barCount) * 120 + 120;
      return `hsl(${hue}, 100%, ${40 + value * 40}%)`;
    };

    ctx.fillStyle = 'rgba(10, 15, 15, 0.3)';
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width - (barCount - 1) * 2) / barCount;

    barsRef.current = barsRef.current.map((bar, i) => {
      const target = Math.random() * 0.8 + 0.1;
      const newValue = bar + (target - bar) * 0.3;
      
      const barHeight = newValue * height * 0.85;
      const x = i * (barWidth + 2);
      const y = height - barHeight;

      const barColor = getBarColor(i, newValue);

      const gradient = ctx.createLinearGradient(0, height, 0, y);
      gradient.addColorStop(0, barColor + '40');
      gradient.addColorStop(0.5, barColor + '80');
      gradient.addColorStop(1, barColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, 2);

      if (newValue > 0.7) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y - 3, barWidth, 2);
      }

      return newValue;
    });

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 2);
    ctx.lineTo(width, height - 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, [barCount, color]);

  useEffect(() => {
    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <div className="nerv-panel nerv-corner p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00ffff]" />
          <span className="text-xs tracking-wider text-[#00ffff]/80">SPECTRUM ANALYZER</span>
        </div>
        <span className="text-[9px] text-[#00ff00] blink">● LIVE</span>
      </div>
      
      <div ref={containerRef} className="flex-1 bg-black/40 border border-[#00ffff]/20 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(0,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[7px] text-[#00ffff]/30">
          <span>20Hz</span>
          <span>1kHz</span>
          <span>10kHz</span>
          <span>20kHz</span>
        </div>
      </div>
      
      <div className="mt-1 flex justify-between text-[8px] text-[#00ffff]/40">
        <span>0dB</span>
        <span>-20dB</span>
        <span>-40dB</span>
        <span>-60dB</span>
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
