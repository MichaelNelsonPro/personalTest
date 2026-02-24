import type { FC } from 'react';
import { useEffect, useState } from 'react';
import NERVHeader from '@/components/nerv/NERVHeader';
import CPUMonitor from '@/components/nerv/CPUMonitor';
import MemoryMonitor from '@/components/nerv/MemoryMonitor';
import NetworkMonitor from '@/components/nerv/NetworkMonitor';
import SystemStatus from '@/components/nerv/SystemStatus';
import LogTerminal from '@/components/nerv/LogTerminal';
import CircularGauge from '@/components/nerv/CircularGauge';
import AudioControl from '@/components/nerv/AudioControl';
import ThemeControl from '@/components/nerv/ThemeControl';
import ScanlineEffect from '@/components/nerv/ScanlineEffect';
import { useSystemInfo } from '@/hooks/useSystemInfo';
import { useAudioSystem } from '@/hooks/useAudioSystem';
import { useTheme } from '@/hooks/useTheme';
import './App.css';

const App: FC = () => {
  const systemInfo = useSystemInfo(1000);
  const { currentTheme, theme } = useTheme();
  const [audioExpanded, setAudioExpanded] = useState(false);
  const [themeExpanded, setThemeExpanded] = useState(false);
  
  const {
    bgmEnabled,
    voiceEnabled,
    bgmVolume,
    voiceVolume,
    setBGM,
    toggleBGM,
    toggleVoice,
    setBGMVolume,
    setVoiceVolume,
    speakStatus,
  } = useAudioSystem();

  const syncRate = Math.max(0, Math.min(100, 
    100 - (systemInfo.cpuUsage * 0.3 + systemInfo.memoryUsage * 0.3)
  ));

  // 定期语音播报
  useEffect(() => {
    // 尝试加载默认 BGM
    // 使用相对路径，让 Vite 自动处理 base 路径
    setBGM('bgm.mp3');
  }, [setBGM]);

  // 每隔一段时间播报系统状态
  useEffect(() => {
    if (!voiceEnabled) return;

    const interval = setInterval(() => {
      speakStatus({
        cpuUsage: systemInfo.cpuUsage,
        memoryUsage: systemInfo.memoryUsage,
        networkDown: systemInfo.networkDown,
        batteryLevel: systemInfo.batteryLevel,
        syncRate,
      });
    }, 15000); // 每 15 秒播报一次

    return () => clearInterval(interval);
  }, [voiceEnabled, systemInfo, syncRate, speakStatus]);

  // Determine emergency state based on system metrics
  const isEmergency = systemInfo.cpuUsage > 80 || systemInfo.memoryUsage > 85;
  
  // Scanline color based on theme and emergency state
  const getScanlineColor = () => {
    if (isEmergency) return 'red';
    if (currentTheme === 'section9') return 'cyan';
    if (currentTheme === 'neotokyo') return 'red';
    return 'cyan';
  };

  return (
    <div 
      className={`min-h-screen w-full font-mono overflow-x-hidden relative transition-colors duration-300 ${
        isEmergency ? 'bg-red-950/20' : ''
      }`}
      style={{ 
        backgroundColor: isEmergency ? undefined : theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${theme.colors.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.primary}08 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'gridPulse 4s ease-in-out infinite',
        }}
      />
      
      {/* Scanline Effects */}
      <ScanlineEffect enabled={true} color={getScanlineColor()} />
      
      {/* Emergency overlay */}
      {isEmergency && (
        <div className="fixed inset-0 pointer-events-none emergency-pulse z-30" />
      )}
      
      <NERVHeader syncRate={syncRate} />
      
      <main className="p-3 md:p-4">
        {/* Row 1: CPU, Memory, System Status - 移动端单列，桌面端三列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="h-auto min-h-[280px] md:h-[280px]">
            <CPUMonitor usage={systemInfo.cpuUsage} cores={systemInfo.cpuCores} />
          </div>
          <div className="h-auto min-h-[280px] md:h-[280px]">
            <MemoryMonitor 
              used={systemInfo.memoryUsed} 
              total={systemInfo.memoryTotal} 
              usage={systemInfo.memoryUsage} 
            />
          </div>
          <div className="h-auto min-h-[280px] md:h-[280px]">
            <SystemStatus 
              currentTime={systemInfo.currentTime}
              uptime={systemInfo.uptime}
              batteryLevel={systemInfo.batteryLevel}
              isCharging={systemInfo.isCharging}
            />
          </div>
        </div>

        {/* Row 2: Gauges, Network, Logs - 移动端堆叠，桌面端 4列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          {/* Gauges - 移动端 2x2 网格 */}
          <div className="h-auto md:h-[220px]">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 h-full">
              <CircularGauge value={systemInfo.cpuUsage} label="CPU" unit="%" size="sm" />
              <CircularGauge value={systemInfo.memoryUsage} label="MEM" unit="%" size="sm" />
              <CircularGauge value={syncRate} label="SYNC" unit="%" size="sm" />
              <CircularGauge value={systemInfo.networkDown / 1000000} maxValue={100} label="NET" unit="MB/s" size="sm" />
            </div>
          </div>
          
          {/* Network Monitor - 移动端全宽 */}
          <div className="h-[200px] md:h-[220px] md:col-span-2">
            <NetworkMonitor 
              downSpeed={systemInfo.networkDown}
              upSpeed={systemInfo.networkUp}
              totalDown={systemInfo.networkDown * 60}
              totalUp={systemInfo.networkUp * 60}
              networkType={systemInfo.networkType}
              effectiveType={systemInfo.networkEffectiveType}
              rtt={systemInfo.networkRTT}
            />
          </div>
          
          {/* Log Terminal - 移动端全宽 */}
          <div className="h-[200px] md:h-[220px]">
            <LogTerminal 
              cpuUsage={systemInfo.cpuUsage}
              memoryUsage={systemInfo.memoryUsage}
              networkDown={systemInfo.networkDown}
              batteryLevel={systemInfo.batteryLevel}
              isCharging={systemInfo.isCharging}
              syncRate={syncRate}
            />
          </div>
        </div>
      </main>

      {/* Footer - 移动端简化显示 */}
      <footer 
        className="h-auto min-h-[40px] border-t flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-2 md:py-0 gap-2 md:gap-0"
        style={{ 
          borderColor: `${theme.colors.accent}20`,
          backgroundColor: theme.colors.background,
        }}
      >
        <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 text-[10px] md:text-xs">
          <span style={{ color: theme.colors.accent }}>NERV HQ</span>
          <span style={{ color: theme.colors.primary }}>TOKYO-3</span>
          <span style={{ color: theme.colors.secondary }}>MAGISYSTEM v3.0</span>
        </div>
        <div className="flex gap-2 md:gap-4 text-[10px] md:text-xs">
          <span style={{ color: theme.colors.danger }}>CLASSIFIED</span>
          <span style={{ color: theme.colors.primary }}>EVA-01: STANDBY</span>
        </div>
      </footer>

      {/* 主题控制面板 */}
      <ThemeControl
        isExpanded={themeExpanded}
        onToggle={() => {
          setThemeExpanded(!themeExpanded);
          setAudioExpanded(false);
        }}
      />

      {/* 音频控制面板 */}
      <AudioControl
        bgmEnabled={bgmEnabled}
        voiceEnabled={voiceEnabled}
        bgmVolume={bgmVolume}
        voiceVolume={voiceVolume}
        onToggleBGM={toggleBGM}
        onToggleVoice={toggleVoice}
        onSetBGMVolume={setBGMVolume}
        onSetVoiceVolume={setVoiceVolume}
        isExpanded={audioExpanded}
        onToggleExpand={() => {
          setAudioExpanded(!audioExpanded);
          setThemeExpanded(false);
        }}
      />
    </div>
  );
};

export default App;
