import type { FC } from 'react';

interface NERVHeaderProps {
  syncRate?: number;
}

const NERVHeader: FC<NERVHeaderProps> = ({ syncRate = 100 }) => {
  const getSyncColor = (rate: number) => {
    if (rate > 80) return 'text-[#00ff00]';
    if (rate > 50) return 'text-[#ff8800]';
    return 'text-[#ff0044]';
  };

  const getSyncGlow = (rate: number) => {
    if (rate > 80) return 'drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]';
    if (rate > 50) return 'drop-shadow-[0_0_10px_rgba(255,136,0,0.8)]';
    return 'drop-shadow-[0_0_10px_rgba(255,0,68,0.8)]';
  };

  const getStatusText = (rate: number) => {
    if (rate > 80) return { text: 'SYSTEM NORMAL', color: 'text-[#00ff00]' };
    if (rate > 50) return { text: 'SYSTEM WARNING', color: 'text-[#ff8800]' };
    return { text: 'SYSTEM CRITICAL', color: 'text-[#ff0044]' };
  };

  const status = getStatusText(syncRate);

  return (
    <header className="relative w-full h-20 md:h-24 flex items-center justify-between px-3 md:px-6 border-b-2 border-[#00ffff]/30 bg-gradient-to-r from-[#0a0a0a] via-[#0a1515] to-[#0a0a0a]">
      {/* Left: NERV Logo with multi-color */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative">
          <svg 
            width="48" 
            height="48"
            viewBox="0 0 100 100" 
            className="animate-pulse md:w-[60px] md:h-[60px]"
          >
            {/* Outer glow ring - cyan */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#00ffff"
              strokeWidth="0.5"
              opacity="0.3"
              className="animate-[spin_10s_linear_infinite]"
              strokeDasharray="10 5"
            />
            
            {/* NERV Leaf Logo - multi-color gradient */}
            <defs>
              <linearGradient id="nervGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="50%" stopColor="#00ff00" />
                <stop offset="100%" stopColor="#ff8800" />
              </linearGradient>
            </defs>
            
            <path 
              d="M50 5 C30 5, 10 25, 10 50 C10 75, 30 95, 50 95 C70 95, 90 75, 90 50 C90 25, 70 5, 50 5 Z" 
              fill="none" 
              stroke="url(#nervGrad)" 
              strokeWidth="2"
              className="drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]"
            />
            <path 
              d="M50 15 C35 15, 20 30, 20 50 C20 70, 35 85, 50 85 C65 85, 80 70, 80 50 C80 30, 65 15, 50 15 Z" 
              fill="none" 
              stroke="#00ff00" 
              strokeWidth="1"
              opacity="0.6"
            />
            
            {/* Center N with color based on sync rate */}
            <text 
              x="50" 
              y="58" 
              textAnchor="middle" 
              fill={syncRate > 80 ? '#00ff00' : syncRate > 50 ? '#ff8800' : '#ff0044'}
              fontSize="24" 
              fontFamily="monospace"
              fontWeight="bold"
              className={getSyncGlow(syncRate)}
            >
              N
            </text>
            
            {/* Decorative dots */}
            <circle cx="50" cy="25" r="2" fill="#00ffff" opacity="0.8" />
            <circle cx="75" cy="50" r="2" fill="#ff8800" opacity="0.8" />
            <circle cx="50" cy="75" r="2" fill="#00ff00" opacity="0.8" />
            <circle cx="25" cy="50" r="2" fill="#ff0044" opacity="0.6" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-[0.2em]"
            style={{
              background: 'linear-gradient(90deg, #00ffff, #00ff00, #ff8800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0,255,255,0.3)'
            }}
          >
            NERV
          </h1>
          <p className="text-[10px] md:text-xs tracking-[0.3em] text-[#00ffff]/60">
            SYSTEM MONITOR <span className="text-[#ff8800]">v3.0</span>
          </p>
        </div>
      </div>

      {/* Center: Status Indicator - 移动端隐藏详细信息 */}
      <div className="hidden md:flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div 
            className={`w-3 h-3 rounded-full animate-pulse ${
              syncRate > 80 ? 'bg-[#00ff00] shadow-[0_0_15px_#00ff00]' : 
              syncRate > 50 ? 'bg-[#ff8800] shadow-[0_0_15px_#ff8800]' : 
              'bg-[#ff0044] shadow-[0_0_20px_#ff0044]'
            }`} 
          />
          <span className={`text-lg tracking-wider font-bold ${status.color}`}
            style={{ textShadow: `0 0 15px currentColor` }}
          >
            {status.text}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-[#00ffff]/50">MAGI-1: <span className="text-[#00ff00]">ONLINE</span></span>
          <span className="text-xs text-[#00ffff]/50">MAGI-2: <span className="text-[#00ff00]">ONLINE</span></span>
          <span className="text-xs text-[#00ffff]/50">MAGI-3: <span className="text-[#00ff00]">ONLINE</span></span>
        </div>
      </div>

      {/* Center: 移动端简化的状态指示 */}
      <div className="flex md:hidden items-center gap-2">
        <div 
          className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            syncRate > 80 ? 'bg-[#00ff00] shadow-[0_0_10px_#00ff00]' : 
            syncRate > 50 ? 'bg-[#ff8800] shadow-[0_0_10px_#ff8800]' : 
            'bg-[#ff0044] shadow-[0_0_15px_#ff0044]'
          }`} 
        />
        <span className={`text-xs font-bold ${status.color}`}>
          {syncRate > 80 ? 'NORMAL' : syncRate > 50 ? 'WARN' : 'CRIT'}
        </span>
      </div>

      {/* Right: Sync Rate - 移动端简化 */}
      <div className="flex flex-col items-end">
        <div className="hidden md:block text-xs text-[#00ffff]/60 mb-1 tracking-wider">SYNC RATE</div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl md:text-4xl font-bold ${getSyncColor(syncRate)}`}
            style={{ textShadow: `0 0 20px currentColor` }}
          >
            {syncRate.toFixed(2)}
          </span>
          <span className="text-sm md:text-lg text-[#00ffff]/60">%</span>
        </div>
        {/* Gradient progress bar - 移动端隐藏 */}
        <div className="hidden md:block w-40 h-2 bg-black/50 border border-[#00ffff]/20 mt-2 overflow-hidden relative">
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${syncRate}%`,
              background: syncRate > 80 
                ? 'linear-gradient(90deg, #00aa00, #00ff00)' 
                : syncRate > 50 
                ? 'linear-gradient(90deg, #cc6600, #ff8800)' 
                : 'linear-gradient(90deg, #cc0033, #ff0044)',
              boxShadow: syncRate > 80 
                ? '0 0 10px #00ff00' 
                : syncRate > 50 
                ? '0 0 10px #ff8800' 
                : '0 0 15px #ff0044'
            }}
          />
          {/* Grid marks */}
          <div className="absolute inset-0 flex">
            {[25, 50, 75].map((mark) => (
              <div 
                key={mark}
                className="absolute top-0 bottom-0 w-px bg-[#00ffff]/20"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
        </div>
        <div className="hidden md:flex justify-between w-40 mt-1">
          <span className="text-[8px] text-[#ff0044]/60">0</span>
          <span className="text-[8px] text-[#ff8800]/60">50</span>
          <span className="text-[8px] text-[#00ff00]/60">100</span>
        </div>
      </div>

      {/* Decorative corners with multi-color */}
      <div className="absolute top-0 left-0 w-4 h-4 md:w-6 md:h-6 border-t-2 border-l-2 border-[#00ffff]" />
      <div className="absolute top-0 right-0 w-4 h-4 md:w-6 md:h-6 border-t-2 border-r-2 border-[#ff8800]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 md:w-6 md:h-6 border-b-2 border-l-2 border-[#00ff00]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6 border-b-2 border-r-2 border-[#ff0044]" />
      
      {/* Top line gradient */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-[#00ffff] via-[#00ff00] to-[#ff8800] opacity-50" />
    </header>
  );
};

export default NERVHeader;
