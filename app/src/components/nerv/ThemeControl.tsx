import type { FC } from 'react';
import { Palette } from 'lucide-react';
import { useTheme, themes, type ThemeType } from '@/hooks/useTheme';

interface ThemeControlProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const ThemeControl: FC<ThemeControlProps> = ({ isExpanded, onToggle }) => {
  const { currentTheme, setTheme } = useTheme();

  const themeColors: Record<ThemeType, { primary: string; secondary: string }> = {
    nerv: { primary: '#00ff00', secondary: '#00ffff' },
    section9: { primary: '#0088ff', secondary: '#8800ff' },
    neotokyo: { primary: '#ff0044', secondary: '#ffcc00' },
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* 展开的主题面板 */}
      {isExpanded && (
        <div className="mb-2 nerv-panel nerv-panel-cyan p-3 w-56 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ background: 'rgba(10, 15, 15, 0.95)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-wider text-[#00ffff]/80">THEME SELECT</span>
            <button 
              onClick={onToggle}
              className="text-[#00ffff]/60 hover:text-[#00ffff] text-xs"
            >
              ✕
            </button>
          </div>
          
          {/* 主题选项 */}
          <div className="space-y-2">
            {(Object.keys(themes) as ThemeType[]).map((themeKey) => {
              const theme = themes[themeKey];
              const colors = themeColors[themeKey];
              const isActive = currentTheme === themeKey;
              
              return (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  className={`w-full p-2 border transition-all duration-200 flex items-center gap-3 ${
                    isActive 
                      ? 'bg-opacity-20' 
                      : 'bg-transparent hover:bg-opacity-10'
                  }`}
                  style={{
                    borderColor: isActive ? colors.primary : `${colors.primary}40`,
                    backgroundColor: isActive ? `${colors.primary}20` : 'transparent',
                  }}
                >
                  {/* 颜色预览 */}
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: colors.secondary }}
                    />
                  </div>
                  
                  {/* 主题名称 */}
                  <span 
                    className="text-xs font-bold tracking-wider flex-1 text-left"
                    style={{ color: isActive ? colors.primary : `${colors.primary}cc` }}
                  >
                    {theme.name}
                  </span>
                  
                  {/* 选中指示 */}
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: colors.primary,
                        boxShadow: `0 0 10px ${colors.primary}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 主题描述 */}
          <div className="mt-3 pt-2 border-t border-[#00ffff]/20">
            <p className="text-[9px] text-[#00ffff]/50 leading-relaxed">
              {currentTheme === 'nerv' && 'EVA NERV 总部终端风格 - 经典绿/橙配色'}
              {currentTheme === 'section9' && '攻壳机动队 公安九课终端 - 蓝/紫配色'}
              {currentTheme === 'neotokyo' && '阿基拉 AKIRA 新东京风格 - 红/黄配色'}
            </p>
          </div>
        </div>
      )}
      
      {/* 主题按钮 */}
      <button
        onClick={onToggle}
        className="w-10 h-10 nerv-panel nerv-corner nerv-panel-cyan flex items-center justify-center hover:bg-[#00ffff]/10 transition-colors"
        style={{
          background: 'rgba(10, 15, 15, 0.95)',
        }}
      >
        <Palette 
          className="w-5 h-5 transition-transform duration-300"
          style={{ 
            color: currentTheme === 'nerv' ? '#00ffff' : 
                   currentTheme === 'section9' ? '#0088ff' : '#ff0044',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
    </div>
  );
};

export default ThemeControl;
