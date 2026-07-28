'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSIAStore, speakDialogue } from '@/hooks/use-sia-store';
import { useSIAVoice } from '@/hooks/use-sia-voice';
import { getAgeCohort } from '@/lib/sia/dialogue';
import type { SIAState, AgeCohort } from '@/types/sia';
import type { ScenarioCategory, AgeBracket } from '@/types';

interface UseSIAOrchestratorOptions {
  totalScenarios: number;
  ageBracket?: AgeBracket | string;
  locale?: string;
}

export function useSIAOrchestrator({
  totalScenarios,
  ageBracket,
  locale = 'en',
}: UseSIAOrchestratorOptions) {
  const store = useSIAStore();
  const voice = useSIAVoice(locale as any);
  const cohort: AgeCohort = getAgeCohort(ageBracket);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef(false);

  // Set cohort and context once
  useEffect(() => {
    store.setCohort(cohort);
    store.setContext({ totalScenarios });
  }, [cohort, totalScenarios]);

  const speakLines = useCallback(
    (lines: string[]) => {
      speakDialogue(lines, (text) => voice.speak(text), 700);
    },
    [voice]
  );

  // State transitions with dialogue
  const transitionTo = useCallback(
    (newState: SIAState, category?: ScenarioCategory) => {
      store.transition(newState);
      const lines = store.getDialogueForState(newState, category);
      lines.forEach((line, i) => {
        setTimeout(() => {
          store.addMessage(line, newState);
        }, i * 700);
      });
      speakLines(lines);
    },
    [store, speakLines]
  );

  // Start SIA — triggered after first user interaction
  const startSIA = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    voice.markInteracted();
    store.setContext({ hasInteracted: true });
    transitionTo('WELCOME');
    setTimeout(() => transitionTo('INTRODUCTION'), 3500);
  }, [voice, store, transitionTo]);

  // Profile phase
  const guideToProfile = useCallback(() => {
    transitionTo('PROFILE_GUIDANCE');
  }, [transitionTo]);

  // Scenario intro
  const introduceScenario = useCallback(
    (index: number, category: ScenarioCategory) => {
      const pct = Math.round((index / totalScenarios) * 100);
      store.setContext({
        currentScenarioIndex: index,
        completionPercentage: pct,
      });
      store.resetInactivity();
      transitionTo('SCENARIO_INTRO', category);
    },
    [store, totalScenarios, transitionTo]
  );

  // Start observing (scenario is showing)
  const startObserving = useCallback(() => {
    store.transition('OBSERVING');

    // Inactivity timer — 25 seconds, fires once per scenario
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      if (!store.inactivityTriggered) {
        store.triggerInactivity();
        const lines = store.getDialogueForState('WAITING');
        if (lines.length > 0) {
          const line = lines[0];
          store.addMessage(line, 'WAITING');
          voice.speak(line);
        }
      }
    }, 25000);
  }, [store, voice]);

  // After user answers
  const acknowledgeAnswer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    const lines = store.getDialogueForState('ANSWER_ACKNOWLEDGMENT');
    const line = lines[Math.floor(Math.random() * lines.length)];
    store.addMessage(line, 'ANSWER_ACKNOWLEDGMENT');
    voice.speak(line);
  }, [store, voice]);

  // Progress update
  const updateProgress = useCallback(
    (index: number) => {
      const pct = Math.round((index / totalScenarios) * 100);
      store.setContext({ completionPercentage: pct });

      if (pct === 50 || pct === 75 || pct === 90) {
        setTimeout(() => transitionTo('PROGRESS_UPDATE'), 1200);
      }
    },
    [store, totalScenarios, transitionTo]
  );

  // Results intro
  const introduceResults = useCallback(() => {
    transitionTo('RESULTS_INTRO');
  }, [transitionTo]);

  // Reveal next result card
  const revealNextResult = useCallback(
    (step: number) => {
      const lines = store.getDialogueForState('RESULTS_REVEAL');
      if (step < lines.length) {
        store.addMessage(lines[step], 'RESULTS_REVEAL');
        voice.speak(lines[step]);
      }
    },
    [store, voice]
  );

  // Goodbye
  const sayGoodbye = useCallback(() => {
    transitionTo('GOODBYE');
  }, [transitionTo]);

  // Leave page handler
  const handleLeaveAttempt = useCallback(() => {
    if (store.context.completionPercentage > 0 && store.context.completionPercentage < 100) {
      store.showLeaveConfirmation(true);
      return true; // intercepted
    }
    return false;
  }, [store]);

  const continueAssessment = useCallback(() => {
    store.showLeaveConfirmation(false);
  }, [store]);

  const leaveAnyway = useCallback(() => {
    store.showLeaveConfirmation(false);
    voice.stop();
  }, [store, voice]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  return {
    state: store.state,
    messages: store.messages,
    context: store.context,
    startSIA,
    guideToProfile,
    introduceScenario,
    startObserving,
    acknowledgeAnswer,
    updateProgress,
    introduceResults,
    revealNextResult,
    sayGoodbye,
    handleLeaveAttempt,
    continueAssessment,
    leaveAnyway,
    voice,
  };
}
