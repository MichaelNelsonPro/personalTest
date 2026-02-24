import type { FC } from 'react';
import { Volume2, VolumeX, Music, Mic, Settings } from 'lucide-react';
import { useState } from 'react';

interface AudioControlProps {
  bgmEnabled: boolean;
  voiceEnabled: boolean;
  bgmVolume: number;
  voiceVolume: number;
  onToggleBGM: () => void;
  onToggleVoice: () => void;
  onSetBGMVolume: (volume: number) => void;
  onSetVoiceVolume: (volume: number) => void;
}

const AudioControl: FC<AudioControlProps> = ({
  bgmEnabled,
  voiceEnabled,
  bgmVolume,
  voiceVolume,
  onToggleBGM,
  onToggleVoice,
  onSetBGMVolume,
  onSetVoiceVolume,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 展开的控制面板 */}
      {isExpanded && (
        <div className="mb-2 nerv-panel nerv-panel-cyan p-3 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-wider text-[#00ffff]/80">AUDIO CONTROL</span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-[#00ffff]/60 hover:text-[#00ffff] text-xs"
            >
              ✕
            </button>
          </div>
          
          {/* BGM 控制 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#00ff00]" />
                <span className="text-xs text-[#00ff00]/80">BGM</span>
              </div>
              <button
                onClick={onToggleBGM}
                className={`px-2 py-0.5 text-xs border transition-colors ${
                  bgmEnabled 
                    ? 'bg-[#00ff00]/20 border-[#00ff00] text-[#00ff00]' 
                    : 'bg-transparent border-[#00ffff]/30 text-[#00ffff]/60'
                }`}
              >
                {bgmEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="w-3 h-3 text-[#00ffff]/40" />
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume * 100}
                onChange={(e) => onSetBGMVolume(Number(e.target.value) / 100)}
                className="flex-1 h-1 bg-[#00ffff]/20 appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, #00ff00 ${bgmVolume * 100}%, rgba(0,255,255,0.2) ${bgmVolume * 100}%)`
                }}
              />
              <Volume2 className="w-3 h-3 text-[#00ffff]/40" />
            </div>
          </div>
          
          {/* 语音控制 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#ff8800]" />
                <span className="text-xs text-[#ff8800]/80">VOICE REPORT</span>
              </div>
              <button
                onClick={onToggleVoice}
                className={`px-2 py-0.5 text-xs border transition-colors ${
                  voiceEnabled 
                    ? 'bg-[#ff8800]/20 border-[#ff8800] text-[#ff8800]' 
                    : 'bg-transparent border-[#00ffff]/30 text-[#00ffff]/60'
                }`}
              >
                {voiceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="w-3 h-3 text-[#00ffff]/40" />
              <input
                type="range"
                min="0"
                max="100"
                value={voiceVolume * 100}
                onChange={(e) => onSetVoiceVolume(Number(e.target.value) / 100)}
                className="flex-1 h-1 bg-[#00ffff]/20 appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, #ff8800 ${voiceVolume * 100}%, rgba(0,255,255,0.2) ${voiceVolume * 100}%)`
                }}
              />
              <Volume2 className="w-3 h-3 text-[#00ffff]/40" />
            </div>
          </div>
          
          {/* 说明 */}
          <div className="mt-3 pt-2 border-t border-[#00ffff]/20 text-[9px] text-[#00ffff]/50">
            <p>将 BGM 音频文件放入 public/bgm.mp3</p>
            <p>语音使用浏览器 TTS (日语女声)</p>
          </div>
        </div>
      )}
      
      {/* 展开按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-10 h-10 nerv-panel nerv-corner nerv-panel-cyan flex items-center justify-center hover:bg-[#00ffff]/10 transition-colors"
      >
        <Settings className={`w-5 h-5 text-[#00ffff] ${isExpanded ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default AudioControl;
