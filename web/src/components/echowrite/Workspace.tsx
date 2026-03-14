import { useState, useRef } from 'react';
import { Mic, Trash2, Edit3, Square, Pause, Play } from 'lucide-react';
import { VoiceWaveAnimation } from './VoiceWaveAnimation';
import { LiveDictationBar } from './LiveDictationBar';
import { cn } from '@/lib/utils';

interface WorkspaceProps {
  text: string;
  onTextChange: (text: string) => void;
  onClear: () => void;
  onEnterPress: () => void;
  interimText: string;
  isDictating: boolean;
  isDictationPaused: boolean;
  dictationTime: number;
  onStartDictation: () => void;
  onStopDictation: () => void;
  onTogglePause: () => void;
  permissionState?: 'prompt' | 'granted' | 'denied';
  isSupported?: boolean;
}

export const Workspace = ({
  text,
  onTextChange,
  onClear,
  onEnterPress,
  interimText,
  isDictating,
  isDictationPaused,
  dictationTime,
  onStartDictation,
  onStopDictation,
  onTogglePause,
  permissionState = 'prompt',
  isSupported = true
}: WorkspaceProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="flex-1 neu-flat rounded-2xl sm:rounded-3xl flex flex-col relative min-h-[400px] sm:min-h-[500px] overflow-hidden">
      {/* Header - Mobile optimized with proper wrapping */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-border/30">
        {/* Mobile: Two-row layout for workspace controls */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Row 1: Title + Recording indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg neu-convex flex items-center justify-center">
                <Edit3 className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Workspace
              </h3>
            </div>
            
            {isDictating && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-xl neu-pressed">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isDictationPaused 
                    ? 'bg-accent' 
                    : 'bg-destructive animate-pulse'
                )} />
                <span className="text-[9px] font-bold uppercase">
                  {isDictationPaused ? 'Paused' : 'REC'}
                </span>
                <span className="text-[9px] font-mono font-bold text-primary">
                  {formatTime(dictationTime)}
                </span>
              </div>
            )}
          </div>
          
          {/* Row 2: Action buttons - Always visible */}
          <div className="flex items-center justify-between gap-2">
            {isDictating ? (
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={onTogglePause}
                  className="neu-button flex items-center gap-1.5 px-3 py-2 rounded-lg text-accent flex-1"
                >
                  {isDictationPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span className="text-[9px] font-bold uppercase">
                    {isDictationPaused ? 'Resume' : 'Pause'}
                  </span>
                </button>
                <button
                  onClick={onStopDictation}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive text-destructive-foreground shadow-lg flex-1"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase">Stop</span>
                </button>
              </div>
              ) : (
              <button
                onClick={onStartDictation}
                disabled={!isSupported || permissionState === 'denied'}
                className={cn(
                  "neu-button flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors",
                  !isSupported || permissionState === 'denied' 
                    ? "opacity-50 cursor-not-allowed text-muted-foreground" 
                    : "text-foreground hover:text-primary"
                )}
                title={!isSupported ? "Speech recognition not supported" : permissionState === 'denied' ? "Microphone access denied. Check browser settings." : "Start dictation"}
              >
                <Mic className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase">
                  {!isSupported ? "N/A" : permissionState === 'denied' ? "Blocked" : "Dictate"}
                </span>
              </button>
            )}
            <button
              onClick={onClear}
              className="neu-button p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
              title="Clear workspace"
              aria-label="Clear workspace"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase">Clear</span>
            </button>
          </div>
        </div>

        {/* Tablet/Desktop: Single row layout */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Workspace
              </h3>
            </div>
            
            {isDictating && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl neu-pressed">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isDictationPaused 
                    ? 'bg-accent' 
                    : 'bg-destructive animate-pulse'
                )} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isDictationPaused ? 'Paused' : 'Recording'}
                </span>
                <span className="text-xs font-mono font-bold text-primary">
                  {formatTime(dictationTime)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDictating ? (
              <>
                <button
                  onClick={onTogglePause}
                  className="neu-button flex items-center gap-2 px-4 py-2 rounded-xl text-accent"
                >
                  {isDictationPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span className="text-[10px] font-bold uppercase">
                    {isDictationPaused ? 'Resume' : 'Pause'}
                  </span>
                </button>
                <button
                  onClick={onStopDictation}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl transition-all"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Stop</span>
                </button>
              </>
            ) : (
              <button
                onClick={onStartDictation}
                disabled={!isSupported || permissionState === 'denied'}
                className={cn(
                  "neu-button flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors",
                  !isSupported || permissionState === 'denied' 
                    ? "opacity-50 cursor-not-allowed text-muted-foreground" 
                    : "text-foreground hover:text-primary"
                )}
                title={!isSupported ? "Speech recognition not supported" : permissionState === 'denied' ? "Microphone access denied. Check browser settings." : "Start dictation"}
              >
                <Mic className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {!isSupported ? "N/A" : permissionState === 'denied' ? "Blocked" : "Dictate"}
                </span>
              </button>
            )}
            <button
              onClick={onClear}
              className="neu-button px-4 py-2.5 rounded-xl text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
              title="Clear workspace"
              aria-label="Clear workspace"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Wave Animation */}
      {isDictating && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-center border-b border-border/20">
          <VoiceWaveAnimation 
            isActive={isDictating} 
            isPaused={isDictationPaused}
            barCount={7}
          />
        </div>
      )}

      {/* Textarea */}
      <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing or use dictation... (Press Enter to generate)"
          className="w-full flex-1 resize-none bg-transparent focus:outline-none text-sm sm:text-xl text-foreground leading-relaxed placeholder:text-muted-foreground/40 font-normal"
        />
        
        {/* Interim (live) dictation text with gradient */}
        {interimText && (
          <p className="text-base sm:text-xl leading-relaxed mt-3 sm:mt-4 font-normal animate-pulse dictation-interim">
            {interimText}
          </p>
        )}
      </div>

      {/* Live Dictation Bar - Bottom of workspace */}
      {isDictating && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border/30">
          <LiveDictationBar
            isActive={isDictating}
            isPaused={isDictationPaused}
            dictationTime={dictationTime}
            interimText={interimText}
            onTogglePause={onTogglePause}
            onStop={onStopDictation}
            barCount={12}
            barStyle="classic"
          />
        </div>
      )}

      {/* Character count footer */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-border/20 flex justify-between items-center">
        <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {text.length} chars • {text.split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[9px] sm:text-[10px]">Enter</kbd> to generate
        </span>
      </div>
    </div>
  );
};
