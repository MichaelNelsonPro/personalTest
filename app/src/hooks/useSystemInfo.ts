import { useState, useEffect, useRef } from 'react';

export interface SystemInfo {
  // CPU Info
  cpuUsage: number;
  cpuCores: number;
  cpuModel: string;
  
  // Memory Info
  memoryUsed: number;
  memoryTotal: number;
  memoryUsage: number;
  
  // Network Info
  networkDown: number;
  networkUp: number;
  networkType: string;
  networkEffectiveType: string;
  networkRTT: number;
  
  // Time
  uptime: number;
  currentTime: Date;
  
  // Battery
  batteryLevel: number | null;
  isCharging: boolean | null;
  batteryTimeRemaining: number | null;
}

// Format bytes to human readable
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0 || !isFinite(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format speed (bytes per second)
export const formatSpeed = (bytesPerSecond: number): string => {
  if (!isFinite(bytesPerSecond) || bytesPerSecond < 0) return '0 B/s';
  return formatBytes(bytesPerSecond) + '/s';
};

// Format uptime
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 通过 requestIdleCallback 估算 CPU 使用率
const useRealCPUUsage = (refreshInterval: number) => {
  const [cpuUsage, setCpuUsage] = useState(0);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let isRunning = true;
    
    const calculateCPU = () => {
      if (!isRunning) return;
      
      const now = performance.now();
      const elapsed = now - lastTime;
      frameCount++;
      
      // 使用 requestIdleCallback 来测量空闲时间
      if ('requestIdleCallback' in window) {
        const startMark = performance.now();
        requestIdleCallback(() => {
          if (!isRunning) return;
          const endMark = performance.now();
          const timeSpent = endMark - startMark;
          
          // 估算：如果 deadline.timeRemaining() 很小，说明 CPU 很忙
          // 通过测量回调被延迟的时间来估算负载
          const delay = timeSpent - 1; // 减去预期的最小延迟
          
          // 简单的启发式算法：延迟越高，CPU 越忙
          // 同时考虑帧率来辅助判断
          const frameRate = frameCount / (elapsed / 1000);
          
          let usage = 0;
          if (frameRate > 0) {
            // 基于帧率估算：帧率越低，CPU 越忙
            const frameRateFactor = Math.max(0, 1 - (frameRate / 60));
            // 基于延迟估算
            const delayFactor = Math.min(1, delay / 50);
            // 综合估算
            usage = Math.min(100, (frameRateFactor * 30 + delayFactor * 70));
          }
          
          setCpuUsage(prev => {
            // 平滑处理
            const smoothed = prev * 0.7 + usage * 0.3;
            return Math.round(smoothed);
          });
          
          frameCount = 0;
          lastTime = now;
        }, { timeout: 50 });
      } else {
        // 降级方案：使用帧率估算
        const frameRate = frameCount / (elapsed / 1000);
        const usage = Math.min(100, Math.max(0, (1 - frameRate / 60) * 100));
        
        setCpuUsage(prev => Math.round(prev * 0.7 + usage * 0.3));
        frameCount = 0;
        lastTime = now;
      }
    };
    
    const interval = setInterval(calculateCPU, refreshInterval);
    return () => {
      isRunning = false;
      clearInterval(interval);
    };
  }, [refreshInterval]);
  
  return cpuUsage;
};

// 网络信息 Hook
const useNetworkInfo = () => {
  const [networkInfo, setNetworkInfo] = useState({
    downlink: 0,
    uplink: 0,
    type: 'unknown',
    effectiveType: '4g',
    rtt: 0,
  });

  useEffect(() => {
    // @ts-ignore - Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const updateConnectionInfo = () => {
        setNetworkInfo({
          // @ts-ignore
          downlink: connection.downlink * 125000 || 0, // Mbps to bytes/s (approx)
          // @ts-ignore
          uplink: connection.uplink * 125000 || 0,
          type: connection.type || 'unknown',
          effectiveType: connection.effectiveType || '4g',
          rtt: connection.rtt || 0,
        });
      };
      
      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);
      return () => connection.removeEventListener('change', updateConnectionInfo);
    }
  }, []);
  
  return networkInfo;
};

