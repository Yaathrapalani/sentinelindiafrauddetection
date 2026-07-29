'use client';

import { create } from 'zustand';
import type { SIAState, SIAMessage, SIAContext } from '@/types/sia';
import type { AgeCohort } from '@/types/sia';
import { getDialogue, getScenarioIntro, pickRandom } from '@/lib/sia/dialogue';
import type { ScenarioCategory } from '@/types';

interface SIAStore {
  state: SIAState;
  messages: SIAMessage[];
  context: SIAContext;
  cohort: AgeCohort;
  lastSpokenId: string | null;
  inactivityTriggered: boolean;
  showLeaveDialog: boolean;

  setContext: (ctx: Partial<SIAContext>) => void;
  setCohort: (cohort: AgeCohort) => void;
  transition: (newState: SIAState, messageText?: string) => void;
  addMessage: (text: string, state: SIAState) => string;
  clearMessages: () => void;
  triggerInactivity: () => void;
  resetInactivity: () => void;
  showLeaveConfirmation: (show: boolean) => void;
  getDialogueForState: (state: SIAState, category?: ScenarioCategory) => string[];
}

let messageCounter = 0;

function createMessage(text: string, state: SIAState): SIAMessage {
  messageCounter += 1;
  return {
    id: `sia-msg-${messageCounter}`,
    text,
    state,
    timestamp: Date.now(),
  };
}

const DEFAULT_CONTEXT: SIAContext = {
  currentScenarioIndex: 0,
  totalScenarios: 12,
  completionPercentage: 0,
  timeSpentMs: 0,
  estimatedTimeRemainingMs: 0,
  hasInteracted: false,
};

export const useSIAStore = create<SIAStore>((set, get) => ({
  state: 'IDLE',
  messages: [],
  context: DEFAULT_CONTEXT,
  cohort: 'middle',
  lastSpokenId: null,
  inactivityTriggered: false,
  showLeaveDialog: false,

  setContext: (ctx) =>
    set((s) => ({ context: { ...s.context, ...ctx } })),

  setCohort: (cohort) => set({ cohort }),

  transition: (newState, messageText) => {
    set({ state: newState });
    if (messageText) {
      const msg = createMessage(messageText, newState);
      set((s) => ({
        messages: [...s.messages, msg],
        lastSpokenId: msg.id,
      }));
    }
  },

  addMessage: (text, state) => {
    const msg = createMessage(text, state);
    set((s) => ({
      messages: [...s.messages, msg],
      lastSpokenId: msg.id,
    }));
    return msg.id;
  },

  clearMessages: () => set({ messages: [], lastSpokenId: null }),

  triggerInactivity: () => set({ inactivityTriggered: true }),
  resetInactivity: () => set({ inactivityTriggered: false }),
  showLeaveConfirmation: (show) => set({ showLeaveDialog: show }),

  getDialogueForState: (state, category) => {
    const { cohort } = get();
    const dialogue = getDialogue(cohort);

    switch (state) {
      case 'WELCOME':
        return dialogue.welcome;
      case 'INTRODUCTION':
        return dialogue.introduction;
      case 'PROFILE_GUIDANCE':
        return dialogue.profileGuidance;
      case 'SCENARIO_INTRO':
        return category
          ? getScenarioIntro(category, cohort)
          : dialogue.scenarioIntro.default;
      case 'OBSERVING':
        return dialogue.observing;
      case 'WAITING':
        return dialogue.waiting;
      case 'ENCOURAGING':
        return dialogue.encouraging;
      case 'THINKING':
        return dialogue.thinking;
      case 'PROGRESS_UPDATE': {
        const pct = get().context.completionPercentage;
        if (pct >= 90) return dialogue.progressUpdate.finalStretch;
        if (pct >= 66) return dialogue.progressUpdate.threeQuarters;
        if (pct >= 45) return dialogue.progressUpdate.halfway;
        return dialogue.progressUpdate.quarter;
      }
      case 'ANSWER_ACKNOWLEDGMENT':
        return dialogue.answerAcknowledgment;
      case 'RESULTS_INTRO':
        return dialogue.resultsIntro;
      case 'RESULTS_REVEAL':
        return dialogue.resultsReveal;
      case 'GOODBYE':
        return dialogue.goodbye;
      default:
        return [];
    }
  },
}));

export function speakDialogue(
  lines: string[],
  speakFn: (text: string) => void,
  delayMs = 600
) {
  lines.forEach((line, i) => {
    setTimeout(() => speakFn(line), i * delayMs);
  });
}

export function pickAcknowledgment(): string {
  return pickRandom([
    'Thank you.',
    'That tells us something useful.',
    'Interesting.',
    "Let's continue.",
  ]);
}
