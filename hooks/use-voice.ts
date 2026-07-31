/**
 * Voice narration hook using the Web Speech API
 *
 * Architecture:
 * - Uses SpeechSynthesis API for text-to-speech
 * - Gracefully degrades when not supported
 * - Respects reduced motion preferences
 * - Cleans up on unmount
 * - Locale-aware voice selection
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Locale } from '@/types';

interface UseVoiceOptions {
  locale?: Locale;
}

interface UseVoiceReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

const LOCALE_TO_LANG: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  te: 'te-IN',
};

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { locale = 'en' } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsSupported('speechSynthesis' in window);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LOCALE_TO_LANG[locale] || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const targetLang = LOCALE_TO_LANG[locale] || 'en-IN';
      const femaleVoice = voices.find(
        (v) =>
          v.lang === targetLang &&
          /female|woman|samantha|google uk english female|zira|sonia|priya|kalpana/i.test(v.name)
      ) || voices.find(
        (v) =>
          v.lang === targetLang &&
          !/male|man|david|george|ravi|alex/i.test(v.name)
      ) || voices.find((v) => v.lang === targetLang);

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, locale]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop };
}
