'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { getVoiceEngine } from '@/lib/voice/engine';
import {
  type SiaState,
  type SiaVisualMode,
  attemptTransition,
  getVisualMode,
} from '@/lib/voice/state-machine';
import {
  getUniqueScript,
  getScenarioIntro,
  getProgressMessage,
  getResultsNarration,
} from '@/lib/voice/scripts';
import type { Locale } from '@/types';

// ── Context Types ─────────────────────────────────────────────────────────

interface SiaContextValue {
  // State
  state: SiaState;
  visualMode: SiaVisualMode;
  caption: string;
  isEnabled: boolean;
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  voicesLoaded: boolean;
  hasInteracted: boolean;
  hasLastSpoken: boolean;
  speechRate: number;

  // Actions
  enable: () => void;
  disable: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  setSpeechRate: (rate: number) => void;

  // Narration triggers
  narrateGreeting: () => void;
  narrateIntroduction: () => void;
  narrateConsent: () => void;
  narrateProfile: () => void;
  narrateScenario: (title: string, description: string, voiceScript?: string) => void;
  narrateAcknowledgement: () => void;
  narrateEncouragement: () => void;
  narrateProgress: (current: number, total: number) => void;
  narrateCompletion: () => void;
  narrateResults: (
    overallScore: number,
    riskLevel: string,
    topStrength: string | null,
    topVulnerability: string | null
  ) => void;
  narrateFarewell: () => void;
  narrateCustom: (text: string) => void;

  // State control
  setState: (state: SiaState) => void;
  resetToIdle: () => void;
  setLocale: (locale: Locale) => void;
}

const SiaContext = createContext<SiaContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────

interface SiaProviderProps {
  children: React.ReactNode;
}

const INTERACT_KEY = 'sia-interacted';
const ENABLED_KEY = 'sia-enabled';
const GREETED_KEY = 'sia-greeted';

