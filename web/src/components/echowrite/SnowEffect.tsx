import { useEffect, useRef } from 'react';

interface SnowEffectProps {
  enabled: boolean;
}

export const SnowEffect = ({ enabled }: SnowEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const snowflakes: HTMLDivElement[] = [];
    const count = 120; // Dense snowflake effect for maximum visibility

    for (let i = 0; i < count; i++) {
      const snowflake = document.createElement('div');
      const size = Math.random() * 6 + 3; // 3-9px (slightly reduced)
      const opacity = Math.random() * 0.4 + 0.5; // 0.5-0.9 (more visible)
      const duration = Math.random() * 16 + 10; // 10-26s (gentle fall)
      const delay = Math.random() * 10;
      const drift = Math.random() * 100 - 50; // More horizontal movement
      const startX = Math.random() * 100;
      
      snowflake.className = 'snowflake-enhanced';
      snowflake.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 1) 0%, hsl(0 0% 100% / 0.95) 40%, hsl(0 0% 100% / 0.6) 100%);
        border: 1px solid hsl(var(--foreground) / 0.08);
        border-radius: 50%;
        left: ${startX}%;
        top: -20px;
        opacity: ${opacity};
        pointer-events: none;
        animation: snowfall-enhanced ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        --drift: ${drift}px;
        box-shadow: 
          0 0 ${size * 3.5}px hsl(0 0% 100% / 0.85),
          0 0 ${size * 1.5}px hsl(0 0% 100% / 0.65),
          0 0 ${size}px hsl(var(--primary) / 0.18),
          inset 0 0 ${size * 0.5}px hsl(0 0% 100% / 0.35);
        filter: blur(${Math.random() * 0.15}px);
      `;
      container.appendChild(snowflake);
      snowflakes.push(snowflake);
    }

    // Add CSS animation if not exists
    if (!document.getElementById('snowfall-enhanced-style')) {
      const style = document.createElement('style');
      style.id = 'snowfall-enhanced-style';
      style.textContent = `
        @keyframes snowfall-enhanced {
          0% {
            transform: translateY(-10px) translateX(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          8% {
            opacity: 0.9;
            transform: translateY(8vh) translateX(calc(var(--drift) * 0.1)) rotate(30deg) scale(1);
          }
          25% {
            transform: translateY(25vh) translateX(calc(var(--drift) * 0.3)) rotate(90deg) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--drift) * 0.5)) rotate(180deg) scale(1);
            opacity: 0.75;
          }
          75% {
            transform: translateY(75vh) translateX(calc(var(--drift) * 0.8)) rotate(270deg) scale(1);
            opacity: 0.6;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(105vh) translateX(var(--drift)) rotate(360deg) scale(0.9);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      snowflakes.forEach(s => s.remove());
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        background: 'transparent',
        zIndex: 20,
      }}
      aria-hidden="true"
    />
  );
};
