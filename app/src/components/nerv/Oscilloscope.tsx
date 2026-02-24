import { useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { Waves } from 'lucide-react';

interface OscilloscopeProps {
  channelCount?: number;
  color?: 'green' | 'orange' | 'red' | 'cyan' | 'multi';
}

const Oscilloscope: FC<OscilloscopeProps> = ({ 
  channelCount = 3,
  color = 'multi'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const wavesRef = useRef<Array<{ 
    frequency: number; 
    amplitude: number; 
    phase: number;
    offset: number;
  }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wavesRef.current = Array.from({ length: channelCount }, (_, i) => ({
      frequency: 0.02 + Math.random() * 0.03,
      amplitude: 20 + Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      offset: (i + 1) * 35
    }));
  }, [channelCount]);

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

    const getChannelColor = (index: number) => {
      if (color === 'green') return '#00ff00';
      if (color === 'orange') return '#ff8800';
      if (color === 'red') return '#ff0044';
      if (color === 'cyan') return '#00ffff';
      const colors = ['#00ff00', '#ff8800', '#00ffff', '#ff0044'];
      return colors[index % colors.length];
    };

    ctx.fillStyle = 'rgba(10, 15, 15, 0.25)';
    ctx.fillRect(0, 0, width, height);

    timeRef.current += 1;

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    wavesRef.current.forEach((wave, channelIndex) => {
      const channelColor = getChannelColor(channelIndex);
      
      ctx.strokeStyle = channelColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = channelColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x + timeRef.current * 2) * wave.frequency + wave.phase;
        const primaryWave = Math.sin(t) * wave.amplitude;
        const harmonic2 = Math.sin(t * 2.5) * wave.amplitude * 0.3;
        const harmonic3 = Math.sin(t * 4) * wave.amplitude * 0.15;
        const noise = (Math.random() - 0.5) * 4;
        
        const y = wave.offset * (height / 120) + primaryWave + harmonic2 + harmonic3 + noise;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = channelColor;
      ctx.font = '9px monospace';
      ctx.fillText(`CH${channelIndex + 1}`, 5, wave.offset * (height / 120) - wave.amplitude - 5);

      ctx.strokeStyle = channelColor + '30';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, wave.offset * (height / 120));
      ctx.lineTo(width, wave.offset * (height / 120));
      ctx.stroke();
      ctx.setLineDash([]);
    });

    const triggerX = (timeRef.current * 2) % width;
    ctx.strokeStyle = '#ff0044';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(triggerX, 0);
    ctx.lineTo(triggerX, height);
    ctx.stroke();

    ctx.fillStyle = '#ff0044';
    ctx.font = '8px monospace';
    ctx.fillText('TRIG', triggerX + 3, 12);

    animationRef.current = requestAnimationFrame(draw);
  }, [color, channelCount]);

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
          <Waves className="w-4 h-4 text-[#00ff00]" />
          <span className="text-xs tracking-wider text-[#00ff00]/80">OSCILLOSCOPE</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: channelCount }, (_, i) => {
            const colors = ['#00ff00', '#ff8800', '#00ffff'];
            return (
              <span key={i} className="text-[8px] px-1 border"
                style={{ 
                  color: colors[i % colors.length], 
                  borderColor: colors[i % colors.length] + '50',
                  backgroundColor: colors[i % colors.length] + '10'
                }}
              >
                CH{i + 1}
              </span>
            );
          })}
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 bg-black/40 border border-[#00ff00]/20 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
        
        <div className="absolute left-1 top-2 bottom-2 flex flex-col justify-between text-[7px] text-[#00ffff]/30">
          <span>+5V</span>
          <span>0V</span>
          <span>-5V</span>
        </div>
        
        <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[7px] text-[#00ffff]/30">
          <span>0ms</span>
          <span>5ms</span>
          <span>10ms</span>
          <span>15ms</span>
          <span>20ms</span>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-[8px]">
        <span className="text-[#00ffff]/40">TIME/DIV: <span className="text-[#00ffff]">1ms</span></span>
        <span className="text-[#00ff00]/40">VOLTS/DIV: <span className="text-[#00ff00]">1V</span></span>
        <span className="text-[#ff0044]/40">TRIGGER: <span className="text-[#ff0044]">AUTO</span></span>
      </div>
    </div>
  );
};

export default Oscilloscope;
