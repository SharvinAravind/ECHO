import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDictationOptions {
  lang: string;
  onInterimResult: (text: string) => void;
  onFinalResult: (text: string) => void;
  onVoiceCommand?: (command: string) => boolean;
}

const isMobile = () => {
  return typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const useDictation = ({
  lang,
  onInterimResult,
  onFinalResult,
  onVoiceCommand
}: UseDictationOptions) => {
  const [isDictating, setIsDictating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dictationTime, setDictationTime] = useState(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const lastFinalTranscriptRef = useRef<string>('');
  const finalResultsProcessedRef = useRef<Set<number>>(new Set());
  const sessionIdRef = useRef<number>(0);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((result: PermissionStatus) => {
          setPermissionState(result.state);
          result.onchange = () => {
            setPermissionState(result.state);
          };
        })
        .catch(() => {});
    }
  }, []);

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

  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    if (permissionState === 'denied') {
      return false;
    }

    if (permissionState === 'granted') {
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        toast.error("Microphone access denied. Please allow microphone access in your browser or device settings, then try again.");
      } else if (err.name === 'NotFoundError') {
        toast.error("No microphone found. Please connect a microphone and try again.");
      } else {
        toast.error("Could not access microphone. Please check your device settings.");
      }
      return false;
    }
  }, [permissionState]);

  const start = useCallback(async (silent = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setIsSupported(false);
      return;
    }

    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    sessionIdRef.current += 1;
    const currentSessionId = sessionIdRef.current;
    finalResultsProcessedRef.current.clear();
    lastFinalTranscriptRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    if (isMobile()) {
      recognition.continuous = false;
      recognition.interimResults = true;
    }

    recognition.onresult = (event: any) => {
      if (sessionIdRef.current !== currentSessionId) return;

      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        
        if (result.isFinal) {
          if (transcript && !finalResultsProcessedRef.current.has(i)) {
            finalResultsProcessedRef.current.add(i);
            finalTranscript = transcript;
            lastFinalTranscriptRef.current = transcript;
          }
        } else {
          currentInterim += transcript;
        }
      }

      if (finalTranscript && processVoiceCommands(finalTranscript)) {
        return;
      }

      onInterimResult(currentInterim.trim());

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
      if (sessionIdRef.current === currentSessionId && isDictating) {
        if (isMobile() && !isPaused) {
          try {
            recognition.start();
          } catch (e) {}
        } else {
          setIsDictating(false);
          setIsPaused(false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setPermissionState('denied');
        toast.error("Microphone access denied. Please allow microphone access in your browser or device settings.");
        stop();
      } else if (event.error === 'no-speech') {
        // No speech detected, keep listening
      } else if (event.error === 'network') {
        toast.error("Network error. Please check your internet connection.");
      } else if (event.error === 'aborted') {
        // User stopped, do nothing
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      if (err.message?.includes('already started')) {
        try {
          recognition.stop();
          setTimeout(() => recognition.start(), 100);
        } catch (e) {}
      }
    }
  }, [lang, isDictating, isPaused, processVoiceCommands, onInterimResult, onFinalResult, checkMicrophonePermission]);

  const stop = useCallback(() => {
    sessionIdRef.current += 1;
    finalResultsProcessedRef.current.clear();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsDictating(false);
    setIsPaused(false);
    lastFinalTranscriptRef.current = '';
    onInterimResult('');
  }, [onInterimResult]);

  const togglePause = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isPaused) {
      try {
        recognitionRef.current.start();
        setIsPaused(false);
      } catch (e) {}
    } else {
      try {
        recognitionRef.current.stop();
        setIsPaused(true);
      } catch (e) {}
    }
  }, [isPaused]);

  return {
    isDictating,
    isPaused,
    dictationTime,
    permissionState,
    isSupported,
    start,
    stop,
    togglePause
  };
};
