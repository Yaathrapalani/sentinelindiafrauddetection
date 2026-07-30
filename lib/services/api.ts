/**
 * Service layer for Sentinel India
 * All database operations go through these services, not directly through the client.
 * This provides a single point for validation, error handling, and data transformation.
 */

import { supabase, assertSupabaseConfigured } from '@/lib/supabase/client';
import type {
  ParticipantProfile,
  AssessmentSession,
  ScenarioResponse,
  BehaviorScore,
  Scenario,
  AnalyticsSummary,
  Persona,
  MetricKey,
  ScenarioCategory,
  DigitalService,
  DigitalConfidence,
  ExposureFrequency,
  DecisionStyle,
} from '@/types';
import type { ParticipantInput, ResponseInput, FeedbackInput } from '@/lib/validation/schemas';
import { computeBehaviorScore } from '@/lib/scoring/engine';
import { METRIC_DEFINITIONS, POSITIVE_METRICS, NEGATIVE_METRICS } from '@/constants';

function mapDecisionStyle(raw: unknown): DecisionStyle | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const urgency = (obj.urgency_response ?? obj.urgencyResponse) as DecisionStyle['urgencyResponse'] | undefined;
  const authority = (obj.authority_response ?? obj.authorityResponse) as DecisionStyle['authorityResponse'] | undefined;
  const unexpected = (obj.unexpected_response ?? obj.unexpectedResponse) as DecisionStyle['unexpectedResponse'] | undefined;
  if (!urgency || !authority || !unexpected) return null;
  return {
    urgencyResponse: urgency,
    authorityResponse: authority,
    unexpectedResponse: unexpected,
  };
}

function mapParticipant(data: Record<string, unknown>): ParticipantProfile {
  return {
    id: data.id as string,
    anonymousId: data.anonymous_id as string,
    ageBracket: data.age_bracket as ParticipantProfile['ageBracket'],
    occupation: data.occupation as ParticipantProfile['occupation'],
    digitalHabitLevel: data.digital_habit_level as ParticipantProfile['digitalHabitLevel'],
    scamExperience: data.scam_experience as ParticipantProfile['scamExperience'],
    digitalServices: (data.digital_services as DigitalService[]) || [],
    digitalConfidence: (data.digital_confidence as DigitalConfidence) || null,
    exposureFrequency: (data.exposure_frequency as ExposureFrequency) || null,
    decisionStyle: mapDecisionStyle(data.decision_style),
    locale: data.locale as ParticipantProfile['locale'],
    consentGiven: data.consent_given as boolean,
    createdAt: data.created_at as string,
    completedAt: (data.completed_at as string) || null,
  };
}

// ── Participants ────────────────────────────────────────────────────────────

