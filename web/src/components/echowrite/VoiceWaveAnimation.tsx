import { cn } from '@/lib/utils';

interface VoiceWaveAnimationProps {
  isActive: boolean;
  isPaused?: boolean;
  className?: string;
  barCount?: number;
}

export const VoiceWaveAnimation = ({ 
  isActive, 
  isPaused = false, 
  className = '',
  barCount = 5 
}: VoiceWaveAnimationProps) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className={cn('voice-wave h-10', className)}>
      {bars.map((i) => (
        <div
          key={i}
          className={cn(
            'voice-wave-bar transition-all duration-200',
            isActive && !isPaused 
              ? `animate-voice-wave` 
              : 'h-2'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            opacity: isActive ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

export const MicrophoneAnimation = ({ isRecording }: { isRecording: boolean }) => {
  return (
    <div className="relative">
      {isRecording && (
        <>
          <div className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
          <div className="absolute inset-[-4px] rounded-full border-2 border-destructive/50 animate-pulse" />
        </>
      )}
      <div 
        className={cn(
          'relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
          isRecording 
            ? 'bg-destructive text-destructive-foreground shadow-lg' 
            : 'neu-button'
        )}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>
    </div>
  );
};
