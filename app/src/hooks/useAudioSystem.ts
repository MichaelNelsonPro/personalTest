import { useState, useEffect, useRef, useCallback } from 'react';

interface SystemData {
  cpuUsage: number;
  memoryUsage: number;
  networkDown: number;
  batteryLevel: number | null;
  syncRate: number;
}

interface AudioSystemState {
  bgmEnabled: boolean;
  voiceEnabled: boolean;
  bgmVolume: number;
  voiceVolume: number;
}

// 日语数字读音映射
const numberToJapanese = (num: number): string => {
  const digits = ['ゼロ', 'イチ', 'ニ', 'サン', 'ヨン', 'ゴ', 'ロク', 'ナナ', 'ハチ', 'キュウ'];
  const tens = ['', 'ジュウ', 'ニジュウ', 'サンジュウ', 'ヨンジュウ', 'ゴジュウ', 'ロクジュウ', 'ナナジュウ', 'ハチジュウ', 'キュウジュウ'];
  
  if (num < 10) return digits[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? digits[one] : '');
  }
  return num.toString();
};

// 生成状态报告文本
const generateStatusReport = (data: SystemData): { text: string; jp: string } => {
  const reports: { text: string; jp: string }[] = [];
  
  // CPU 状态
  if (data.cpuUsage > 80) {
    reports.push({
      text: `Warning, CPU usage critical at ${data.cpuUsage.toFixed(0)} percent`,
      jp: `警告、CPU使用率${numberToJapanese(Math.floor(data.cpuUsage))}パーセント、危険値です`
    });
  } else if (data.cpuUsage > 50) {
    reports.push({
      text: `CPU usage at ${data.cpuUsage.toFixed(0)} percent`,
      jp: `CPU使用率${numberToJapanese(Math.floor(data.cpuUsage))}パーセント`
    });
  } else {
    reports.push({
      text: `All systems nominal, CPU at ${data.cpuUsage.toFixed(0)} percent`,
      jp: `全システム正常、CPU使用率${numberToJapanese(Math.floor(data.cpuUsage))}パーセント`
    });
  }
  
  // 内存状态
  if (data.memoryUsage > 80) {
    reports.push({
      text: `Memory pressure high, ${data.memoryUsage.toFixed(0)} percent`,
      jp: `メモリ圧迫、${numberToJapanese(Math.floor(data.memoryUsage))}パーセント`
    });
  }
  
  // 同步率
  if (data.syncRate < 50) {
    reports.push({
      text: `Synchronization rate critical`,
      jp: `同期率危険値、注意してください`
    });
  }
  
  // 电池
  if (data.batteryLevel !== null && data.batteryLevel < 30) {
    reports.push({
      text: `Battery level low, ${data.batteryLevel} percent remaining`,
      jp: `バッテリー残量${numberToJapanese(data.batteryLevel)}パーセント、充電してください`
    });
  }
  
  // 如果没有警告，返回正常状态
  if (reports.length === 0) {
    return {
      text: `System operating normally, all parameters within acceptable range`,
      jp: `システム正常稼働中、全パラメータ正常範囲内`
    };
  }
  
  // 随机选择一条报告
  return reports[Math.floor(Math.random() * reports.length)];
};

export const useAudioSystem = () => {
  const [state, setState] = useState<AudioSystemState>({
    bgmEnabled: false,
    voiceEnabled: false,
    bgmVolume: 0.3,
    voiceVolume: 1.0,
  });
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const lastReportTimeRef = useRef(0);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // 初始化音频
  useEffect(() => {
    // 检查浏览器支持
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    // 创建背景音乐音频元素（用户需要自行添加音频文件）
    const audio = new Audio();
    audio.loop = true;
    audio.volume = state.bgmVolume;
    bgmRef.current = audio;
    
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);
  
  // 设置背景音乐文件
  const setBGM = useCallback((src: string) => {
    if (bgmRef.current) {
      bgmRef.current.src = src;
      if (state.bgmEnabled) {
        bgmRef.current.play().catch(console.error);
      }
    }
  }, [state.bgmEnabled]);
  
  // 切换背景音乐开关
  const toggleBGM = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.bgmEnabled;
      if (bgmRef.current) {
        if (newEnabled && bgmRef.current.src) {
          bgmRef.current.play().catch(console.error);
        } else {
          bgmRef.current.pause();
        }
      }
      return { ...prev, bgmEnabled: newEnabled };
    });
  }, []);
  
  // 切换语音播报开关
  const toggleVoice = useCallback(() => {
    setState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
  }, []);
  
  // 设置音量
  const setBGMVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, bgmVolume: clampedVolume }));
    if (bgmRef.current) {
      bgmRef.current.volume = clampedVolume;
    }
  }, []);
  
  const setVoiceVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, voiceVolume: clampedVolume }));
  }, []);
  
  // 播报当前状态
  const speakStatus = useCallback((data: SystemData, force: boolean = false) => {
    if (!state.voiceEnabled || !speechSynthesisRef.current) return;
    
    const now = Date.now();
    // 限制播报频率，至少间隔 8 秒
    if (!force && now - lastReportTimeRef.current < 8000) return;
    
    const report = generateStatusReport(data);
    
    // 取消之前的播报
    speechSynthesisRef.current.cancel();
    
    // 创建日语语音
    const utterance = new SpeechSynthesisUtterance(report.jp);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.1;  // 稍快一点，像明日香的风格
    utterance.pitch = 1.2; // 稍高的音调
    utterance.volume = state.voiceVolume;
    
    // 尝试找到日语女声
    const voices = speechSynthesisRef.current.getVoices();
    const japaneseVoice = voices.find(v => v.lang.includes('ja') && v.name.includes('Female'))
      || voices.find(v => v.lang.includes('ja'))
      || voices.find(v => v.name.includes('Google 日本語'));
    
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }
    
    speechSynthesisRef.current.speak(utterance);
    lastReportTimeRef.current = now;
  }, [state.voiceEnabled, state.voiceVolume]);
  
  // 停止播报
  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  }, []);
  
  return {
    ...state,
    setBGM,
    toggleBGM,
    toggleVoice,
    setBGMVolume,
    setVoiceVolume,
    speakStatus,
    stopSpeaking,
  };
};

export default useAudioSystem;
