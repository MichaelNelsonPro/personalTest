import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Terminal, AlertCircle, CheckCircle, Info, AlertTriangle, Zap } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'system';
  message: string;
  japanese?: string;
}

interface LogTerminalProps {
  cpuUsage?: number;
  memoryUsage?: number;
  networkDown?: number;
  batteryLevel?: number | null;
  isCharging?: boolean | null;
  syncRate?: number;
}

const LogTerminal: FC<LogTerminalProps> = ({
  cpuUsage = 0,
  memoryUsage = 0,
  networkDown = 0,
  batteryLevel = null,
  isCharging = null,
  syncRate = 100,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);
  
  // 记录之前的状态，用于检测变化
  const prevStateRef = useRef({
    cpuUsage: 0,
    memoryUsage: 0,
    networkDown: 0,
    batteryLevel: null as number | null,
    isCharging: null as boolean | null,
    syncRate: 100,
    lastCpuWarning: 0,
    lastMemoryWarning: 0,
    lastNetworkLog: 0,
  });

  const getTypeConfig = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': 
        return { 
          color: '#ff0044', 
          bgColor: '#ff004415',
          icon: AlertCircle,
          prefix: 'ERR'
        };
      case 'warn': 
        return { 
          color: '#ff8800', 
          bgColor: '#ff880015',
          icon: AlertTriangle,
          prefix: 'WRN'
        };
      case 'success': 
        return { 
          color: '#00ff00', 
          bgColor: '#00ff0015',
          icon: CheckCircle,
          prefix: 'OK'
        };
      case 'system': 
        return { 
          color: '#00ffff', 
          bgColor: '#00ffff15',
          icon: Zap,
          prefix: 'SYS'
        };
      default: 
        return { 
          color: '#00ff00', 
          bgColor: '#00ff0008',
          icon: Info,
          prefix: 'INF'
        };
    }
  };

  // 添加日志的辅助函数
  const addLog = (type: LogEntry['type'], message: string, japanese: string) => {
    const now = new Date();
    const newLog: LogEntry = {
      id: logIdRef.current++,
      timestamp: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
      japanese,
    };

    setLogs(prev => {
      const newLogs = [...prev, newLog];
      if (newLogs.length > 60) {
        return newLogs.slice(-60);
      }
      return newLogs;
    });
  };

  // 根据系统状态生成日志
  useEffect(() => {
    const now = Date.now();
    const prev = prevStateRef.current;

    // CPU 状态检测
    if (cpuUsage > 80 && prev.cpuUsage <= 80 && now - prev.lastCpuWarning > 5000) {
      addLog('error', `CPU usage critical: ${cpuUsage.toFixed(1)}%`, 'CPU使用率危険');
      prev.lastCpuWarning = now;
    } else if (cpuUsage > 60 && prev.cpuUsage <= 60 && now - prev.lastCpuWarning > 5000) {
      addLog('warn', `CPU usage elevated: ${cpuUsage.toFixed(1)}%`, 'CPU使用率上昇');
      prev.lastCpuWarning = now;
    } else if (cpuUsage < 40 && prev.cpuUsage >= 40 && now - prev.lastCpuWarning > 5000) {
      addLog('success', 'CPU usage normalized', 'CPU使用率正常化');
      prev.lastCpuWarning = now;
    }

    // 内存状态检测
    if (memoryUsage > 85 && prev.memoryUsage <= 85 && now - prev.lastMemoryWarning > 5000) {
      addLog('error', `Memory pressure critical: ${memoryUsage.toFixed(1)}%`, 'メモリ危険');
      prev.lastMemoryWarning = now;
    } else if (memoryUsage > 70 && prev.memoryUsage <= 70 && now - prev.lastMemoryWarning > 5000) {
      addLog('warn', `Memory usage high: ${memoryUsage.toFixed(1)}%`, 'メモリ警告');
      prev.lastMemoryWarning = now;
    } else if (memoryUsage < 50 && prev.memoryUsage >= 50 && now - prev.lastMemoryWarning > 5000) {
      addLog('success', 'Memory usage optimal', 'メモリ最適');
      prev.lastMemoryWarning = now;
    }

    // 网络状态检测
    if (networkDown > 10000000 && prev.networkDown <= 10000000 && now - prev.lastNetworkLog > 3000) {
      addLog('info', 'High network activity detected', '高ネットワーク活性');
      prev.lastNetworkLog = now;
    } else if (networkDown < 1000 && prev.networkDown >= 1000 && now - prev.lastNetworkLog > 5000) {
      addLog('warn', 'Network activity low', 'ネットワーク活性低下');
      prev.lastNetworkLog = now;
    } else if (networkDown > 100000 && prev.networkDown <= 100000 && now - prev.lastNetworkLog > 3000) {
      addLog('success', 'Network connection active', 'ネットワーク接続安定');
      prev.lastNetworkLog = now;
    }

    // 电池状态检测
    if (batteryLevel !== null && prev.batteryLevel !== null) {
      if (batteryLevel < 20 && prev.batteryLevel >= 20) {
        addLog('error', `Battery critical: ${batteryLevel}%`, 'バッテリー危険');
      } else if (batteryLevel < 50 && prev.batteryLevel >= 50) {
        addLog('warn', `Battery low: ${batteryLevel}%`, 'バッテリー低下');
      } else if (batteryLevel > 80 && prev.batteryLevel <= 80) {
        addLog('success', `Battery charged: ${batteryLevel}%`, 'バッテリー充電済');
      }
    }

    // 充电状态变化
    if (isCharging !== null && prev.isCharging !== isCharging) {
      if (isCharging) {
        addLog('success', 'Power adapter connected', '電源アダプタ接続');
      } else if (batteryLevel !== null) {
        addLog('info', 'Running on battery power', 'バッテリー駆動中');
      }
    }

    // 同步率状态
    if (syncRate < 50 && prev.syncRate >= 50) {
      addLog('error', `Sync rate critical: ${syncRate.toFixed(1)}%`, '同期率危険');
    } else if (syncRate < 70 && prev.syncRate >= 70) {
      addLog('warn', `Sync rate warning: ${syncRate.toFixed(1)}%`, '同期率警告');
    } else if (syncRate > 90 && prev.syncRate <= 90) {
      addLog('success', `Sync rate optimal: ${syncRate.toFixed(1)}%`, '同期率最適');
    }

    // 更新之前的状态
    prevStateRef.current = {
      ...prev,
      cpuUsage,
      memoryUsage,
      networkDown,
      batteryLevel,
      isCharging,
      syncRate,
    };
  }, [cpuUsage, memoryUsage, networkDown, batteryLevel, isCharging, syncRate]);

  // 初始化日志
  useEffect(() => {
    const initLogs: LogEntry[] = [
      {
        id: logIdRef.current++,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'system',
        message: 'NERV System Monitor initialized',
        japanese: 'NERVシステムモニタ初期化',
      },
      {
        id: logIdRef.current++,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'success',
        message: 'System monitoring active',
        japanese: 'システム監視有効',
      },
      {
        id: logIdRef.current++,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'info',
        message: `Detected ${navigator.hardwareConcurrency || 4} CPU cores`,
        japanese: 'CPUコア検出',
      },
    ];
    
    // 添加电池信息
    if (batteryLevel !== null) {
      initLogs.push({
        id: logIdRef.current++,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type: 'info',
        message: `Battery level: ${batteryLevel}%`,
        japanese: 'バッテリーレベル',
      });
    }
    
    setLogs(initLogs);
  }, []);

  // 定期心跳日志
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const prev = prevStateRef.current;
      
      // 如果长时间没有重要日志，添加一个状态更新
      if (now - Math.max(prev.lastCpuWarning, prev.lastMemoryWarning, prev.lastNetworkLog) > 15000) {
        const heartbeatMsgs = [
          { msg: 'System status nominal', jp: 'システム状態正常', type: 'info' as const },
          { msg: 'Monitoring systems operational', jp: '監視システム稼働中', type: 'info' as const },
          { msg: 'Data collection active', jp: 'データ収集中', type: 'info' as const },
        ];
        const randomMsg = heartbeatMsgs[Math.floor(Math.random() * heartbeatMsgs.length)];
        addLog(randomMsg.type, randomMsg.msg, randomMsg.jp);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="nerv-panel nerv-corner nerv-panel-cyan p-2.5 md:p-4 h-full flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 md:w-5 md:h-5 text-[#00ffff]" />
          <span className="text-[10px] md:text-sm tracking-wider text-[#00ffff]/80">SYSTEM LOG</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Legend - 移动端简化 */}
          <div className="hidden md:flex gap-2 text-[9px]">
            <span className="text-[#00ff00]">● OK</span>
            <span className="text-[#00ffff]">● SYS</span>
            <span className="text-[#ff8800]">● WRN</span>
            <span className="text-[#ff0044]">● ERR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] md:text-[10px] text-[#00ffff]/40">MAGI-01</span>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00ff00] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Log Display */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-black/50 border border-[#00ffff]/20 p-1.5 md:p-2 overflow-y-auto font-mono text-[9px] md:text-xs"
        style={{ 
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,255,255,0.02) 18px, rgba(0,255,255,0.02) 19px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,255,0,0.01) 40px, rgba(0,255,0,0.01) 41px)
          `
        }}
      >
        {logs.map((log, index) => {
          const config = getTypeConfig(log.type);
          const Icon = config.icon;
          const isLatest = index === logs.length - 1;
          
          return (
            <div 
              key={log.id} 
              className={`mb-1 md:mb-1.5 flex gap-1 md:gap-2 animate-in fade-in slide-in-from-left-2 duration-200 ${isLatest ? 'opacity-100' : 'opacity-80'}`}
            >
              {/* Timestamp */}
              <span className="text-[#00ffff]/40 whitespace-nowrap text-[8px] md:text-[10px]">
                [{log.timestamp}]
              </span>
              
              {/* Type indicator */}
              <span 
                className="whitespace-nowrap text-[8px] md:text-[10px] px-0.5 md:px-1 border"
                style={{ 
                  color: config.color, 
                  borderColor: `${config.color}50`,
                  backgroundColor: config.bgColor
                }}
              >
                {config.prefix}
              </span>
              
              {/* Icon */}
              <Icon className="w-2.5 h-2.5 md:w-3 md:h-3 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
              
              {/* Message */}
              <span className="text-[#e0e0e0]/90 text-[9px] md:text-[11px] truncate">{log.message}</span>
              
              {/* Japanese translation - 移动端隐藏 */}
              <span className="hidden md:inline text-[#00ffff]/30 text-[10px]">// {log.japanese}</span>
            </div>
          );
        })}
        
        {/* Blinking cursor */}
        <div className="flex gap-1 md:gap-2 mt-1 md:mt-2 items-center">
          <span className="text-[#00ffff]/40 text-[8px] md:text-[10px]">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-[#00ff00] blink text-base md:text-lg">_</span>
          <span className="hidden md:inline text-[#00ffff]/30 text-[10px]">// 待機中...</span>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="mt-1.5 md:mt-2 flex items-center justify-between text-[8px] md:text-[10px] border-t border-[#00ffff]/10 pt-1.5 md:pt-2">
        <div className="flex gap-2 md:gap-4">
          <span className="text-[#00ffff]/40">LOGS: <span className="text-[#00ff00]">{logs.length}</span></span>
          <span className="text-[#00ffff]/40">BUF: <span className="text-[#ff8800]">60</span></span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          <span className="text-[#00ffff]/40">STATUS:</span>
          <span className="text-[#00ff00] animate-pulse">● ACTIVE</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 border-t border-r border-[#00ffff]/20" />
    </div>
  );
};

export default LogTerminal;
