/**
 * Adaptive Assessment Engine — Architecture
 *
 * Selects assessment scenarios based on participant profile while
 * preserving a shared core set for cross-participant comparability.
 *
 * Architecture:
 *
 * 1. CoreScenarioSelector — selects the mandatory shared core scenarios
 *    (same for all participants → enables analytics comparability)
 *
 * 2. AdaptiveScenarioSelector — selects adaptive scenarios based on:
 *    - age bracket (younger → more social/investment; older → more authority/urgency)
 *    - occupation (students → social; retired → authority/recovery)
 *    - digital habits (low → simpler; high → advanced AI/deepfake)
 *    - previous scam experience (victim → recovery/reporting focus)
 *
 * 3. DifficultyAdjuster — adjusts difficulty based on digital habit level
 *
 * 4. AssessmentBuilder — combines core + adaptive into final scenario list
 *
 * Selection rules:
 * - Core scenarios are ALWAYS included (8 scenarios)
 * - Adaptive scenarios supplement the core (4 scenarios)
 * - Total: 12 scenarios per assessment
 * - Adaptive scenarios are drawn from a pool, never duplicating core
 * - Selection is deterministic given the same profile (reproducible research)
 */

import type {
  Scenario,
  ScenarioCategory,
  AgeBracket,
  Occupation,
  DigitalHabitLevel,
  ScamExperience,
} from '@/types';
import { ASSESSMENT_CONFIG } from '@/constants';

export interface AdaptiveProfile {
  ageBracket: AgeBracket;
  occupation: Occupation;
  digitalHabitLevel: DigitalHabitLevel;
  scamExperience: ScamExperience;
}

export interface ScenarioSelectionResult {
  coreScenarios: Scenario[];
  adaptiveScenarios: Scenario[];
  allScenarios: Scenario[];
  adaptiveCategories: ScenarioCategory[];
}

/**
 * Determine which adaptive categories to prioritize based on profile
 */
export function getAdaptiveCategories(profile: AdaptiveProfile): ScenarioCategory[] {
  const categories: ScenarioCategory[] = [];

  // Age-based prioritization
  switch (profile.ageBracket) {
    case '18-25':
      categories.push('social', 'investment');
      break;
    case '26-35':
      categories.push('investment', 'social');
      break;
    case '36-50':
      categories.push('investment', 'authority');
      break;
    case '51-65':
      categories.push('authority', 'urgency');
      break;
    case '65+':
      categories.push('authority', 'recovery');
      break;
  }

  // Occupation-based prioritization
  switch (profile.occupation) {
    case 'student':
      categories.push('social');
      break;
    case 'retired':
      categories.push('recovery', 'authority');
      break;
    case 'business':
      categories.push('investment', 'impersonation');
      break;
    case 'government':
      categories.push('authority');
      break;
  }

  // Digital habit-based prioritization
  if (profile.digitalHabitLevel === 'high') {
    categories.push('phishing', 'investment');
  } else if (profile.digitalHabitLevel === 'low') {
    categories.push('recovery', 'reporting');
  }

  // Scam experience-based prioritization
  if (profile.scamExperience === 'victim') {
    categories.push('recovery', 'reporting');
  } else if (profile.scamExperience === 'attempted') {
    categories.push('reporting');
  }

  // Deduplicate, preserving order
  return Array.from(new Set(categories));
}

/**
 * Select adaptive scenarios from the available pool
 * Excludes scenarios already in the core set
 */
export function selectAdaptiveScenarios(
  allScenarios: Scenario[],
  coreScenarios: Scenario[],
  profile: AdaptiveProfile
): Scenario[] {
  const coreIds = new Set(coreScenarios.map((s) => s.id));
  const adaptiveCategories = getAdaptiveCategories(profile);

  // Build pool of non-core scenarios, prioritized by adaptive categories
  const pool = allScenarios.filter((s) => !coreIds.has(s.id));

  const selected: Scenario[] = [];
  const usedIds = new Set<string>();

  // First pass: select by adaptive category priority
  for (const category of adaptiveCategories) {
    const candidates = pool
      .filter((s) => s.category === category && !usedIds.has(s.id))
      .sort((a, b) => b.difficulty - a.difficulty);

    if (candidates.length > 0 && selected.length < ASSESSMENT_CONFIG.ADAPTIVE_SCENARIO_COUNT) {
      selected.push(candidates[0]);
      usedIds.add(candidates[0].id);
    }
  }

  // Second pass: fill remaining slots with any unused non-core scenarios
  if (selected.length < ASSESSMENT_CONFIG.ADAPTIVE_SCENARIO_COUNT) {
    for (const scenario of pool) {
      if (usedIds.has(scenario.id)) continue;
      selected.push(scenario);
      usedIds.add(scenario.id);
      if (selected.length >= ASSESSMENT_CONFIG.ADAPTIVE_SCENARIO_COUNT) break;
    }
  }

  return selected;
}

/**
 * Build the complete assessment scenario list
 */
export function buildAssessment(
  allScenarios: Scenario[],
  profile: AdaptiveProfile
): ScenarioSelectionResult {
  const coreScenarios = allScenarios
    .filter((s) => s.isCore)
    .sort((a, b) => a.difficulty - b.difficulty);

  const adaptiveScenarios = selectAdaptiveScenarios(
    allScenarios,
    coreScenarios,
    profile
  );

  const all = [...coreScenarios, ...adaptiveScenarios];
  const adaptiveCategories = [...new Set(adaptiveScenarios.map((s) => s.category))];

  return {
    coreScenarios,
    adaptiveScenarios,
    allScenarios: all,
    adaptiveCategories,
  };
}

/**
 * Get difficulty level for adaptive scenarios based on digital habits
 */
export function getAdaptiveDifficulty(
  digitalHabitLevel: DigitalHabitLevel
): number {
  switch (digitalHabitLevel) {
    case 'low':
      return 1;
    case 'moderate':
      return 2;
    case 'high':
      return 3;
  }
}
