import type { FC } from 'react';
import { Gauge, Zap } from 'lucide-react';

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  label: string;
  unit?: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CircularGauge: FC<CircularGaugeProps> = ({ 
  value, 
  maxValue = 100,
  label,
  unit = '%',
  subLabel,
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  const getColor = (pct: number) => {
    if (pct > 80) return '#ff0044';
    if (pct > 60) return '#ff8800';
    if (pct > 40) return '#ffff00';
    return '#00ff00';
  };

  const getStatusText = (pct: number) => {
    if (pct > 80) return { text: 'CRIT', color: '#ff0044' };
    if (pct > 60) return { text: 'HIGH', color: '#ff8800' };
    if (pct > 40) return { text: 'NORM', color: '#ffff00' };
    return { text: 'LOW', color: '#00ff00' };
  };

  const color = getColor(percentage);
  const status = getStatusText(percentage);

  const sizeClasses = {
    sm: 'w-full h-full min-h-[80px]',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const strokeWidth = size === 'sm' ? 5 : size === 'md' ? 8 : 10;
  const radius = size === 'sm' ? 32 : size === 'md' ? 50 : 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75; // 270 degree arc

  return (
    <div className="nerv-panel nerv-corner p-2 flex flex-col items-center h-full">
      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 self-start">
        <Gauge className="w-3 h-3 md:w-4 md:h-4" style={{ color }} />
        <span className="text-[9px] md:text-xs tracking-wider text-[#00ffff]/80">{label}</span>
      </div>
      
      <div className={`relative flex-1 w-full ${sizeClasses[size]}`}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(0, 0, 0, 0.5)"
            strokeWidth={strokeWidth}
          />
          
          {/* Background arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(0, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
          />
          
          {/* Progress arc with gradient */}
          <defs>
            <linearGradient id={`gaugeGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={percentage > 60 ? '#cc6600' : '#00aa00'} />
              <stop offset="50%" stopColor={percentage > 60 ? '#ff8800' : '#00ff00'} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#gaugeGrad-${label})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
          
          {/* Decorative inner ring */}
          <circle
            cx="60"
            cy="60"
            r={radius - 12}
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
            strokeDasharray="4 4"
            className="animate-[spin_8s_linear_infinite]"
          />
          
          {/* Center decoration */}
          <circle
            cx="60"
            cy="60"
            r="8"
            fill={color}
            opacity="0.2"
          />
          <circle
            cx="60"
            cy="60"
            r="4"
            fill={color}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Zap className="w-3 h-3 md:w-4 md:h-4 mb-0.5 md:mb-1" style={{ color }} />
          <span className="text-lg md:text-2xl font-bold" style={{ color, textShadow: `0 0 15px ${color}80` }}>
            {value.toFixed(0)}
          </span>
          <span className="text-[9px] md:text-xs text-[#00ffff]/60">{unit}</span>
        </div>
        
        {/* Scale markers */}
        <div className="absolute -bottom-0.5 md:-bottom-1 left-0 right-0 flex justify-between px-2 md:px-4 text-[7px] md:text-[8px] text-[#00ffff]/40">
          <span>0</span>
          <span>{(maxValue / 2).toFixed(0)}</span>
          <span>{maxValue}</span>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mt-1 md:mt-4 flex items-center gap-1 md:gap-2">
        <span 
          className="text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 border"
          style={{ 
            color: status.color, 
            borderColor: status.color + '50',
            backgroundColor: status.color + '15'
          }}
        >
          {status.text}
        </span>
        {subLabel && (
          <span className="hidden md:inline text-[10px] text-[#00ffff]/40">// {subLabel}</span>
        )}
      </div>
    </div>
  );
};

export default CircularGauge;