export async function createParticipant(
  input: ParticipantInput
): Promise<{ data: ParticipantProfile | null; error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const anonymousId = `anon_${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from('participants')
    .insert({
      anonymous_id: anonymousId,
      age_bracket: input.ageBracket,
      occupation: input.occupation,
      digital_habit_level: input.digitalHabitLevel,
      scam_experience: input.scamExperience,
      digital_services: input.digitalServices ?? [],
      digital_confidence: input.digitalConfidence,
      exposure_frequency: input.exposureFrequency,
      decision_style: {
        urgency_response: input.decisionStyle.urgencyResponse,
        authority_response: input.decisionStyle.authorityResponse,
        unexpected_response: input.decisionStyle.unexpectedResponse,
      },
      locale: input.locale,
      consent_given: input.consentGiven,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return {
    data: mapParticipant(data as Record<string, unknown>),
    error: null,
  };
}

export async function getParticipant(
  id: string
): Promise<{ data: ParticipantProfile | null; error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  return {
    data: mapParticipant(data as Record<string, unknown>),
    error: null,
  };
}

// ── Scenarios ───────────────────────────────────────────────────────────────

export async function getActiveScenarios(): Promise<{
  data: Scenario[] | null;
  error: string | null;
}> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const { data: scenarioRows, error } = await supabase
    .from('scenarios')
    .select('*, scenario_options(*)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return { data: null, error: error.message };

  const scenarios: Scenario[] = (scenarioRows || []).map((row) => ({
    id: row.id,
    category: row.category,
    channel: row.channel,
    title: row.title,
    description: row.description,
    voiceScript: row.voice_script,
    isCore: row.is_core,
    difficulty: row.difficulty,
    tags: row.tags || [],
    options: (row.scenario_options || [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((opt: Record<string, unknown>) => ({
        id: opt.id as string,
        text: opt.option_text as string,
        responseType: opt.response_type as Scenario['options'][0]['responseType'],
        metricImpacts: opt.metric_impacts as Record<string, number>,
        explanation: opt.explanation as string,
      })),
  }));

  return { data: scenarios, error: null };
}

// ── Assessments ──────────────────────────────────────────────────────────────

export async function createAssessment(
  participantId: string,
  scenarioIds: string[],
  locale: string
): Promise<{ data: AssessmentSession | null; error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      participant_id: participantId,
      status: 'active',
      scenario_ids: scenarioIds,
      locale,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return {
    data: {
      id: data.id,
      participantId: data.participant_id,
      status: data.status,
      currentScenarioIndex: data.current_scenario_index,
      scenarioIds: data.scenario_ids,
      responses: [],
      startedAt: data.started_at,
      completedAt: data.completed_at,
      locale: data.locale,
    },
    error: null,
  };
}

export async function getAssessment(
  id: string
): Promise<{ data: AssessmentSession | null; error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*, responses(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!assessment) return { data: null, error: null };

  const responses: ScenarioResponse[] = (assessment.responses || []).map(
    (r: Record<string, unknown>) => ({
      scenarioId: r.scenario_id as string,
      optionId: r.option_id as string,
      responseType: r.response_type as ScenarioResponse['responseType'],
      timeSpentMs: r.time_spent_ms as number,
      confidenceLevel: r.confidence_level as number,
      usedVoice: r.used_voice as boolean,
      metricImpacts: r.metric_impacts as Record<string, number>,
      answeredAt: r.answered_at as string,
    })
  );

  return {
    data: {
      id: assessment.id,
      participantId: assessment.participant_id,
      status: assessment.status,
      currentScenarioIndex: assessment.current_scenario_index,
      scenarioIds: assessment.scenario_ids,
      responses,
      startedAt: assessment.started_at,
      completedAt: assessment.completed_at,
      locale: assessment.locale,
    },
    error: null,
  };
}

export async function submitResponse(
  assessmentId: string,
  input: ResponseInput,
  metricImpacts: Record<string, number>
): Promise<{ error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { error: cfg };

  const { error } = await supabase.from('responses').insert({
    assessment_id: assessmentId,
    scenario_id: input.scenarioId,
    option_id: input.optionId,
    response_type: input.responseType,
    time_spent_ms: input.timeSpentMs,
    confidence_level: input.confidenceLevel,
    used_voice: input.usedVoice,
    metric_impacts: metricImpacts,
  });

  return { error: error?.message ?? null };
}

export async function completeAssessment(
  assessmentId: string,
  participantId: string,
  responses: ScenarioResponse[]
): Promise<{ data: BehaviorScore | null; error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const behaviorScore = computeBehaviorScore(participantId, assessmentId, responses);

  const { error: scoreError } = await supabase.from('behavior_scores').insert({
    participant_id: participantId,
    assessment_id: assessmentId,
    scores: behaviorScore.scores,
    risk_level: behaviorScore.riskLevel,
    overall_score: behaviorScore.overallScore,
  });

  if (scoreError) return { data: null, error: scoreError.message };

  const { error: updateError } = await supabase
    .from('assessments')
    .update({ status: 'complete', completed_at: new Date().toISOString() })
    .eq('id', assessmentId);

  if (updateError) return { data: null, error: updateError.message };

  const { error: participantError } = await supabase
    .from('participants')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', participantId);

  if (participantError) return { data: null, error: participantError.message };

  return { data: behaviorScore, error: null };
}

// ── Behavior Scores ──────────────────────────────────────────────────────────

export async function getBehaviorScore(
  participantId: string
): Promise<{ data: BehaviorScore | null; error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const { data, error } = await supabase
    .from('behavior_scores')
    .select('*')
    .eq('participant_id', participantId)
    .order('calculated_at', { ascending: false })
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  return {
    data: {
      participantId: data.participant_id,
      assessmentId: data.assessment_id,
      scores: data.scores,
      riskLevel: data.risk_level,
      overallScore: data.overall_score,
      calculatedAt: data.calculated_at,
    },
    error: null,
  };
}

// ── Personas ──────────────────────────────────────────────────────────────────

export async function getPersonas(): Promise<{
  data: Persona[] | null;
  error: string | null;
}> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('is_active', true)
    .order('score_min', { ascending: true });

  if (error) return { data: null, error: error.message };

  const personas: Persona[] = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    characteristics: row.characteristics || [],
    riskLevel: row.risk_level,
    scoreRange: { min: row.score_min, max: row.score_max },
  }));

  return { data: personas, error: null };
}

export function matchPersona(
  overallScore: number,
  personas: Persona[]
): Persona | null {
  return (
    personas.find(
      (p) => overallScore >= p.scoreRange.min && overallScore <= p.scoreRange.max
    ) || null
  );
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<{
  data: AnalyticsSummary | null;
  error: string | null;
}> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { data: null, error: cfg };

  const [participantsRes, scoresRes, assessmentsRes, responsesRes] = await Promise.all([
    supabase.from('participants').select('age_bracket, occupation, digital_habit_level, completed_at'),
    supabase.from('behavior_scores').select('scores, risk_level, overall_score'),
    supabase.from('assessments').select('status, started_at'),
    supabase
      .from('responses')
      .select('response_type, scenarios!inner(category)'),
  ]);

  if (participantsRes.error || scoresRes.error || assessmentsRes.error || responsesRes.error) {
    return {
      data: null,
      error:
        participantsRes.error?.message ||
        scoresRes.error?.message ||
        assessmentsRes.error?.message ||
        responsesRes.error?.message ||
        'Unknown error',
    };
  }

  const participants = participantsRes.data || [];
  const scores = scoresRes.data || [];
  const assessments = assessmentsRes.data || [];
  const responseRows = responsesRes.data || [];

  const completedAssessments = assessments.filter(
    (a) => a.status === 'complete'
  ).length;

  const avgScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length
        )
      : 0;

  const riskDistribution = {
    low: scores.filter((s) => s.risk_level === 'low').length,
    moderate: scores.filter((s) => s.risk_level === 'moderate').length,
    elevated: scores.filter((s) => s.risk_level === 'elevated').length,
    high: scores.filter((s) => s.risk_level === 'high').length,
    critical: scores.filter((s) => s.risk_level === 'critical').length,
  };

  const metricAverages = {} as Record<MetricKey, number>;
  if (scores.length > 0) {
    const allMetrics = Object.keys(scores[0].scores || {}) as MetricKey[];
    for (const metric of allMetrics) {
      metricAverages[metric] = Math.round(
        scores.reduce((sum, s) => sum + (s.scores[metric] || 0), 0) / scores.length
      );
    }
  }

  // Top vulnerabilities: lowest positive metrics / highest negative metrics
  const vulnerabilityCandidates: { metric: MetricKey; averageScore: number; severity: number }[] = [];
  for (const [metric, averageScore] of Object.entries(metricAverages) as [MetricKey, number][]) {
    if (metric === 'overallRisk') continue;
    const definition = METRIC_DEFINITIONS[metric];
    if (!definition) continue;
    if (POSITIVE_METRICS.includes(metric)) {
      vulnerabilityCandidates.push({
        metric,
        averageScore,
        severity: 100 - averageScore,
      });
    } else if (NEGATIVE_METRICS.includes(metric)) {
      vulnerabilityCandidates.push({
        metric,
        averageScore,
        severity: averageScore,
      });
    }
  }
  const topVulnerabilities = vulnerabilityCandidates
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .map(({ metric, averageScore }) => ({ metric, averageScore }));

  // Category performance: average safety score per scenario category
  const RESPONSE_SAFETY: Record<string, number> = {
    safe: 100,
    cautious: 70,
    risky: 30,
    critical: 0,
  };
  const categorySums: Record<string, { total: number; count: number }> = {};
  for (const row of responseRows) {
    const scenario = row.scenarios as { category?: string } | { category?: string }[] | null;
    const category = Array.isArray(scenario)
      ? scenario[0]?.category
      : scenario?.category;
    if (!category) continue;
    const safety = RESPONSE_SAFETY[row.response_type as string] ?? 50;
    if (!categorySums[category]) categorySums[category] = { total: 0, count: 0 };
    categorySums[category].total += safety;
    categorySums[category].count += 1;
  }
  const categoryPerformance = {} as Record<ScenarioCategory, number>;
  for (const [category, { total, count }] of Object.entries(categorySums)) {
    categoryPerformance[category as ScenarioCategory] = Math.round(total / count);
  }

  const demographicBreakdown = {
    ageBracket: {} as Record<string, number>,
    occupation: {} as Record<string, number>,
    digitalHabitLevel: {} as Record<string, number>,
  };

  for (const p of participants) {
    demographicBreakdown.ageBracket[p.age_bracket] =
      (demographicBreakdown.ageBracket[p.age_bracket] || 0) + 1;
    demographicBreakdown.occupation[p.occupation] =
      (demographicBreakdown.occupation[p.occupation] || 0) + 1;
    demographicBreakdown.digitalHabitLevel[p.digital_habit_level] =
      (demographicBreakdown.digitalHabitLevel[p.digital_habit_level] || 0) + 1;
  }

  return {
    data: {
      totalParticipants: participants.length,
      completedAssessments,
      averageOverallScore: avgScore,
      riskDistribution,
      metricAverages,
      topVulnerabilities,
      demographicBreakdown,
      categoryPerformance,
      lastUpdated: new Date().toISOString(),
    },
    error: null,
  };
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export async function submitFeedback(
  input: FeedbackInput,
  participantId: string | null
): Promise<{ error: string | null }> {
  const cfg = assertSupabaseConfigured();
  if (cfg) return { error: cfg };

  const { error } = await supabase.from('feedback').insert({
    participant_id: participantId,
    type: input.type,
    message: input.message,
    rating: input.rating ?? null,
    page: input.page,
  });

  return { error: error?.message ?? null };
}
