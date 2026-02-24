import { useEffect, useRef, useState, useCallback } from 'react';
import type { FC } from 'react';
import { Download, Upload, Activity, Wifi, WifiOff } from 'lucide-react';
import { formatBytes } from '@/hooks/useSystemInfo';
import AnimatedNumber from './AnimatedNumber';

interface NetworkMonitorProps {
  downSpeed: number;
  upSpeed: number;
  totalDown: number;
  totalUp: number;
  networkType?: string;
  effectiveType?: string;
  rtt?: number;
}

const NetworkMonitor: FC<NetworkMonitorProps> = ({ 
  downSpeed, 
  upSpeed, 
  totalDown, 
  totalUp,
  networkType: _networkType = 'unknown',
  effectiveType = '4g',
  rtt = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<{ down: number; up: number }[]>([]);
  const maxHistory = 80;

  // Update history
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, { down: downSpeed, up: upSpeed }];
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory);
      }
      return newHistory;
    });
  }, [downSpeed, upSpeed]);

  // Draw graph with colors
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || history.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(10, 15, 15, 0.15)';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(
      ...history.map(h => Math.max(h.down, h.up)),
      1000000
    );

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    for (let i = 0; i < 10; i++) {
      const x = (width / 9) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = (i / (maxHistory - 1)) * width;
      const y = height - (point.down / maxValue) * height * 0.9 - 5;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = '#ff8800';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = (i / (maxHistory - 1)) * width;
      const y = height - (point.up / maxValue) * height * 0.9 - 5;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 255, 0, 0.08)';
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = (i / (maxHistory - 1)) * width;
      const y = height - (point.down / maxValue) * height * 0.9 - 5;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 136, 0, 0.08)';
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = (i / (maxHistory - 1)) * width;
      const y = height - (point.up / maxValue) * height * 0.9 - 5;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }, [history]);

  useEffect(() => {
    draw();
  }, [draw]);

  const isActive = downSpeed > 0 || upSpeed > 0;

  return (
    <div className="nerv-panel nerv-corner nerv-panel-cyan p-2.5 md:p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ffff]" />
          <span className="text-[10px] md:text-xs tracking-wider text-[#00ffff]/80">NETWORK UNIT</span>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <Wifi className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff00] animate-pulse" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ff0044]" />
          )}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#00ff00]" />
              <span className="text-[9px] text-[#00ff00]/60">↓</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#ff8800]" />
              <span className="text-[9px] text-[#ff8800]/60">↑</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-[#00ff00]/5 border border-[#00ff00]/30 p-2 relative overflow-hidden">
          <div className="flex items-center gap-1 mb-1">
            <Download className="w-3 h-3 text-[#00ff00]" />
            <span className="text-[8px] text-[#00ff00]/60">DOWN</span>
          </div>
          <AnimatedNumber 
            value={downSpeed / 1024 / 1024}
            decimals={2}
            suffix=" MB/s"
            className="text-xs md:text-sm text-[#00ff00] font-mono"
            intense={downSpeed > 10000000}
          />
        </div>
        <div className="bg-[#ff8800]/5 border border-[#ff8800]/30 p-2 relative overflow-hidden">
          <div className="flex items-center gap-1 mb-1">
            <Upload className="w-3 h-3 text-[#ff8800]" />
            <span className="text-[8px] text-[#ff8800]/60">UP</span>
          </div>
          <AnimatedNumber 
            value={upSpeed / 1024 / 1024}
            decimals={2}
            suffix=" MB/s"
            className="text-xs md:text-sm text-[#ff8800] font-mono"
            intense={upSpeed > 5000000}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="flex justify-between text-[9px] md:text-[10px] mb-1">
          <span className="text-[#00ffff]/50">TRAFFIC</span>
          <span className="text-[#00ff00] blink">● LIVE</span>
        </div>
        <div ref={containerRef} className="h-full bg-black/40 border border-[#00ffff]/20 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ffff]/5 to-transparent animate-pulse pointer-events-none" />
        </div>
      </div>

      {/* Network info - 移动端 2x2 网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <div className="border-l-2 border-[#00ff00]/40 pl-2">
          <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 block">TOTAL DL</span>
          <span className="text-[10px] md:text-xs text-[#00ff00] font-mono">{formatBytes(totalDown)}</span>
        </div>
        <div className="border-l-2 border-[#ff8800]/40 pl-2">
          <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 block">TOTAL UL</span>
          <span className="text-[10px] md:text-xs text-[#ff8800] font-mono">{formatBytes(totalUp)}</span>
        </div>
        <div className="border-l-2 border-[#00ffff]/40 pl-2">
          <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 block">TYPE</span>
          <span className="text-[10px] md:text-xs text-[#00ffff] font-mono uppercase">{effectiveType}</span>
        </div>
        <div className="border-l-2 border-[#ffff00]/40 pl-2">
          <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 block">RTT</span>
          <span className="text-[10px] md:text-xs text-[#ffff00] font-mono">{rtt}ms</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkMonitor;
