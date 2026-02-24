import { useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { BarChart3 } from 'lucide-react';

interface BarVisualizerProps {
  barCount?: number;
  orientation?: 'vertical' | 'horizontal';
  color?: 'green' | 'orange' | 'red' | 'cyan' | 'multi';
}

const BarVisualizer: FC<BarVisualizerProps> = ({ 
  barCount = 16,
  orientation = 'vertical',
  color = 'multi'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>([]);
  const targetRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    barsRef.current = Array.from({ length: barCount }, () => Math.random() * 0.3);
    targetRef.current = Array.from({ length: barCount }, () => Math.random());
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

    frameCountRef.current++;
    
    if (frameCountRef.current % 10 === 0) {
      targetRef.current = targetRef.current.map(() => Math.random() * 0.9 + 0.1);
    }

    ctx.fillStyle = 'rgba(10, 15, 15, 0.3)';
    ctx.fillRect(0, 0, width, height);

    barsRef.current = barsRef.current.map((bar, i) => {
      const target = targetRef.current[i];
      return bar + (target - bar) * 0.15;
    });

    const getBarColor = (value: number) => {
      if (color === 'green') return value > 0.8 ? '#ff0044' : value > 0.6 ? '#ff8800' : '#00ff00';
      if (color === 'orange') return '#ff8800';
      if (color === 'red') return '#ff0044';
      if (color === 'cyan') return '#00ffff';
      if (value > 0.8) return '#ff0044';
      if (value > 0.6) return '#ff8800';
      if (value > 0.4) return '#ffff00';
      return '#00ff00';
    };

    if (orientation === 'vertical') {
      const barWidth = (width - (barCount - 1) * 3) / barCount;
      
      barsRef.current.forEach((value, idx) => {
        const barHeight = value * height * 0.9;
        const x = idx * (barWidth + 3);
        const y = height - barHeight;
        const barColor = getBarColor(value);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, 0, barWidth, height);

        const gradient = ctx.createLinearGradient(0, height, 0, y);
        gradient.addColorStop(0, barColor + '20');
        gradient.addColorStop(0.5, barColor + '60');
        gradient.addColorStop(1, barColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth, 2);

        if (value > 0.85) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 4, barWidth, 3);
        }

        if (value > 0.5) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(value * 100).toString(), x + barWidth / 2, y + 12);
        }
      });
    } else {
      const barHeight = (height - (barCount - 1) * 3) / barCount;
      
      barsRef.current.forEach((value, idx) => {
        const barWidth = value * width * 0.9;
        const y = idx * (barHeight + 3);
        const barColor = getBarColor(value);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, y, width, barHeight);

        const gradient = ctx.createLinearGradient(0, 0, barWidth, 0);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(0.5, barColor + '80');
        gradient.addColorStop(1, barColor + '20');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, y, barWidth, barHeight);

        ctx.fillStyle = barColor;
        ctx.fillRect(barWidth - 2, y, 2, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(value * 100)}%`, barWidth + 4, y + barHeight / 2 + 3);
      });
    }

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    if (orientation === 'vertical') {
      for (let i = 1; i <= 4; i++) {
        const y = height - (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [barCount, orientation, color]);

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
          <BarChart3 className="w-4 h-4 text-[#ff8800]" />
          <span className="text-xs tracking-wider text-[#ff8800]/80">
            {orientation === 'vertical' ? 'LEVEL METER' : 'RESOURCE METER'}
          </span>
        </div>
        <span className="text-[9px] text-[#00ff00] blink">● ACTIVE</span>
      </div>
      
      <div ref={containerRef} className="flex-1 bg-black/40 border border-[#ff8800]/20 relative overflow-hidden">
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
      </div>
      
      <div className="mt-1 flex justify-between text-[8px] text-[#00ffff]/40">
        {orientation === 'vertical' ? (
          <>
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </>
        ) : (
          <>
            <span>LOW</span>
            <span>NORM</span>
            <span>HIGH</span>
            <span>MAX</span>
          </>
        )}
      </div>
    </div>
  );
};

export default BarVisualizer;
