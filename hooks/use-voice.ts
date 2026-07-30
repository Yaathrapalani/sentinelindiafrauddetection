'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getVoiceEngine, type VoiceEngineState, type VoiceSettings } from '@/lib/voice/engine';
import type { Locale } from '@/types';

interface UseVoiceOptions {
  locale?: Locale;
}

interface UseVoiceReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  voicesLoaded: boolean;
  speak: (text: string, immediate?: boolean) => void;
  enqueue: (text: string) => void;
  stop: () => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  replay: () => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  getSettings: () => VoiceSettings;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { locale = 'en' } = options;
  const [state, setState] = useState<VoiceEngineState>({
    supported: false,
    speaking: false,
    paused: false,
    muted: false,
    voicesLoaded: false,
  });
  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;
    const engine = getVoiceEngine();
    engine.setLocale(locale);
  }, [locale]);

  useEffect(() => {
    const engine = getVoiceEngine();
    const unsubscribe = engine.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  const speak = useCallback((text: string, immediate = true) => {
    getVoiceEngine().speak(text, immediate);
  }, []);

  const enqueue = useCallback((text: string) => {
    getVoiceEngine().enqueue(text);
  }, []);

  const stop = useCallback(() => {
    getVoiceEngine().cancel();
  }, []);

  const cancel = useCallback(() => {
    getVoiceEngine().cancel();
  }, []);

  const pause = useCallback(() => {
    getVoiceEngine().pause();
  }, []);

  const resume = useCallback(() => {
    getVoiceEngine().resume();
  }, []);

  const togglePause = useCallback(() => {
    getVoiceEngine().togglePause();
  }, []);

  const mute = useCallback(() => {
    getVoiceEngine().mute();
  }, []);

  const unmute = useCallback(() => {
    getVoiceEngine().unmute();
  }, []);

  const toggleMute = useCallback(() => {
    getVoiceEngine().toggleMute();
  }, []);

  const replay = useCallback(() => {
    getVoiceEngine().replay();
  }, []);

  const setRate = useCallback((rate: number) => {
    getVoiceEngine().setRate(rate);
  }, []);

  const setPitch = useCallback((pitch: number) => {
    getVoiceEngine().setPitch(pitch);
  }, []);

  const setVolume = useCallback((volume: number) => {
    getVoiceEngine().setVolume(volume);
  }, []);

  const getSettings = useCallback(() => {
    return getVoiceEngine().getSettings();
  }, []);

  return {
    isSupported: state.supported,
    isSpeaking: state.speaking,
    isPaused: state.paused,
    isMuted: state.muted,
    voicesLoaded: state.voicesLoaded,
    speak,
    enqueue,
    stop,
    cancel,
    pause,
    resume,
    togglePause,
    mute,
    unmute,
    toggleMute,
    replay,
    setRate,
    setPitch,
    setVolume,
    getSettings,
  };
}
