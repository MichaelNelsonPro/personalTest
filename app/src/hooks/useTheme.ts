import { useState, useEffect } from 'react';

export type ThemeType = 'nerv' | 'section9' | 'neotokyo';

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    accent: string;
    background: string;
    text: string;
  };
  gradients: {
    glow: string;
    panel: string;
    border: string;
  };
  scanlineColor: string;
  fontFamily: string;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  nerv: {
    name: 'NERV',
    colors: {
      primary: '#00ff00',
      secondary: '#ff8800',
      danger: '#ff0044',
      accent: '#00ffff',
      background: '#0a0a0a',
      text: '#00ff00',
    },
    gradients: {
      glow: 'linear-gradient(90deg, #00ffff, #00ff00, #ff8800)',
      panel: 'linear-gradient(180deg, rgba(0,255,0,0.1), rgba(0,255,0,0.05))',
      border: 'linear-gradient(90deg, #00ffff, #00ff00, #ff8800)',
    },
    scanlineColor: 'rgba(0, 255, 255, 0.3)',
    fontFamily: "'Share Tech Mono', 'Noto Sans JP', monospace",
  },
  section9: {
    name: 'Section 9',
    colors: {
      primary: '#0088ff',
      secondary: '#8800ff',
      danger: '#ff0044',
      accent: '#00ffff',
      background: '#0a0a12',
      text: '#0088ff',
    },
    gradients: {
      glow: 'linear-gradient(90deg, #0088ff, #8800ff, #00ffff)',
      panel: 'linear-gradient(180deg, rgba(0,136,255,0.1), rgba(136,0,255,0.05))',
      border: 'linear-gradient(90deg, #0088ff, #8800ff, #00ffff)',
    },
    scanlineColor: 'rgba(0, 136, 255, 0.3)',
    fontFamily: "'Share Tech Mono', 'Noto Sans JP', monospace",
  },
  neotokyo: {
    name: 'Neo-Tokyo',
    colors: {
      primary: '#ff0044',
      secondary: '#ffcc00',
      danger: '#ff0000',
      accent: '#ff6600',
      background: '#0d0000',
      text: '#ff0044',
    },
    gradients: {
      glow: 'linear-gradient(90deg, #ff0044, #ffcc00, #ff6600)',
      panel: 'linear-gradient(180deg, rgba(255,0,68,0.1), rgba(255,204,0,0.05))',
      border: 'linear-gradient(90deg, #ff0044, #ffcc00, #ff6600)',
    },
    scanlineColor: 'rgba(255, 0, 68, 0.3)',
    fontFamily: "'Share Tech Mono', 'Noto Sans JP', monospace",
  },
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    // 从 localStorage 读取保存的主题
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerv-theme') as ThemeType;
      return saved && themes[saved] ? saved : 'nerv';
    }
    return 'nerv';
  });

  const theme = themes[currentTheme];

  useEffect(() => {
    // 保存主题到 localStorage
    localStorage.setItem('nerv-theme', currentTheme);
    
    // 应用主题 CSS 变量
    const root = document.documentElement;
    root.style.setProperty('--nerv-primary', theme.colors.primary);
    root.style.setProperty('--nerv-secondary', theme.colors.secondary);
    root.style.setProperty('--nerv-danger', theme.colors.danger);
    root.style.setProperty('--nerv-accent', theme.colors.accent);
    root.style.setProperty('--nerv-background', theme.colors.background);
    root.style.setProperty('--nerv-text', theme.colors.text);
    
    // 应用背景色
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    document.body.style.fontFamily = theme.fontFamily;
  }, [currentTheme, theme]);

  const setTheme = (themeType: ThemeType) => {
    if (themes[themeType]) {
      setCurrentTheme(themeType);
    }
  };

  return {
    currentTheme,
    theme,
    setTheme,
    themes,
  };
};

export default useTheme;
