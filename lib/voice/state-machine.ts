/**
 * SIA State Machine
 *
 * Deterministic state transitions for the voice companion.
 * Each state maps to a specific narration action and visual behavior.
 *
 * Flow:
 *   Idle → Greeting → Introduction → Consent → Profile
 *       → ScenarioIntro → ReadingScenario → Listening → Waiting
 *       → Encouragement → Progress → (loop back to ScenarioIntro)
 *       → ResultsIntro → ResultsExplanation → Farewell → Idle
 */

export type SiaState =
  | 'idle'
  | 'greeting'
  | 'introduction'
  | 'consent'
  | 'profile'
  | 'scenarioIntro'
  | 'readingScenario'
  | 'listening'
  | 'waiting'
  | 'encouragement'
  | 'progress'
  | 'resultsIntro'
  | 'resultsExplanation'
  | 'farewell';

export type SiaVisualMode =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'breathing';

export interface StateTransition {
  from: SiaState;
  to: SiaState;
  action?: string;
}

// Deterministic transition table
const TRANSITIONS: Record<SiaState, SiaState[]> = {
  idle: ['greeting'],
  greeting: ['introduction'],
  introduction: ['consent'],
  consent: ['profile'],
  profile: ['scenarioIntro'],
  scenarioIntro: ['readingScenario'],
  readingScenario: ['listening'],
  listening: ['waiting'],
  waiting: ['encouragement', 'progress', 'scenarioIntro', 'resultsIntro'],
  encouragement: ['progress', 'scenarioIntro'],
  progress: ['scenarioIntro', 'resultsIntro'],
  resultsIntro: ['resultsExplanation'],
  resultsExplanation: ['farewell'],
  farewell: ['idle'],
};

// Visual mode per state
const VISUAL_MODES: Record<SiaState, SiaVisualMode> = {
  idle: 'breathing',
  greeting: 'speaking',
  introduction: 'speaking',
  consent: 'speaking',
  profile: 'breathing',
  scenarioIntro: 'speaking',
  readingScenario: 'speaking',
  listening: 'listening',
  waiting: 'listening',
  encouragement: 'speaking',
  progress: 'speaking',
  resultsIntro: 'speaking',
  resultsExplanation: 'speaking',
  farewell: 'speaking',
};

export function getVisualMode(state: SiaState): SiaVisualMode {
  return VISUAL_MODES[state];
}

export function canTransition(from: SiaState, to: SiaState): boolean {
  const allowed = TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function getNextStates(from: SiaState): SiaState[] {
  return TRANSITIONS[from] || [];
}

/**
 * Validate and perform a state transition.
 * Returns the new state if valid, or null if the transition is not allowed.
 */
export function attemptTransition(
  current: SiaState,
  target: SiaState
): SiaState | null {
  if (canTransition(current, target)) {
    return target;
  }
  // Allow idle → any (for recovery / navigation)
  if (current === 'idle' || target === 'idle') {
    return target;
  }
  return null;
}
