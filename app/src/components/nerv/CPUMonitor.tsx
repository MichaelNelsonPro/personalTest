import type { FC } from 'react';
import { Cpu, AlertTriangle } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface CPUMonitorProps {
  usage: number;
  cores: number;
  model?: string;
}

const CPUMonitor: FC<CPUMonitorProps> = ({ usage, cores }) => {
  const getStatusColor = (value: number) => {
    if (value > 80) return 'text-[#ff0044]';
    if (value > 50) return 'text-[#ff8800]';
    return 'text-[#00ff00]';
  };

  const getStatusGlow = (value: number) => {
    if (value > 80) return 'drop-shadow-[0_0_15px_rgba(255,0,68,0.8)]';
    if (value > 50) return 'drop-shadow-[0_0_15px_rgba(255,136,0,0.8)]';
    return 'drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]';
  };

  const getBarGradient = (value: number) => {
    if (value > 80) return 'linear-gradient(90deg, #cc0033, #ff0044, #ff4466)';
    if (value > 50) return 'linear-gradient(90deg, #cc6600, #ff8800, #ffaa00)';
    return 'linear-gradient(90deg, #00aa00, #00ff00, #88ff00)';
  };

  const getStatusText = (value: number) => {
    if (value > 80) return { text: 'CRITICAL', color: '#ff0044', jp: '危険' };
    if (value > 50) return { text: 'WARNING', color: '#ff8800', jp: '警告' };
    return { text: 'NORMAL', color: '#00ff00', jp: '正常' };
  };

  const status = getStatusText(usage);
  const isWarning = usage > 50;
  const isCritical = usage > 80;

  return (
    <div className={`nerv-panel nerv-corner p-3 md:p-4 h-full ${isCritical ? 'nerv-panel-red' : isWarning ? 'nerv-panel-orange' : ''}`}>
      {/* Title with color indicator */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 md:w-5 md:h-5 ${isCritical ? 'text-[#ff0044]' : isWarning ? 'text-[#ff8800]' : 'text-[#00ff00]'}`} />
          <span className="text-xs md:text-sm tracking-wider text-[#00ffff]/80">CPU UNIT</span>
          {isCritical && <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-[#ff0044] animate-pulse" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs text-[#00ffff]/50">CORES:</span>
          <span className="text-[10px] md:text-xs text-[#00ff00]">{cores}</span>
        </div>
      </div>

      {/* Main Usage Display with big colorful number */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-[#00ffff]/50 mb-1 tracking-wider">PROCESSOR LOAD</span>
          <div className="flex items-baseline gap-2">
            <AnimatedNumber 
              value={usage} 
              decimals={1}
              className={`text-4xl md:text-6xl font-bold ${getStatusColor(usage)}`}
              intense={usage > 80}
              pulseOnHigh={true}
              highThreshold={80}
              suffix=""
            />
            <span className="text-lg md:text-2xl text-[#00ffff]/60">%</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 border"
              style={{ 
                color: status.color, 
                borderColor: status.color,
                backgroundColor: `${status.color}20`
              }}
            >
              {status.text}
            </span>
            <span className="text-[10px] md:text-xs text-[#00ffff]/40">// {status.jp}</span>
          </div>
        </div>

        {/* Hexagon Status Indicator with multi-color */}
        <div className="relative w-16 h-16 md:w-24 md:h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer ring - cyan */}
            <polygon
              points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
              fill="none"
              stroke="#00ffff"
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Middle ring - changes with status */}
            <polygon
              points="50,12 85,31 85,69 50,88 15,69 15,31"
              fill="none"
              stroke={usage > 80 ? '#ff0044' : usage > 50 ? '#ff8800' : '#00ff00'}
              strokeWidth="1.5"
              opacity="0.5"
              className={usage > 50 ? 'animate-pulse' : ''}
            />
            
            {/* Inner hexagon - status color */}
            <polygon
              points="50,20 80,35 80,65 50,80 20,65 20,35"
              fill={`${status.color}15`}
              stroke={status.color}
              strokeWidth="2"
              className={getStatusGlow(usage)}
            />
            
            {/* Center status symbol */}
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill={status.color}
              fontSize="16"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {usage > 80 ? '!' : usage > 50 ? '△' : '◯'}
            </text>
          </svg>
          
          {/* Rotating indicator */}
          <div className={`absolute inset-0 border-2 border-dashed rounded-full animate-[spin_8s_linear_infinite] ${
            usage > 80 ? 'border-[#ff0044]/30' : usage > 50 ? 'border-[#ff8800]/30' : 'border-[#00ff00]/20'
          }`} style={{ margin: '10%' }} />
        </div>
      </div>

      {/* Progress Bar with gradient */}
      <div className="mb-3 md:mb-4">
        <div className="flex justify-between text-[10px] md:text-xs mb-1">
          <span className="text-[#00ffff]/50">LOAD DISTRIBUTION</span>
          <span style={{ color: status.color }}>{status.text}</span>
        </div>
        <div className="h-3 md:h-4 bg-black/50 border relative overflow-hidden"
          style={{ borderColor: `${status.color}50` }}
        >
          {/* Background grid */}
          <div className="absolute inset-0 flex">
            {[20, 40, 60, 80].map((mark) => (
              <div 
                key={mark}
                className="absolute top-0 bottom-0 w-px bg-[#00ffff]/10"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
          
          {/* Progress fill */}
          <div 
            className="h-full transition-all duration-500 relative"
            style={{ 
              width: `${usage}%`,
              background: getBarGradient(usage),
              boxShadow: usage > 80 
                ? '0 0 20px rgba(255,0,68,0.8)' 
                : usage > 50 
                ? '0 0 15px rgba(255,136,0,0.6)' 
                : '0 0 10px rgba(0,255,0,0.5)'
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
          
          {/* Percentage markers */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-[8px] text-[#00ff00]/40">0</span>
            <span className="text-[8px] text-[#ff8800]/40">50</span>
            <span className="text-[8px] text-[#ff0044]/40">100</span>
          </div>
        </div>
      </div>

      {/* Core Usage Grid with colors - 移动端减少显示核心数 */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-1.5 md:gap-2">
        {Array.from({ length: Math.min(cores, 8) }, (_, i) => {
          const coreUsage = Math.max(0, Math.min(100, usage + (Math.random() - 0.5) * 40));
          const coreColor = coreUsage > 80 ? '#ff0044' : coreUsage > 50 ? '#ff8800' : '#00ff00';
          return (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[8px] md:text-[10px] text-[#00ffff]/40 mb-1">C{i + 1}</span>
              <div className="w-full h-8 md:h-10 bg-black/40 border border-[#00ffff]/10 relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,255,255,0.1) 25%, rgba(0,255,255,0.1) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(0,255,255,0.1) 25%, rgba(0,255,255,0.1) 26%, transparent 27%)',
                    backgroundSize: '4px 4px'
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{ 
                    height: `${coreUsage}%`,
                    background: `linear-gradient(180deg, ${coreColor}80, ${coreColor})`,
                    boxShadow: `0 0 10px ${coreColor}40`
                  }}
                />
              </div>
              <span className="text-[8px] md:text-[10px] mt-1 font-mono" style={{ color: coreColor }}>
                {coreUsage.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom info bar - 移动端简化 */}
      <div className="mt-2 md:mt-3 flex justify-between items-center text-[8px] md:text-[10px]">
        <span className="text-[#00ffff]/40">TEMP: <span className="text-[#ff8800]">45°C</span></span>
        <span className="hidden md:inline text-[#00ffff]/40">FREQ: <span className="text-[#00ff00]">3.2GHz</span></span>
        <span className="text-[#00ffff]/40">VOLT: <span className="text-[#00ffff]">1.2V</span></span>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 flex gap-1">
        {['#00ffff', '#00ff00', '#ff8800', '#ff0044'].map((color, i) => (
          <div 
            key={i}
            className="w-1 h-1 md:w-1.5 md:h-1.5 rotate-45"
            style={{ backgroundColor: color, opacity: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CPUMonitor;
