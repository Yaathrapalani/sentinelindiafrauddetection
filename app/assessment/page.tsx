'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileForm } from '@/components/assessment/profile-form';
import { ScenarioCard } from '@/components/assessment/scenario-card';
import { AssessmentProgress } from '@/components/assessment/assessment-progress';
import { useAssessmentState } from '@/hooks/use-assessment';
import { useSia } from '@/components/providers/sia-provider';
import {
  createParticipant,
  getActiveScenarios,
  createAssessment,
  submitResponse,
  completeAssessment,
} from '@/lib/services/api';
import { buildAssessment } from '@/lib/scoring/adaptive';
import type { Scenario, ParticipantProfile } from '@/types';
import type { ParticipantInput } from '@/lib/validation/schemas';
import { ROUTES } from '@/constants';

type Phase = 'intro' | 'profile' | 'assessment' | 'loading';

export default function AssessmentPage() {
  const router = useRouter();
  const sia = useSia();
  const [phase, setPhase] = useState<Phase>('intro');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [participant, setParticipant] = useState<ParticipantProfile | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    currentScenarioIndex,
    responses,
    selectedOptionId,
    confidenceLevel,
    selectOption,
    setConfidence,
    markVoiceUsed,
    buildResponse,
    commitResponse,
    startScenario,
  } = useAssessmentState();

  const lastNarratedScenario = useRef<number>(-1);
  const hasNarratedIntro = useRef(false);
  const hasNarratedProfile = useRef(false);

  // ── Narration: Intro phase ──────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'intro' && !hasNarratedIntro.current) {
      hasNarratedIntro.current = true;
      // Greeting + introduction (speech gated by enable + interaction in provider)
      const timer1 = setTimeout(() => {
        sia.narrateGreeting();
      }, 800);
      const timer2 = setTimeout(() => {
        sia.narrateIntroduction();
      }, 5000);
      const timer3 = setTimeout(() => {
        sia.narrateConsent();
      }, 12000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [phase, sia]);

  // Cancel overlapping speech when phase changes
  useEffect(() => {
    sia.resetToIdle();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: cancel only on phase change

  // ── Narration: Profile phase ─────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'profile' && !hasNarratedProfile.current) {
      hasNarratedProfile.current = true;
      const timer = setTimeout(() => {
        sia.narrateProfile();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, sia]);

  // ── Narration: Scenario introduction ─────────────────────────────────────
  useEffect(() => {
    if (phase === 'assessment' && scenarios.length > 0) {
      startScenario();
      const currentIdx = currentScenarioIndex;
      if (lastNarratedScenario.current !== currentIdx) {
        lastNarratedScenario.current = currentIdx;
        const scenario = scenarios[currentIdx];
        if (scenario) {
          const timer = setTimeout(() => {
            sia.narrateScenario(
              scenario.title,
              scenario.description,
              scenario.voiceScript
            );
          }, 600);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [phase, currentScenarioIndex, scenarios, startScenario, sia]);

  // ── Narration: Loading phase ─────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'loading') {
      sia.narrateCompletion();
    }
  }, [phase, sia]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      sia.resetToIdle();
    };
  }, [sia]);

  const handleProfileSubmit = async (data: ParticipantInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const { data: participantData, error: participantError } = await createParticipant(data);
      if (participantError || !participantData) {
        setError(participantError || 'Failed to create participant');
        return;
      }
      setParticipant(participantData);

      const { data: scenarioData, error: scenarioError } = await getActiveScenarios();
      if (scenarioError || !scenarioData) {
        setError(scenarioError || 'Failed to load scenarios');
        return;
      }
      const selection = buildAssessment(scenarioData, {
        ageBracket: data.ageBracket,
        occupation: data.occupation,
        digitalHabitLevel: data.digitalHabitLevel,
        scamExperience: data.scamExperience,
        digitalServices: data.digitalServices,
        digitalConfidence: data.digitalConfidence,
      });
      setScenarios(selection.allScenarios);

      const { data: assessment, error: assessmentError } = await createAssessment(
        participantData.id,
        selection.allScenarios.map((s) => s.id),
        data.locale
      );
      if (assessmentError || !assessment) {
        setError(assessmentError || 'Failed to start assessment');
        return;
      }
      setAssessmentId(assessment.id);
      setPhase('assessment');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = useCallback(async () => {
    if (!selectedOptionId || !assessmentId || !participant) return;

    const scenario = scenarios[currentScenarioIndex];
    if (!scenario) return;

    const option = scenario.options.find((o) => o.id === selectedOptionId);
    if (!option) return;

    // Acknowledge the answer
    sia.narrateAcknowledgement();

    const response = buildResponse(
      scenario,
      option.id,
      option.responseType,
      option.metricImpacts
    );

    const { error: submitError } = await submitResponse(assessmentId, {
      scenarioId: scenario.id,
      optionId: option.id,
      responseType: option.responseType,
      timeSpentMs: response.timeSpentMs,
      confidenceLevel: response.confidenceLevel,
      usedVoice: response.usedVoice,
    }, option.metricImpacts);

    if (submitError) {
      setError(submitError);
      return;
    }

    setError(null);

    const isLast = currentScenarioIndex >= scenarios.length - 1;

    if (isLast) {
      setPhase('loading');
      const allResponses = [...responses, response];
      const { error: completeError } = await completeAssessment(
        assessmentId,
        participant.id,
        allResponses
      );

      if (completeError) {
        setError(completeError);
        setPhase('assessment');
        return;
      }

      commitResponse(response);
      router.push(`${ROUTES.RESULTS}?assessment=${assessmentId}&participant=${participant.id}`);
      return;
    }

    commitResponse(response);
    setTimeout(() => {
      sia.narrateProgress(currentScenarioIndex + 1, scenarios.length);
    }, 2000);
  }, [
    selectedOptionId,
    assessmentId,
    participant,
    scenarios,
    currentScenarioIndex,
    responses,
    buildResponse,
    commitResponse,
    router,
    sia,
  ]);

  if (phase === 'intro') {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Shield className="h-8 w-8 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-3xl">Digital Safety Assessment</CardTitle>
              <CardDescription className="text-lg">
                This assessment takes approximately 10 minutes. Your responses are
                anonymous and used only for research.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  <p className="text-sm text-muted-foreground">
                    You will see 12 realistic scenarios based on real fraud patterns in India.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  <p className="text-sm text-muted-foreground">
                    Choose what you would actually do — there are no trick questions.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  <p className="text-sm text-muted-foreground">
                    After each answer, rate your confidence level from 1 to 5.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  <p className="text-sm text-muted-foreground">
                    At the end, you will receive a personalized Digital Safety Profile.
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={() => setPhase('profile')}
              >
                Begin Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === 'profile') {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <ProfileForm onSubmit={handleProfileSubmit} submitting={submitting} />
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-accent" />
          <p className="text-sm text-muted-foreground">Calculating your Digital Safety Profile...</p>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentScenarioIndex];
  if (!currentScenario) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">No scenarios available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <div className="mb-6">
          <AssessmentProgress
            current={currentScenarioIndex}
            total={scenarios.length}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenarioIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ScenarioCard
              scenario={currentScenario}
              index={currentScenarioIndex}
              total={scenarios.length}
              selectedOptionId={selectedOptionId}
              confidenceLevel={confidenceLevel}
              onSelectOption={selectOption}
              onSetConfidence={setConfidence}
              onSubmit={handleAnswerSubmit}
              onVoiceUsed={markVoiceUsed}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
