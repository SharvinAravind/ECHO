import { cn } from '@/lib/utils';

interface AnimatedMicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  isAnimating?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
};

export const AnimatedMicLogo = ({ 
  size = 'md', 
  showText = false, 
  className = '',
  isAnimating = true
}: AnimatedMicLogoProps) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Animated Microphone */}
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        {/* Pulsing rings when animating */}
        {isAnimating && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-[-4px] rounded-full bg-primary/10 animate-pulse" style={{ animationDuration: '1.5s' }} />
          </>
        )}
        
        {/* Microphone SVG */}
        <svg 
          viewBox="0 0 100 120" 
          className={cn('relative z-10 w-full h-full', isAnimating && 'animate-mic-float')}
        >
          {/* Microphone body gradient */}
          <defs>
            <linearGradient id="micGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(var(--muted-foreground))" />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="micShine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Mic head - main body */}
          <ellipse cx="50" cy="35" rx="25" ry="30" fill="url(#micGradient)" />
          
          {/* Mic grille lines */}
          {[15, 25, 35, 45, 55].map((y, i) => (
            <ellipse 
              key={i} 
              cx="50" 
              cy={y} 
              rx="18" 
              ry="3" 
              fill="hsl(var(--background))" 
              opacity="0.6"
              className={isAnimating ? 'animate-mic-wave' : ''}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
          
          {/* Mic shine highlight */}
          <ellipse cx="38" cy="30" rx="8" ry="15" fill="url(#micShine)" />
          
          {/* Mic stand connector */}
          <rect x="42" y="60" width="16" height="12" rx="3" fill="url(#micGradient)" />
          
          {/* Mic stand */}
          <rect x="46" y="70" width="8" height="25" fill="url(#micGradient)" />
          
          {/* Mic base */}
          <ellipse cx="50" cy="98" rx="20" ry="6" fill="url(#micGradient)" />
          
          {/* Sound waves when animating */}
          {isAnimating && (
            <g className="animate-fade-in-out">
              <path 
                d="M 80 25 Q 90 35 80 45" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                fill="none" 
                className="animate-sound-wave"
                style={{ animationDelay: '0s' }}
              />
              <path 
                d="M 85 20 Q 100 35 85 50" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                fill="none" 
                opacity="0.6"
                className="animate-sound-wave"
                style={{ animationDelay: '0.2s' }}
              />
              <path 
                d="M 20 25 Q 10 35 20 45" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                fill="none" 
                className="animate-sound-wave"
                style={{ animationDelay: '0.1s' }}
              />
              <path 
                d="M 15 20 Q 0 35 15 50" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                fill="none" 
                opacity="0.6"
                className="animate-sound-wave"
                style={{ animationDelay: '0.3s' }}
              />
            </g>
          )}
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-foreground">
            EchoWrite
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your Voice, Refined
          </span>
        </div>
      )}
    </div>
  );
};
