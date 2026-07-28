'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Locale } from '@/types';

const STORAGE_KEY = 'sia-voice-prefs';

interface VoicePrefs {
  muted: boolean;
  rate: number;
}

const DEFAULT_PREFS: VoicePrefs = {
  muted: false,
  rate: 0.95,
};

function loadPrefs(): VoicePrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<VoicePrefs>;
    return {
      muted: parsed.muted ?? DEFAULT_PREFS.muted,
      rate: parsed.rate ?? DEFAULT_PREFS.rate,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: VoicePrefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

const LOCALE_TO_LANG: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  te: 'te-IN',
};

interface UseSIAVoiceReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  muted: boolean;
  rate: number;
  speak: (text: string, opts?: { force?: boolean }) => void;
  stop: () => void;
  toggleMute: () => void;
  setRate: (rate: number) => void;
  replay: (text: string) => void;
  hasInteracted: boolean;
  markInteracted: () => void;
}

export function useSIAVoice(locale: Locale = 'en'): UseSIAVoiceReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [prefs, setPrefs] = useState<VoicePrefs>(DEFAULT_PREFS);
  const [hasInteracted, setHasInteracted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const queueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsSupported('speechSynthesis' in window);
    setPrefs(loadPrefs());

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processQueue = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;

    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(next);
    utterance.lang = LOCALE_TO_LANG[locale] || 'en-IN';
    utterance.rate = prefs.rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      speakingRef.current = false;
      processQueue();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      speakingRef.current = false;
      processQueue();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [locale, prefs.rate]);

  const speak = useCallback(
    (text: string, opts?: { force?: boolean }) => {
      if (!isSupported || !text) return;
      if (prefs.muted && !opts?.force) return;
      if (!hasInteracted && !opts?.force) return;

      queueRef.current.push(text);
      processQueue();
    },
    [isSupported, prefs.muted, hasInteracted, processQueue]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setIsSpeaking(false);
  }, [isSupported]);

  const replay = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;
      queueRef.current = [];
      window.speechSynthesis.cancel();
      speakingRef.current = false;
      setIsSpeaking(false);

      queueRef.current.push(text);
      processQueue();
    },
    [isSupported, processQueue]
  );

  const toggleMute = useCallback(() => {
    setPrefs((prev) => {
      const next = { ...prev, muted: !prev.muted };
      savePrefs(next);
      if (next.muted) {
        queueRef.current = [];
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        speakingRef.current = false;
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  const setRate = useCallback((rate: number) => {
    setPrefs((prev) => {
      const next = { ...prev, rate };
      savePrefs(next);
      return next;
    });
  }, []);

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  return {
    isSupported,
    isSpeaking,
    muted: prefs.muted,
    rate: prefs.rate,
    speak,
    stop,
    toggleMute,
    setRate,
    replay,
    hasInteracted,
    markInteracted,
  };
}
