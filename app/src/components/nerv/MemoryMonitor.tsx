import type { FC } from 'react';
import { Database, Layers } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { formatBytes } from '@/hooks/useSystemInfo';

interface MemoryMonitorProps {
  used: number;
  total: number;
  usage: number;
}

const MemoryMonitor: FC<MemoryMonitorProps> = ({ used, total, usage }) => {
  const getStatusColor = (value: number) => {
    if (value > 85) return '#ff0044';
    if (value > 60) return '#ff8800';
    return '#00ff00';
  };

  const getStatusText = (value: number) => {
    if (value > 85) return { text: 'CRITICAL', jp: 'メモリ危険' };
    if (value > 60) return { text: 'WARNING', jp: 'メモリ警告' };
    return { text: 'OPTIMAL', jp: 'メモリ最適' };
  };

  const status = getStatusText(usage);
  const statusColor = getStatusColor(usage);
  const isWarning = usage > 60;
  const isCritical = usage > 85;

  // Calculate memory segments
  const segments = 12;
  const activeSegments = Math.ceil((usage / 100) * segments);

  return (
    <div className={`nerv-panel nerv-corner p-3 md:p-4 h-full ${isCritical ? 'nerv-panel-red' : isWarning ? 'nerv-panel-orange' : ''}`}>
      {/* Title */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 md:w-5 md:h-5" style={{ color: statusColor }} />
          <span className="text-xs md:text-sm tracking-wider text-[#00ffff]/80">MEMORY UNIT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 border blink-fast`}
            style={{ 
              color: statusColor, 
              borderColor: statusColor,
              backgroundColor: `${statusColor}15`
            }}
          >
            ACTIVE
          </span>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-[#00ffff]/50 mb-1 tracking-wider">USAGE RATIO</span>
          <div className="flex items-baseline gap-2">
            <AnimatedNumber 
              value={usage}
              decimals={1}
              glowColor={statusColor}
              intense={usage > 60}
              pulseOnHigh={true}
              highThreshold={85}
              className="text-4xl md:text-6xl font-bold"
            />
            <span className="text-lg md:text-2xl text-[#00ffff]/60">%</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 border"
              style={{ 
                color: statusColor, 
                borderColor: statusColor,
                backgroundColor: `${statusColor}20`
              }}
            >
              {status.text}
            </span>
            <span className="text-[10px] md:text-xs text-[#00ffff]/40">// {status.jp}</span>
          </div>
        </div>

        {/* Circular Gauge with gradient */}
        <div className="relative w-20 h-20 md:w-28 md:h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background track - cyan */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(0, 255, 255, 0.15)"
              strokeWidth="6"
            />
            
            {/* Progress arc with gradient */}
            <defs>
              <linearGradient id={`memGrad-${usage}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={usage > 85 ? '#cc0033' : usage > 60 ? '#cc6600' : '#00aa00'} />
                <stop offset="100%" stopColor={statusColor} />
              </linearGradient>
            </defs>
            
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={`url(#memGrad-${usage})`}
              strokeWidth="6"
              strokeLinecap="butt"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - usage / 100)}`}
              className="transition-all duration-500"
              style={{ filter: `drop-shadow(0 0 8px ${statusColor}60)` }}
            />
            
            {/* Inner decorative ring */}
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke={statusColor}
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="4 4"
              className="animate-[spin_10s_linear_infinite]"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Layers className="w-4 h-4 md:w-6 md:h-6 mb-1" style={{ color: statusColor }} />
            <span className="text-sm md:text-lg font-bold" style={{ color: statusColor }}>
              {usage > 85 ? '!' : usage > 60 ? '△' : '◯'}
            </span>
          </div>
        </div>
      </div>

      {/* Memory Details with color coding */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="bg-[#00ffff]/5 border border-[#00ffff]/20 p-2 md:p-3">
          <span className="text-[8px] md:text-[10px] text-[#00ffff]/50 block mb-1 tracking-wider">USED</span>
          <span className="text-sm md:text-lg font-mono" style={{ color: statusColor }}>
            {formatBytes(used)}
          </span>
        </div>
        <div className="bg-[#00ff00]/5 border border-[#00ff00]/20 p-2 md:p-3">
          <span className="text-[8px] md:text-[10px] text-[#00ff00]/50 block mb-1 tracking-wider">TOTAL</span>
          <span className="text-sm md:text-lg text-[#00ff00] font-mono">
            {formatBytes(total)}
          </span>
        </div>
      </div>

      {/* Segment Display with multi-color */}
      <div className="mb-2 md:mb-3">
        <div className="flex justify-between text-[10px] md:text-xs mb-2">
          <span className="text-[#00ffff]/50">MEMORY BLOCKS</span>
          <span style={{ color: statusColor }}>{activeSegments}/{segments} ACTIVE</span>
        </div>
        <div className="flex gap-0.5 md:gap-1">
          {Array.from({ length: segments }, (_, i) => {
            const isActive = i < activeSegments;
            const segmentColor = isActive 
              ? (usage > 85 ? '#ff0044' : usage > 60 ? '#ff8800' : '#00ff00')
              : 'transparent';
            return (
              <div
                key={i}
                className="flex-1 h-6 md:h-8 border transition-all duration-300 relative overflow-hidden"
                style={{ 
                  borderColor: isActive ? `${segmentColor}60` : 'rgba(0,255,255,0.15)',
                  backgroundColor: isActive ? `${segmentColor}20` : 'transparent'
                }}
              >
                {isActive && (
                  <>
                    <div 
                      className="absolute bottom-0 left-0 right-0 animate-pulse"
                      style={{ 
                        height: '60%',
                        background: `linear-gradient(180deg, transparent, ${segmentColor}60)`,
                        animationDelay: `${i * 0.08}s`
                      }} 
                    />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `linear-gradient(0deg, transparent 50%, ${segmentColor}40 50%)`,
                        backgroundSize: '2px 2px'
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status text with Japanese */}
      <div className="text-center py-1.5 md:py-2 border-t border-b"
        style={{ 
          borderColor: `${statusColor}30`,
          backgroundColor: `${statusColor}08`
        }}
      >
        <span className="text-xs md:text-sm font-bold" style={{ color: statusColor }}>
          {status.jp}
        </span>
      </div>

      {/* Memory type indicators - 移动端简化 */}
      <div className="mt-2 md:mt-3 flex justify-between text-[8px] md:text-[10px]">
        <span className="text-[#00ffff]/40">RAM: <span className="text-[#00ff00]">DDR4</span></span>
        <span className="hidden md:inline text-[#00ffff]/40">SPEED: <span className="text-[#ff8800]">3200MHz</span></span>
        <span className="text-[#00ffff]/40">CH: <span className="text-[#00ffff]">DUAL</span></span>
      </div>

      {/* Decorative corner */}
      <div className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 border-r-2 border-b-2"
        style={{ borderColor: `${statusColor}40` }} 
      />
    </div>
  );
};

export default MemoryMonitor;
