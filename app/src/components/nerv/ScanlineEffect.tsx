import type { FC } from 'react';

interface ScanlineEffectProps {
  enabled?: boolean;
  color?: 'cyan' | 'green' | 'orange' | 'red';
}

const ScanlineEffect: FC<ScanlineEffectProps> = ({ 
  enabled = true,
  color = 'cyan'
}) => {
  if (!enabled) return null;

  const colorMap = {
    cyan: 'rgba(0, 255, 255, 0.3)',
    green: 'rgba(0, 255, 0, 0.3)',
    orange: 'rgba(255, 136, 0, 0.3)',
    red: 'rgba(255, 0, 68, 0.3)',
  };

  const shadowMap = {
    cyan: 'rgba(0, 255, 255, 0.5)',
    green: 'rgba(0, 255, 0, 0.5)',
    orange: 'rgba(255, 136, 0, 0.5)',
    red: 'rgba(255, 0, 68, 0.5)',
  };

  const selectedColor = colorMap[color];
  const selectedShadow = shadowMap[color];

  return (
    <>
      {/* Moving scanline */}
      <div 
        className="fixed left-0 right-0 h-[3px] pointer-events-none z-50"
        style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${selectedColor} 20%, ${selectedColor} 50%, ${selectedColor} 80%, transparent 100%)`,
          boxShadow: `0 0 10px ${selectedShadow}, 0 0 20px ${selectedShadow}`,
          animation: 'scanlineMove 3s linear infinite',
          top: '-4px'
        }}
      />
      
      {/* Static scanline overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)`
        }}
      />
    </>
  );
};

export default ScanlineEffect;