export function SiaProvider({ children }: SiaProviderProps) {
  const [state, setSiaState] = useState<SiaState>('idle');
  const [visualMode, setVisualMode] = useState<SiaVisualMode>('breathing');
  const [caption, setCaption] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [speechRate, setSpeechRateState] = useState(0.95);
  const [hasLastSpoken, setHasLastSpoken] = useState(false);
  const [engineState, setEngineState] = useState({
    supported: false,
    speaking: false,
    paused: false,
    muted: false,
    voicesLoaded: false,
  });

  const stateRef = useRef<SiaState>('idle');
  const localeRef = useRef<Locale>('en');
  const captionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGreetedRef = useRef(false);
  const isEnabledRef = useRef(false);
  const hasInteractedRef = useRef(false);

  // ── Initialize from storage ────────────────────────────────────────────

  useEffect(() => {
    try {
      const interacted = sessionStorage.getItem(INTERACT_KEY) === 'true';
      const enabled = localStorage.getItem(ENABLED_KEY) === 'true';
      const greeted = sessionStorage.getItem(GREETED_KEY) === 'true';
      setHasInteracted(interacted);
      hasInteractedRef.current = interacted;
      setIsEnabled(enabled);
      isEnabledRef.current = enabled;
      hasGreetedRef.current = greeted;
      setSpeechRateState(getVoiceEngine().getRate());
      setHasLastSpoken(getVoiceEngine().hasLastSpoken());
    } catch {
      // storage unavailable
    }
  }, []);

  // ── Subscribe to voice engine ──────────────────────────────────────────

  useEffect(() => {
    const engine = getVoiceEngine();
    const unsubscribe = engine.subscribe((next) => {
      setEngineState(next);
      setHasLastSpoken(engine.hasLastSpoken());
      setSpeechRateState(engine.getRate());
    });
    return () => unsubscribe();
  }, []);

  // Keep refs in sync
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    hasInteractedRef.current = hasInteracted;
  }, [hasInteracted]);

  // ── Sync visual mode with state ──────────────────────────────────────────

  useEffect(() => {
    setVisualMode(getVisualMode(state));
  }, [state]);

  // ── Caption management ──────────────────────────────────────────────────

  const showCaption = useCallback((text: string) => {
    setCaption(text);
    if (captionTimeoutRef.current) {
      clearTimeout(captionTimeoutRef.current);
    }
    // Caption stays visible longer than speech for readability
    captionTimeoutRef.current = setTimeout(() => {
      setCaption('');
    }, 12000);
  }, []);

  // ── State transition helper ─────────────────────────────────────────────

  const transitionTo = useCallback((target: SiaState) => {
    const current = stateRef.current;
    const next = attemptTransition(current, target);
    if (next) {
      stateRef.current = next;
      setSiaState(next);
      return true;
    }
    return false;
  }, []);

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
    hasInteractedRef.current = true;
    try {
      sessionStorage.setItem(INTERACT_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const markGreeted = useCallback(() => {
    hasGreetedRef.current = true;
    try {
      sessionStorage.setItem(GREETED_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  // ── Narration helper ────────────────────────────────────────────────────
  // Captions show when enabled; speech only after enable + user gesture.

  const narrate = useCallback(
    (text: string, targetState?: SiaState) => {
      if (targetState) {
        transitionTo(targetState);
      }
      if (isEnabledRef.current) {
        showCaption(text);
      }
      if (
        isEnabledRef.current &&
        hasInteractedRef.current &&
        !engineState.muted
      ) {
        getVoiceEngine().speak(text);
        setHasLastSpoken(true);
      }
    },
    [engineState.muted, transitionTo, showCaption]
  );

  const greetOnce = useCallback(() => {
    if (hasGreetedRef.current) return;
    markGreeted();
    const text = getUniqueScript('greeting');
    transitionTo('greeting');
    showCaption(text);
    if (!engineState.muted) {
      getVoiceEngine().speak(text);
      setHasLastSpoken(true);
    }
  }, [engineState.muted, markGreeted, transitionTo, showCaption]);

  // ── Enable / Disable ────────────────────────────────────────────────────

  const enable = useCallback(() => {
    setIsEnabled(true);
    isEnabledRef.current = true;
    markInteracted();
    try {
      localStorage.setItem(ENABLED_KEY, 'true');
    } catch {
      // ignore
    }
    // Enable is a user gesture — greet once
    greetOnce();
  }, [markInteracted, greetOnce]);

  const disable = useCallback(() => {
    setIsEnabled(false);
    isEnabledRef.current = false;
    getVoiceEngine().cancel();
    try {
      localStorage.setItem(ENABLED_KEY, 'false');
    } catch {
      // ignore
    }
  }, []);

  // ── Mark interaction (for autoplay policy) ──────────────────────────────

  useEffect(() => {
    const handleFirstInteraction = () => {
      markInteracted();
      // If already enabled and not yet greeted this session, greet once
      if (isEnabledRef.current && !hasGreetedRef.current) {
        greetOnce();
      }
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [markInteracted, greetOnce]);

  // ── Narration triggers ──────────────────────────────────────────────────

  const narrateGreeting = useCallback(() => {
    if (hasGreetedRef.current) return;
    markGreeted();
    narrate(getUniqueScript('greeting'), 'greeting');
  }, [narrate, markGreeted]);

  const narrateIntroduction = useCallback(() => {
    const intro = getUniqueScript('platformIntro');
    const anonymity = getUniqueScript('anonymity');
    const assessment = getUniqueScript('assessmentIntro');
    narrate(`${intro} ${anonymity} ${assessment}`, 'introduction');
  }, [narrate]);

  const narrateConsent = useCallback(() => {
    narrate(getUniqueScript('consentPrompt'), 'consent');
  }, [narrate]);

  const narrateProfile = useCallback(() => {
    narrate(getUniqueScript('profileIntro'), 'profile');
  }, [narrate]);

  const narrateScenario = useCallback(
    (title: string, description: string, voiceScript?: string) => {
      const intro = getScenarioIntro(title);
      const fullText = voiceScript
        ? `${intro} ${voiceScript}`
        : `${intro} ${description}`;
      narrate(fullText, 'readingScenario');
    },
    [narrate]
  );

  const narrateAcknowledgement = useCallback(() => {
    narrate(getUniqueScript('acknowledgement'), 'encouragement');
  }, [narrate]);

  const narrateEncouragement = useCallback(() => {
    narrate(getUniqueScript('encouragement'), 'encouragement');
  }, [narrate]);

  const narrateProgress = useCallback(
    (current: number, total: number) => {
      narrate(getProgressMessage(current, total), 'progress');
    },
    [narrate]
  );

  const narrateCompletion = useCallback(() => {
    narrate(getUniqueScript('completion'), 'resultsIntro');
  }, [narrate]);

  const narrateResults = useCallback(
    (
      overallScore: number,
      riskLevel: string,
      topStrength: string | null,
      topVulnerability: string | null
    ) => {
      const text = getResultsNarration(
        overallScore,
        riskLevel,
        topStrength,
        topVulnerability
      );
      narrate(text, 'resultsExplanation');
    },
    [narrate]
  );

  const narrateFarewell = useCallback(() => {
    narrate(getUniqueScript('farewell'), 'farewell');
  }, [narrate]);

  const narrateCustom = useCallback(
    (text: string) => {
      narrate(text);
    },
    [narrate]
  );

  // ── Controls ────────────────────────────────────────────────────────────

  const mute = useCallback(() => getVoiceEngine().mute(), []);
  const unmute = useCallback(() => getVoiceEngine().unmute(), []);
  const toggleMute = useCallback(() => getVoiceEngine().toggleMute(), []);
  const pause = useCallback(() => getVoiceEngine().pause(), []);
  const resume = useCallback(() => getVoiceEngine().resume(), []);
  const replay = useCallback(() => getVoiceEngine().replay(), []);

  const setSpeechRate = useCallback((rate: number) => {
    getVoiceEngine().setRate(rate);
    setSpeechRateState(rate);
  }, []);

  const setSiaStateDirect = useCallback((s: SiaState) => {
    stateRef.current = s;
    setSiaState(s);
  }, []);

  const resetToIdle = useCallback(() => {
    getVoiceEngine().cancel();
    stateRef.current = 'idle';
    setSiaState('idle');
    setCaption('');
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    localeRef.current = locale;
    getVoiceEngine().setLocale(locale);
  }, []);

  // ── Cleanup ─────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (captionTimeoutRef.current) {
        clearTimeout(captionTimeoutRef.current);
      }
    };
  }, []);

  // ── Value ────────────────────────────────────────────────────────────────

  const value = useMemo<SiaContextValue>(
    () => ({
      state,
      visualMode,
      caption,
      isEnabled,
      isSupported: engineState.supported,
      isSpeaking: engineState.speaking,
      isPaused: engineState.paused,
      isMuted: engineState.muted,
      voicesLoaded: engineState.voicesLoaded,
      hasInteracted,
      hasLastSpoken,
      speechRate,
      enable,
      disable,
      mute,
      unmute,
      toggleMute,
      pause,
      resume,
      replay,
      setSpeechRate,
      narrateGreeting,
      narrateIntroduction,
      narrateConsent,
      narrateProfile,
      narrateScenario,
      narrateAcknowledgement,
      narrateEncouragement,
      narrateProgress,
      narrateCompletion,
      narrateResults,
      narrateFarewell,
      narrateCustom,
      setState: setSiaStateDirect,
      resetToIdle,
      setLocale,
    }),
    [
      state,
      visualMode,
      caption,
      isEnabled,
      engineState,
      hasInteracted,
      hasLastSpoken,
      speechRate,
      enable,
      disable,
      mute,
      unmute,
      toggleMute,
      pause,
      resume,
      replay,
      setSpeechRate,
      narrateGreeting,
      narrateIntroduction,
      narrateConsent,
      narrateProfile,
      narrateScenario,
      narrateAcknowledgement,
      narrateEncouragement,
      narrateProgress,
      narrateCompletion,
      narrateResults,
      narrateFarewell,
      narrateCustom,
      setSiaStateDirect,
      resetToIdle,
      setLocale,
    ]
  );

  return <SiaContext.Provider value={value}>{children}</SiaContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSia(): SiaContextValue {
  const context = useContext(SiaContext);
  if (!context) {
    throw new Error('useSia must be used within a SiaProvider');
  }
  return context;
}
