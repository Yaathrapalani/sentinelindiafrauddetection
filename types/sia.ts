export type SIAState =
  | 'IDLE'
  | 'WELCOME'
  | 'INTRODUCTION'
  | 'PROFILE_GUIDANCE'
  | 'SCENARIO_INTRO'
  | 'OBSERVING'
  | 'WAITING'
  | 'ENCOURAGING'
  | 'THINKING'
  | 'PROGRESS_UPDATE'
  | 'ANSWER_ACKNOWLEDGMENT'
  | 'RESULTS_INTRO'
  | 'RESULTS_REVEAL'
  | 'GOODBYE';

export interface SIAMessage {
  id: string;
  text: string;
  state: SIAState;
  timestamp: number;
}

export interface SIAContext {
  currentScenarioIndex: number;
  totalScenarios: number;
  completionPercentage: number;
  timeSpentMs: number;
  estimatedTimeRemainingMs: number;
  ageBracket?: string;
  hasInteracted: boolean;
}

export type SIAVoicePref = {
  muted: boolean;
  rate: number;
  replayAvailable: boolean;
};

export type AgeCohort = 'young' | 'middle' | 'senior';

export interface SIADialogue {
  welcome: string[];
  introduction: string[];
  profileGuidance: string[];
  scenarioIntro: {
    default: string[];
    phishing: string[];
    investment: string[];
    impersonation: string[];
    urgency: string[];
    authority: string[];
    social: string[];
    recovery: string[];
    reporting: string[];
  };
  observing: string[];
  waiting: string[];
  encouraging: string[];
  thinking: string[];
  progressUpdate: {
    quarter: string[];
    halfway: string[];
    threeQuarters: string[];
    finalStretch: string[];
  };
  answerAcknowledgment: string[];
  resultsIntro: string[];
  resultsReveal: string[];
  goodbye: string[];
}

export type AgeAdaptedDialogue = {
  young: SIADialogue;
  middle: SIADialogue;
  senior: SIADialogue;
};
