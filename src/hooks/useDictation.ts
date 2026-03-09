import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDictationOptions {
  lang: string;
  onInterimResult: (text: string) => void;
  onFinalResult: (text: string) => void;
  onVoiceCommand?: (command: string) => boolean;
}

export const useDictation = ({
  lang,
  onInterimResult,
  onFinalResult,
  onVoiceCommand
}: UseDictationOptions) => {
  const [isDictating, setIsDictating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dictationTime, setDictationTime] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (isDictating && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setDictationTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDictating, isPaused]);

  const processVoiceCommands = useCallback((transcript: string): boolean => {
    if (!onVoiceCommand) return false;
    return onVoiceCommand(transcript.toLowerCase().trim());
  }, [onVoiceCommand]);

  const start = useCallback((silent = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      // Check for voice commands first
      if (finalTranscript && processVoiceCommands(finalTranscript)) {
        return;
      }

      onInterimResult(currentInterim);

      if (finalTranscript) {
        onFinalResult(finalTranscript);
        onInterimResult('');
      }
    };

    recognition.onstart = () => {
      setIsDictating(true);
      setIsPaused(false);
      setDictationTime(0);
      if (!silent) toast.success("Microphone active. Start speaking!");
    };

    recognition.onend = () => {
      // Auto-restart if still dictating and not paused
      if (recognitionRef.current === recognition && !isPaused) {
        try {
          setTimeout(() => {
            if (recognitionRef.current === recognition) {
              recognition.start();
            }
          }, 100);
        } catch (e) {
          // Ignore errors from rapid start/stop
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
        stop();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [lang, isDictating, isPaused, processVoiceCommands, onInterimResult, onFinalResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsDictating(false);
    setIsPaused(false);
    onInterimResult('');
  }, [onInterimResult]);

  const togglePause = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isPaused) {
      recognitionRef.current.start();
      setIsPaused(false);
    } else {
      recognitionRef.current.stop();
      setIsPaused(true);
    }
  }, [isPaused]);

  return {
    isDictating,
    isPaused,
    dictationTime,
    start,
    stop,
    togglePause
  };
};
