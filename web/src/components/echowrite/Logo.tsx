import { forwardRef } from 'react';
import vintageMicLogo from '@/assets/vintage-mic-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

// Logo is 2x the size of text - matching reference video animation
const logoSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
  '2xl': 'h-28 w-28',
  '3xl': 'h-36 h-36',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl',
  '3xl': 'text-5xl',
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(({ 
  size = 'lg', 
  showText = false, 
  className = '', 
  animated = true
}, ref) => {
  return (
    <div ref={ref} className={`flex items-center gap-5 ${className}`}>
      {/* Vintage Chrome Microphone Logo - 2x size with bounce animation */}
      <div 
        className={`
          relative ${logoSizeClasses[size]} 
          flex items-center justify-center
          ${animated ? 'logo-bounce hover:scale-110 transition-transform duration-300' : ''}
        `}
      >
        <img 
          src={vintageMicLogo} 
          alt="EchoWrite" 
          className="w-full h-full object-contain drop-shadow-2xl logo-glow-filter"
          fetchPriority="high"
          decoding="async"
        />
        {/* Glow effect behind logo */}
        {animated && (
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 animate-pulse" />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col gap-1">
          {/* Electric sparkle text with sparkle particles - matching reference animation */}
          <div className="relative">
            <span 
              data-text="ECHOWRITE"
              className={`${textSizeClasses[size]} font-black tracking-tight electric-sparkle-text`}
              style={{ fontFamily: "'Orbitron', 'Space Grotesk', sans-serif" }}
            >
              ECHOWRITE
            </span>
            {/* Sparkle particles floating around text */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              <div className="sparkle-particle absolute top-0 left-[15%]" />
              <div className="sparkle-particle absolute top-1 left-[40%]" style={{ animationDelay: '0.2s' }} />
              <div className="sparkle-particle absolute -top-1 left-[65%]" style={{ animationDelay: '0.4s' }} />
              <div className="sparkle-particle absolute top-2 left-[85%]" style={{ animationDelay: '0.6s' }} />
              <div className="sparkle-particle absolute bottom-0 left-[25%]" style={{ animationDelay: '0.8s' }} />
              <div className="sparkle-particle absolute bottom-1 left-[55%]" style={{ animationDelay: '1s' }} />
              <div className="sparkle-particle absolute bottom-0 left-[75%]" style={{ animationDelay: '1.2s' }} />
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground ml-1">
            AI Writing Assistant
          </span>
        </div>
      )}
    </div>
  );
});

Logo.displayName = 'Logo';
