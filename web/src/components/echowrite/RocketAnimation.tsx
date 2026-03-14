import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RocketAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export const RocketAnimation = forwardRef<HTMLDivElement, RocketAnimationProps>(
  ({ className, size = 'md' }, ref) => {
    return (
      <div ref={ref} className={cn('relative', sizeClasses[size], className)}>
        {/* Flame particles */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-accent animate-flame-particle"
              style={{
                animationDelay: `${i * 0.15}s`,
                left: `${40 + (i % 3) * 10}%`,
              }}
            />
          ))}
        </div>

        {/* Rocket SVG */}
        <svg 
          viewBox="0 0 100 120" 
          className="w-full h-full animate-rocket-hover"
        >
          <defs>
            {/* Rocket body gradient - metallic look */}
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8e8e8" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f0f0f0" />
              <stop offset="70%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d0d0d0" />
            </linearGradient>
            
            {/* Nose cone gradient - blue metallic */}
            <linearGradient id="noseCone" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a90d9" />
              <stop offset="50%" stopColor="#6ba3e0" />
              <stop offset="100%" stopColor="#3a7fc9" />
            </linearGradient>
            
            {/* Flame gradient */}
            <linearGradient id="flameGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffcc00" />
              <stop offset="40%" stopColor="#ff9900" />
              <stop offset="100%" stopColor="#ff3300" />
            </linearGradient>
            
            {/* Window gradient */}
            <radialGradient id="windowGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#87ceeb" />
              <stop offset="100%" stopColor="#4a90d9" />
            </radialGradient>
          </defs>
          
          {/* Main rocket body */}
          <path
            d="M 50 5 
               C 35 5 30 25 30 45
               L 30 75
               L 70 75
               L 70 45
               C 70 25 65 5 50 5 Z"
            fill="url(#rocketBody)"
            stroke="#ccc"
            strokeWidth="0.5"
          />
          
          {/* Nose cone */}
          <path
            d="M 50 5 
               C 40 5 35 15 35 25
               L 35 30
               L 65 30
               L 65 25
               C 65 15 60 5 50 5 Z"
            fill="url(#noseCone)"
          />
          
          {/* Window */}
          <circle cx="50" cy="45" r="8" fill="url(#windowGradient)" stroke="#3a7fc9" strokeWidth="2" />
          <circle cx="47" cy="43" r="2" fill="white" opacity="0.6" />
          
          {/* Red stripe */}
          <rect x="35" y="55" width="30" height="5" fill="#dc3545" rx="1" />
          
          {/* Left fin */}
          <path
            d="M 30 60 
               L 15 90
               L 20 90
               L 30 75 Z"
            fill="#dc3545"
            stroke="#b02a37"
            strokeWidth="0.5"
          />
          
          {/* Right fin */}
          <path
            d="M 70 60 
               L 85 90
               L 80 90
               L 70 75 Z"
            fill="#dc3545"
            stroke="#b02a37"
            strokeWidth="0.5"
          />
          
          {/* Bottom engine */}
          <rect x="40" y="75" width="20" height="8" fill="#666" rx="2" />
          
          {/* Flame */}
          <g className="animate-flame-flicker">
            <path
              d="M 42 83 
                 Q 50 110 50 115
                 Q 50 110 58 83 Z"
              fill="url(#flameGradient)"
            />
            <path
              d="M 45 83 
                 Q 50 100 50 105
                 Q 50 100 55 83 Z"
              fill="#ffcc00"
              opacity="0.8"
            />
          </g>
          
          {/* Spark particles */}
          <g className="animate-spark">
            <circle cx="48" cy="95" r="1.5" fill="#ffcc00" />
            <circle cx="52" cy="100" r="1" fill="#ff9900" />
            <circle cx="50" cy="105" r="1.5" fill="#ff6600" />
          </g>
        </svg>
        
        {/* Smoke trail */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-muted-foreground/20 animate-smoke"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }
);

RocketAnimation.displayName = 'RocketAnimation';
