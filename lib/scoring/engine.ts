/**
 * Behavioral Scoring Engine — Architecture
 *
 * This module defines the scoring architecture for Sentinel India.
 * The engine computes 10 behavioral metrics from assessment responses,
 * then synthesizes them into an overall risk score and risk level.
 *
 * Architecture (not formulas):
 *
 * 1. MetricAccumulator — collects raw metric impacts from each response
 * 2. WeightedNormalizer — normalizes accumulated impacts to 0–100 per metric
 * 3. ConfidenceCalibrator — adjusts scores based on confidence-vs-accuracy gap
 * 4. OverallRiskSynthesizer — combines all metrics into overall risk
 * 5. RiskLevelClassifier — maps overall score to a risk level
 * 6. PersonaMatcher — maps score to a predefined persona
 *
 * Scoring flow:
 *   responses → accumulate → normalize → calibrate → synthesize → classify → match persona
 *
 * Key design decisions:
 * - Positive metrics (digitalLiteracy, etc.): higher score = safer
 * - Negative metrics (authoritySusceptibility, etc.): higher score = more vulnerable
 * - overallRisk is a composite: weighted sum of all metrics (negative direction)
 * - Confidence calibration penalizes overconfidence on wrong answers
 * - Time spent factors into urgency susceptibility (fast + wrong = more susceptible)
 */

import type {
  MetricKey,
  ScenarioResponse,
  BehaviorScore,
  RiskLevel,
  MetricDirection,
} from '@/types';
import { METRIC_DEFINITIONS, POSITIVE_METRICS, NEGATIVE_METRICS } from '@/constants';

export interface MetricAccumulatorEntry {
  totalImpact: number;
  responseCount: number;
  confidenceSum: number;
  correctCount: number;
  timeSpentMs: number;
}

export type MetricAccumulator = Record<MetricKey, MetricAccumulatorEntry>;

function createEmptyAccumulator(): MetricAccumulator {
  const acc = {} as MetricAccumulator;
  for (const key of Object.keys(METRIC_DEFINITIONS) as MetricKey[]) {
    acc[key] = {
      totalImpact: 0,
      responseCount: 0,
      confidenceSum: 0,
      correctCount: 0,
      timeSpentMs: 0,
    };
  }
  return acc;
}

function isCorrectResponse(responseType: ScenarioResponse['responseType']): boolean {
  return responseType === 'safe' || responseType === 'cautious';
}

/**
 * Step 1: Accumulate raw metric impacts from all responses
 */
export function accumulateMetrics(responses: ScenarioResponse[]): MetricAccumulator {
  const acc = createEmptyAccumulator();

  for (const response of responses) {
    for (const [metricKey, impact] of Object.entries(response.metricImpacts)) {
      const key = metricKey as MetricKey;
      if (!(key in acc)) continue;

      acc[key].totalImpact += impact ?? 0;
      acc[key].responseCount += 1;
      acc[key].confidenceSum += response.confidenceLevel;
      acc[key].timeSpentMs += response.timeSpentMs;
      if (isCorrectResponse(response.responseType)) {
        acc[key].correctCount += 1;
      }
    }
  }

  return acc;
}

/**
 * Step 2: Normalize accumulated impacts to 0–100 scale per metric
 *
 * For positive metrics: higher impact = higher score (safer)
 * For negative metrics: higher impact = higher score (more vulnerable)
 *
 * Base score is 50 (neutral). Impacts shift from there.
 * Clamped to 0–100.
 */
export function normalizeMetric(
  key: MetricKey,
  entry: MetricAccumulatorEntry
): number {
  if (entry.responseCount === 0) return 50;

  const definition = METRIC_DEFINITIONS[key];
  const avgImpact = entry.totalImpact / entry.responseCount;
  const baseScore = 50;
  const scale = 10;

  let score: number;
  if (definition.direction === 'positive') {
    score = baseScore + avgImpact * scale;
  } else {
    score = baseScore + avgImpact * scale;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Step 3: Confidence calibration
 *
 * Penalizes overconfidence on incorrect answers.
 * If the participant was confident (4-5) but answered wrong (risky/critical),
 * reduce the positive metric scores slightly.
 */
export function calibrateConfidence(
  scores: Partial<Record<MetricKey, number>>,
  acc: MetricAccumulator
): Partial<Record<MetricKey, number>> {
  const calibrated = { ...scores };

  for (const key of POSITIVE_METRICS) {
    const entry = acc[key];
    if (!entry || entry.responseCount === 0) continue;

    const avgConfidence = entry.confidenceSum / entry.responseCount;
    const accuracy = entry.correctCount / entry.responseCount;
    const overconfidenceGap = avgConfidence / 5 - accuracy;

    if (overconfidenceGap > 0 && calibrated[key] !== undefined) {
      const penalty = Math.round(overconfidenceGap * 10);
      calibrated[key] = Math.max(0, (calibrated[key] as number) - penalty);
    }
  }

  return calibrated;
}

/**
 * Step 4: Synthesize overall risk from all metrics
 *
 * Weighted combination of all metrics.
 * Positive metrics contribute inversely (high positive = low risk).
 * Negative metrics contribute directly (high negative = high risk).
 */
export function synthesizeOverallRisk(
  scores: Partial<Record<MetricKey, number>>
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const key of [...POSITIVE_METRICS, ...NEGATIVE_METRICS.filter((m) => m !== 'overallRisk')]) {
    const score = scores[key];
    if (score === undefined) continue;

    const weight = METRIC_DEFINITIONS[key].weight;
    const direction = METRIC_DEFINITIONS[key].direction;

    if (direction === 'positive') {
      weightedSum += (100 - score) * weight;
    } else {
      weightedSum += score * weight;
    }
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Step 5: Classify overall score into a risk level
 */
export function classifyRiskLevel(overallScore: number): RiskLevel {
  if (overallScore >= 80) return 'low';
  if (overallScore >= 60) return 'moderate';
  if (overallScore >= 40) return 'elevated';
  if (overallScore >= 20) return 'high';
  return 'critical';
}

/**
 * Full scoring pipeline
 */
export function computeBehaviorScore(
  participantId: string,
  assessmentId: string,
  responses: ScenarioResponse[]
): BehaviorScore {
  const acc = accumulateMetrics(responses);

  const rawScores: Partial<Record<MetricKey, number>> = {};
  for (const key of Object.keys(METRIC_DEFINITIONS) as MetricKey[]) {
    rawScores[key] = normalizeMetric(key, acc[key]);
  }

  const calibratedScores = calibrateConfidence(rawScores, acc);
  const overallRisk = synthesizeOverallRisk(calibratedScores);
  calibratedScores.overallRisk = overallRisk;

  const riskLevel = classifyRiskLevel(overallRisk);

  const finalScores = calibratedScores as Record<MetricKey, number>;

  return {
    participantId,
    assessmentId,
    scores: finalScores,
    riskLevel,
    overallScore: 100 - overallRisk,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Get metric direction
 */
export function getMetricDirection(key: MetricKey): MetricDirection {
  return METRIC_DEFINITIONS[key].direction;
}

/**
 * Get metric label
 */
export function getMetricLabel(key: MetricKey): string {
  return METRIC_DEFINITIONS[key].label;
}
