import { useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { Scan, Target } from 'lucide-react';

interface RadarScannerProps {}

const RadarScanner: FC<RadarScannerProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const targetsRef = useRef<Array<{ angle: number; distance: number; intensity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    targetsRef.current = Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2 + Math.random() * 0.5,
      distance: 0.3 + Math.random() * 0.6,
      intensity: 0.5 + Math.random() * 0.5
    }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const canvasSize = Math.min(rect.width, rect.height) - 20;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvasSize / 2 - 10;

    ctx.fillStyle = 'rgba(10, 15, 15, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(rad) * radius, centerY + Math.sin(rad) * radius);
      ctx.stroke();
    }

    targetsRef.current.forEach((target, i) => {
      const tx = centerX + Math.cos(target.angle) * radius * target.distance;
      const ty = centerY + Math.sin(target.angle) * radius * target.distance;
      
      const gradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, 15);
      gradient.addColorStop(0, `rgba(255, 136, 0, ${target.intensity})`);
      gradient.addColorStop(0.5, `rgba(255, 136, 0, ${target.intensity * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(tx, ty, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 136, 0, 0.7)';
      ctx.font = '8px monospace';
      ctx.fillText(`T${i + 1}`, tx + 8, ty - 8);

      target.angle += 0.002 * (i % 2 === 0 ? 1 : -1);
    });

    angleRef.current += 0.03;
    const scanAngle = angleRef.current % (Math.PI * 2);
    
    const scanGradient = ctx.createConicGradient(scanAngle - Math.PI / 6, centerX, centerY);
    scanGradient.addColorStop(0, 'transparent');
    scanGradient.addColorStop(0.7, 'transparent');
    scanGradient.addColorStop(0.85, 'rgba(0, 255, 0, 0.3)');
    scanGradient.addColorStop(0.95, 'rgba(0, 255, 0, 0.6)');
    scanGradient.addColorStop(1, 'rgba(0, 255, 0, 0.8)');

    ctx.fillStyle = scanGradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, scanAngle - Math.PI / 6, scanAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(scanAngle) * radius, centerY + Math.sin(scanAngle) * radius);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 6, centerY);
    ctx.lineTo(centerX + 6, centerY);
    ctx.moveTo(centerX, centerY - 6);
    ctx.lineTo(centerX, centerY + 6);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, []);

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
          <Scan className="w-4 h-4 text-[#00ff00]" />
          <span className="text-xs tracking-wider text-[#00ff00]/80">RADAR SCANNER</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-[#ff8800]" />
          <span className="text-[9px] text-[#ff8800]">8 TARGETS</span>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 flex items-center justify-center bg-black/40 border border-[#00ff00]/20 relative overflow-hidden">
        <canvas ref={canvasRef} className="block" />
        
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#00ff00]/40" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#00ff00]/40" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#00ff00]/40" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#00ff00]/40" />
        
        <div className="absolute top-1/2 left-2 text-[7px] text-[#00ff00]/40">50km</div>
        <div className="absolute top-1/2 right-2 text-[7px] text-[#00ff00]/40">0km</div>
      </div>
      
      <div className="mt-2 flex justify-between text-[8px]">
        <span className="text-[#00ffff]/40">FREQ: <span className="text-[#00ffff]">2.4GHz</span></span>
        <span className="text-[#00ff00]/40">SCAN: <span className="text-[#00ff00]">360°/s</span></span>
        <span className="text-[#ff8800]/40">ANGELS: <span className="text-[#ff8800]">0</span></span>
      </div>
    </div>
  );
};

export default RadarScanner;
