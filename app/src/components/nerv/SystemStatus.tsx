import type { FC } from 'react';
import { Clock, Battery, BatteryCharging, Power, Thermometer, Fan } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { formatUptime } from '@/hooks/useSystemInfo';

interface SystemStatusProps {
  currentTime: Date;
  uptime: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
}

const SystemStatus: FC<SystemStatusProps> = ({
  currentTime,
  uptime,
  batteryLevel,
  isCharging,
}) => {
  const getBatteryColor = (level: number | null) => {
    if (level === null) return '#00ffff';
    if (level < 20) return '#ff0044';
    if (level < 50) return '#ff8800';
    return '#00ff00';
  };

  const getBatteryStatus = (level: number | null) => {
    if (level === null) return { text: 'AC POWER', color: '#00ffff' };
    if (level < 20) return { text: 'CRITICAL', color: '#ff0044' };
    if (level < 50) return { text: 'LOW', color: '#ff8800' };
    return { text: 'GOOD', color: '#00ff00' };
  };

  const batteryColor = getBatteryColor(batteryLevel);
  const batteryStatus = getBatteryStatus(batteryLevel);

  return (
    <div className="nerv-panel nerv-corner p-3 md:p-4 h-full">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Power className="w-4 h-4 md:w-5 md:h-5 text-[#00ffff]" />
        <span className="text-xs md:text-sm tracking-wider text-[#00ffff]/80">SYSTEM STATUS</span>
      </div>

      {/* Time Display with cyan accent */}
      <div className="mb-3 md:mb-4">
        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
          <Clock className="w-3 h-3 md:w-4 md:h-4 text-[#00ffff]/60" />
          <span className="text-[8px] md:text-[10px] text-[#00ffff]/50 tracking-wider">LOCAL TIME</span>
        </div>
        <div className="bg-[#00ffff]/5 border border-[#00ffff]/20 p-2 md:p-3 relative overflow-hidden">
          <div className="text-xl md:text-3xl text-[#00ffff] font-mono tracking-wider glow-text-cyan">
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="text-[10px] md:text-xs text-[#00ff00]/60 mt-1">
            {currentTime.toLocaleDateString('en-US', { 
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </div>
          {/* Decorative line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#00ffff] via-[#00ff00] to-transparent" />
        </div>
      </div>

      {/* Uptime with green accent */}
      <div className="mb-3 md:mb-4">
        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
          <div className="w-3 h-3 md:w-4 md:h-4 border border-[#00ff00]/60 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00ff00] rounded-full animate-pulse" />
          </div>
          <span className="text-[8px] md:text-[10px] text-[#00ff00]/50 tracking-wider">SYSTEM UPTIME</span>
        </div>
        <div className="bg-[#00ff00]/5 border border-[#00ff00]/20 p-2 md:p-3">
          <div className="text-lg md:text-2xl text-[#00ff00] font-mono tracking-wider glow-text">
            {formatUptime(uptime)}
          </div>
          <div className="text-[10px] md:text-xs text-[#00ffff]/40 mt-1">
            システム稼働時間
          </div>
        </div>
      </div>

      {/* Battery with dynamic color */}
      <div>
        <div className="flex items-center gap-2 mb-1.5 md:mb-2">
          {isCharging ? (
            <BatteryCharging className="w-3 h-3 md:w-4 md:h-4" style={{ color: batteryColor }} />
          ) : (
            <Battery className="w-3 h-3 md:w-4 md:h-4" style={{ color: batteryColor }} />
          )}
          <span className="text-[8px] md:text-[10px] text-[#00ffff]/50 tracking-wider">POWER UNIT</span>
        </div>
        <div className="border p-2 md:p-3 relative overflow-hidden"
          style={{ 
            borderColor: `${batteryColor}40`,
            backgroundColor: `${batteryColor}08`
          }}
        >
          {batteryLevel !== null ? (
            <>
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <AnimatedNumber 
                  value={batteryLevel}
                  decimals={0}
                  glowColor={batteryColor}
                  intense={batteryLevel < 20}
                  pulseOnHigh={batteryLevel < 20}
                  highThreshold={20}
                  suffix="%"
                  className="text-lg md:text-2xl font-mono"
                />
                <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 border"
                  style={{ 
                    color: batteryColor, 
                    borderColor: batteryColor,
                    backgroundColor: `${batteryColor}15`
                  }}
                >
                  {isCharging ? 'CHARGING' : batteryStatus.text}
                </span>
              </div>
              <div className="h-2.5 md:h-3 bg-black/50 border relative overflow-hidden"
                style={{ borderColor: `${batteryColor}30` }}
              >
                {/* Grid background */}
                <div className="absolute inset-0 flex">
                  {[25, 50, 75].map((mark) => (
                    <div 
                      key={mark}
                      className="absolute top-0 bottom-0 w-px bg-[#00ffff]/10"
                      style={{ left: `${mark}%` }}
                    />
                  ))}
                </div>
                <div 
                  className="h-full transition-all duration-500 relative"
                  style={{ 
                    width: `${batteryLevel}%`,
                    background: batteryLevel < 20 
                      ? 'linear-gradient(90deg, #cc0033, #ff0044, #ff4466)' 
                      : batteryLevel < 50 
                      ? 'linear-gradient(90deg, #cc6600, #ff8800, #ffaa00)' 
                      : 'linear-gradient(90deg, #00aa00, #00ff00, #88ff00)',
                    boxShadow: batteryLevel < 20 
                      ? '0 0 15px rgba(255,0,68,0.8)' 
                      : batteryLevel < 50 
                      ? '0 0 10px rgba(255,136,0,0.6)' 
                      : '0 0 10px rgba(0,255,0,0.5)'
                  }}
                >
                  {isCharging && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1s_infinite]" />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-[7px] md:text-[8px] text-[#00ffff]/40">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </>
          ) : (
            <div className="text-center py-2 md:py-3">
              <span className="text-xs md:text-sm text-[#00ffff]/60">EXTERNAL POWER</span>
              <div className="text-[10px] md:text-xs text-[#00ff00]/40 mt-1">外部電源稼働中</div>
              <div className="mt-2 flex justify-center">
                <div className="w-14 md:w-16 h-1 bg-[#00ff00]/30 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-[#00ff00] animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System metrics - 移动端简化 */}
      <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2">
        <div className="bg-[#ff8800]/5 border border-[#ff8800]/20 p-1.5 md:p-2 flex items-center gap-2">
          <Thermometer className="w-3 h-3 md:w-4 md:h-4 text-[#ff8800]" />
          <div>
            <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 block">TEMP</span>
            <span className="text-xs md:text-sm text-[#ff8800] font-mono">42°C</span>
          </div>
        </div>
        <div className="bg-[#00ffff]/5 border border-[#00ffff]/20 p-1.5 md:p-2 flex items-center gap-2">
          <Fan className="w-3 h-3 md:w-4 md:h-4 text-[#00ffff] animate-[spin_2s_linear_infinite]" />
          <div>
            <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 block">FAN</span>
            <span className="text-xs md:text-sm text-[#00ffff] font-mono">2400</span>
          </div>
        </div>
      </div>

      {/* MAGI status indicators */}
      <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2">
        {[
          { name: 'MAGI-1', color: '#00ff00', status: 'MELCHIOR' },
          { name: 'MAGI-2', color: '#00ffff', status: 'BALTHASAR' },
          { name: 'MAGI-3', color: '#ff8800', status: 'CASPER' }
        ].map((magi) => (
          <div key={magi.name} className="flex flex-col items-center">
            <div className="w-full h-6 md:h-8 border flex items-center justify-center"
              style={{ borderColor: `${magi.color}40`, backgroundColor: `${magi.color}08` }}
            >
              <div 
                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: magi.color,
                  boxShadow: `0 0 10px ${magi.color}` 
                }}
              />
            </div>
            <span className="text-[7px] md:text-[8px] text-[#00ffff]/40 mt-1">{magi.name}</span>
            <span className="text-[6px] md:text-[7px]" style={{ color: `${magi.color}80` }}>{magi.status}</span>
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        {['#00ffff', '#00ff00', '#ff8800'].map((color, i) => (
          <div key={i} className="w-0.5 h-0.5 md:w-1 md:h-1 rotate-45" style={{ backgroundColor: color, opacity: 0.3 }} />
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;