// 基于 Performance API 计算实际网络速度
const useRealNetworkSpeed = (refreshInterval: number) => {
  const [speeds, setSpeeds] = useState({ down: 0, up: 0 });
  const lastEntryRef = useRef<PerformanceEntry | null>(null);
  
  useEffect(() => {
    const calculateSpeed = () => {
      // 获取资源加载性能数据
      const entries = performance.getEntriesByType('resource');
      
      if (entries.length > 0 && lastEntryRef.current) {
        let totalDownloaded = 0;
        let totalTime = 0;
        
        // 只计算新加载的资源
        const newEntries = entries.filter(e => e.startTime > lastEntryRef.current!.startTime);
        
        newEntries.forEach((entry: any) => {
          if (entry.transferSize) {
            totalDownloaded += entry.transferSize;
            totalTime += entry.responseEnd - entry.startTime;
          }
        });
        
        if (totalTime > 0) {
          const avgSpeed = (totalDownloaded / totalTime) * 1000; // bytes per second
          setSpeeds(prev => ({
            down: Math.round(prev.down * 0.8 + avgSpeed * 0.2), // 平滑处理
            up: 0, // 上传速度浏览器无法直接测量
          }));
        }
      }
      
      // 清理旧的 performance entries，保留最近的 50 个
      if (entries.length > 50) {
        const toRemove = entries.slice(0, entries.length - 50);
        toRemove.forEach(() => performance.clearResourceTimings?.());
      }
      
      if (entries.length > 0) {
        lastEntryRef.current = entries[entries.length - 1];
      }
    };
    
    const interval = setInterval(calculateSpeed, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  return speeds;
};

export const useSystemInfo = (refreshInterval = 1000) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpuUsage: 0,
    cpuCores: navigator.hardwareConcurrency || 4,
    cpuModel: 'Unknown CPU',
    memoryUsed: 0,
    memoryTotal: 0,
    memoryUsage: 0,
    networkDown: 0,
    networkUp: 0,
    networkType: 'unknown',
    networkEffectiveType: '4g',
    networkRTT: 0,
    uptime: 0,
    currentTime: new Date(),
    batteryLevel: null,
    isCharging: null,
    batteryTimeRemaining: null,
  });

  const startTimeRef = useRef(Date.now());
  const cpuUsage = useRealCPUUsage(refreshInterval);
  const networkInfo = useNetworkInfo();
  const realSpeeds = useRealNetworkSpeed(refreshInterval);

  // 获取电池信息
  useEffect(() => {
    const getBattery = async () => {
      try {
        // @ts-ignore - Battery API might not be in all browsers
        if (navigator.getBattery) {
          // @ts-ignore
          const battery = await navigator.getBattery();
          
          const updateBattery = () => {
            setSystemInfo(prev => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              isCharging: battery.charging,
              batteryTimeRemaining: battery.charging 
                ? battery.chargingTime 
                : battery.dischargingTime,
            }));
          };
          
          updateBattery();
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);
          battery.addEventListener('chargingtimechange', updateBattery);
          battery.addEventListener('dischargingtimechange', updateBattery);
          
          return () => {
            battery.removeEventListener('levelchange', updateBattery);
            battery.removeEventListener('chargingchange', updateBattery);
            battery.removeEventListener('chargingtimechange', updateBattery);
            battery.removeEventListener('dischargingtimechange', updateBattery);
          };
        }
      } catch {
        console.log('Battery API not available');
      }
    };
    
    getBattery();
  }, []);

  // 获取内存信息
  useEffect(() => {
    const getMemoryInfo = () => {
      // @ts-ignore - Performance memory API
      const memory = performance.memory;
      if (memory) {
        const used = memory.usedJSHeapSize;
        const total = memory.jsHeapSizeLimit;
        setSystemInfo(prev => ({
          ...prev,
          memoryUsed: used,
          memoryTotal: total,
          memoryUsage: Math.round((used / total) * 100),
        }));
      }
    };
    
    getMemoryInfo();
    const interval = setInterval(getMemoryInfo, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 主更新循环 - 整合所有数据
  useEffect(() => {
    const updateSystemInfo = () => {
      const now = Date.now();
      const uptime = Math.floor((now - startTimeRef.current) / 1000);
      
      // 综合网络速度：优先使用 Performance API 的数据，否则用 Network Info API
      const networkDown = realSpeeds.down > 0 
        ? realSpeeds.down 
        : networkInfo.downlink;
      
      setSystemInfo(prev => ({
        ...prev,
        cpuUsage,
        uptime,
        currentTime: new Date(),
        networkDown,
        networkUp: networkInfo.uplink,
        networkType: networkInfo.type,
        networkEffectiveType: networkInfo.effectiveType,
        networkRTT: networkInfo.rtt,
      }));
    };

    updateSystemInfo();
    const interval = setInterval(updateSystemInfo, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, cpuUsage, networkInfo, realSpeeds]);

  return systemInfo;
};

export default useSystemInfo;
