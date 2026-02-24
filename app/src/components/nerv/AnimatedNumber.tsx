import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  glowColor?: string;
  intense?: boolean;
  pulseOnHigh?: boolean;
  highThreshold?: number;
}

const AnimatedNumber: FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  duration = 500,
  className = '',
  suffix = '',
  prefix = '',
  glowColor,
  intense = false,
  pulseOnHigh = false,
  highThreshold = 80,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  // Animate number change
  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();
    
    // Trigger flash animation
    if (startValue !== endValue) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 150);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Determine if value is high for pulse effect
  const shouldPulse = pulseOnHigh && value > highThreshold;

  const formatNumber = (num: number): string => {
    if (decimals === 0) {
      return Math.round(num).toString();
    }
    return num.toFixed(decimals);
  };

  const glowClass = intense ? 'glow-text-intense' : 'glow-text';
  const pulseClass = shouldPulse ? 'value-pulse' : '';
  const flashClass = isFlashing ? 'number-flash' : '';

  return (
    <span 
      className={`digital-number ${glowClass} ${pulseClass} ${flashClass} ${className}`}
      style={glowColor ? { color: glowColor } : undefined}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

export default AnimatedNumber;
