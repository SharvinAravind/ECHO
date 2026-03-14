import { cn } from '@/lib/utils';
import { Mic, Pause, Play, Square } from 'lucide-react';

interface LiveDictationBarProps {
  isActive: boolean;
  isPaused: boolean;
  dictationTime: number;
  interimText: string;
  onTogglePause: () => void;
  onStop: () => void;
  barCount?: number;
  barStyle?: 'classic' | 'rounded' | 'dots' | 'blocks';
}

export const LiveDictationBar = ({ 
  isActive, 
  isPaused, 
  dictationTime,
  interimText,
  onTogglePause,
  onStop,
  barCount = 12,
  barStyle = 'classic'
}: LiveDictationBarProps) => {
  if (!isActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const bars = Array.from({ length: barCount }, (_, i) => i);

  const getBarClassName = () => {
    switch (barStyle) {
      case 'rounded':
        return 'w-2 rounded-full';
      case 'dots':
        return 'w-3 h-3 rounded-full';
      case 'blocks':
        return 'w-3 rounded-sm';
      default:
        return 'w-1.5 rounded-full';
    }
  };

  return (
    <div className="w-full neu-pressed rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Recording indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={cn(
            'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full',
            isPaused 
              ? 'bg-accent' 
              : 'bg-destructive animate-pulse'
          )} />
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
            {isPaused ? 'Paused' : 'Live'}
          </span>
        </div>

        {/* Waveform visualization */}
        <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 h-8 sm:h-10">
          {bars.map((i) => (
            <div
              key={i}
              className={cn(
                'bg-primary transition-all duration-150',
                getBarClassName(),
                barStyle !== 'dots' && 'min-h-[4px]'
              )}
              style={{
                height: isActive && !isPaused 
                  ? `${Math.random() * 100}%` 
                  : barStyle === 'dots' ? '12px' : '4px',
                opacity: isActive && !isPaused ? 0.7 + Math.random() * 0.3 : 0.3,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <span className="text-xs sm:text-sm font-mono font-bold text-primary min-w-[40px] sm:min-w-[50px]">
          {formatTime(dictationTime)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onTogglePause}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl neu-button text-accent hover:text-primary transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={onStop}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
          >
            <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Live transcript preview */}
      {interimText && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Live Transcript
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/80 italic animate-pulse line-clamp-2">
            {interimText}
          </p>
        </div>
      )}
    </div>
  );
};
