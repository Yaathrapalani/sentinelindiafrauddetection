/**
 * Service layer for Sentinel India
 * All database operations go through these services, not directly through the client.
 * This provides a single point for validation, error handling, and data transformation.
 */

import { supabase } from '@/lib/supabase/client';
import type {
  ParticipantProfile,
  AssessmentSession,
  ScenarioResponse,
  BehaviorScore,
  Scenario,
  AnalyticsSummary,
  Persona,
  MetricKey,
} from '@/types';
import type { ParticipantInput, ResponseInput, FeedbackInput } from '@/lib/validation/schemas';
import { computeBehaviorScore } from '@/lib/scoring/engine';

// ── Participants ────────────────────────────────────────────────────────────

export async function createParticipant(
  input: ParticipantInput
): Promise<{ data: ParticipantProfile | null; error: string | null }> {
  const anonymousId = `anon_${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from('participants')
    .insert({
      anonymous_id: anonymousId,
      age_bracket: input.ageBracket,
      occupation: input.occupation,
      digital_habit_level: input.digitalHabitLevel,
      scam_experience: input.scamExperience,
      digital_services: input.digitalServices || [],
      digital_confidence: input.digitalConfidence,
      exposure_frequency: input.exposureFrequency,
      decision_style: input.decisionStyle || {},
      locale: input.locale,
      consent_given: input.consentGiven,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return {
    data: {
      id: data.id,
      anonymousId: data.anonymous_id,
      ageBracket: data.age_bracket,
      occupation: data.occupation,
      digitalHabitLevel: data.digital_habit_level,
      scamExperience: data.scam_experience,
      digitalServices: data.digital_services || [],
      digitalConfidence: data.digital_confidence,
      exposureFrequency: data.exposure_frequency,
      decisionStyle: data.decision_style || {},
      locale: data.locale,
      consentGiven: data.consent_given,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    },
    error: null,
  };
}

export async function getParticipant(
  id: string
): Promise<{ data: ParticipantProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  return {
    data: {
      id: data.id,
      anonymousId: data.anonymous_id,
      ageBracket: data.age_bracket,
      occupation: data.occupation,
      digitalHabitLevel: data.digital_habit_level,
      scamExperience: data.scam_experience,
      digitalServices: data.digital_services || [],
      digitalConfidence: data.digital_confidence,
      exposureFrequency: data.exposure_frequency,
      decisionStyle: data.decision_style || {},
      locale: data.locale,
      consentGiven: data.consent_given,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    },
    error: null,
  };
}

// ── Scenarios ───────────────────────────────────────────────────────────────

export async function getActiveScenarios(): Promise<{
  data: Scenario[] | null;
  error: string | null;
}> {
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
  const [participantsRes, scoresRes, assessmentsRes, responsesRes] = await Promise.all([
    supabase.from('participants').select('age_bracket, occupation, digital_habit_level, completed_at'),
    supabase.from('behavior_scores').select('scores, risk_level, overall_score'),
    supabase.from('assessments').select('status, started_at'),
    supabase
      .from('responses')
      .select('response_type, scenario_id, scenarios!inner(category)'),
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
  const responses = responsesRes.data || [];

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

  const metricAverages: Record<string, number> = {};
  if (scores.length > 0) {
    const allMetrics = Object.keys(scores[0].scores || {});
    for (const metric of allMetrics) {
      metricAverages[metric] = Math.round(
        scores.reduce((sum, s) => sum + (s.scores[metric] || 0), 0) / scores.length
      );
    }
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

  // Top vulnerabilities: metrics with lowest average scores (most vulnerable)
  const topVulnerabilities = (Object.entries(metricAverages) as [MetricKey, number][])
    .map(([metric, averageScore]) => ({ metric, averageScore }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);

  // Category performance: average safety score per scenario category
  // safe=100, cautious=75, risky=25, critical=0
  const responseScores: Record<string, number> = {
    safe: 100,
    cautious: 75,
    risky: 25,
    critical: 0,
  };
  const categorySums: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  for (const r of responses) {
    const cat = (r.scenarios as unknown as { category: string })?.category;
    if (!cat) continue;
    categorySums[cat] = (categorySums[cat] || 0) + (responseScores[r.response_type] ?? 50);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const categoryPerformance: Record<string, number> = {} as Record<string, number>;
  for (const cat of Object.keys(categorySums)) {
    categoryPerformance[cat] = Math.round(categorySums[cat] / categoryCounts[cat]);
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
  const { error } = await supabase.from('feedback').insert({
    participant_id: participantId,
    type: input.type,
    message: input.message,
    rating: input.rating ?? null,
    page: input.page,
  });

  return { error: error?.message ?? null };
}
