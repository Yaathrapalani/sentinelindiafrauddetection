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
import { SIAAssistant } from '@/components/sia/sia-assistant';
import { LeaveConfirmationDialog } from '@/components/sia/leave-confirmation-dialog';
import { useAssessmentState } from '@/hooks/use-assessment';
import { useSIAOrchestrator } from '@/hooks/use-sia-orchestrator';
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
  const [phase, setPhase] = useState<Phase>('intro');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [participant, setParticipant] = useState<ParticipantProfile | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    currentScenarioIndex,
    responses,
    selectedOptionId,
    confidenceLevel,
    selectOption,
    setConfidence,
    markVoiceUsed,
    submitResponse: handleSubmitResponse,
  } = useAssessmentState();

  const sia = useSIAOrchestrator({
    totalScenarios: scenarios.length || 12,
    ageBracket: participant?.ageBracket,
  });



  // SIA scenario intro when scenario changes
  useEffect(() => {
    if (phase === 'assessment' && scenarios[currentScenarioIndex]) {
      const scenario = scenarios[currentScenarioIndex];
      sia.introduceScenario(currentScenarioIndex, scenario.category);
      const timer = setTimeout(() => sia.startObserving(), 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, currentScenarioIndex, scenarios]);

  // SIA progress updates
  useEffect(() => {
    if (phase === 'assessment') {
      sia.updateProgress(currentScenarioIndex);
    }
  }, [currentScenarioIndex, phase]);

  // Leave page handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === 'assessment' && sia.context.completionPercentage > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase, sia.context.completionPercentage]);

  // Route change interception
  const routerPushRef = useRef(router.push);
  useEffect(() => {
    const originalPush = router.push.bind(router);
    routerPushRef.current = ((href: string, options?: Record<string, unknown>) => {
      if (phase === 'assessment' && sia.handleLeaveAttempt()) {
        return;
      }
      return originalPush(href, options as Parameters<typeof originalPush>[1]);
    }) as typeof router.push;
    return () => {
      routerPushRef.current = originalPush;
    };
  }, [phase, sia, router]);

  const handleBegin = () => {
    if (!sia.voice.hasInteracted) {
      sia.startSIA();
    }
    setPhase('profile');
    setTimeout(() => sia.guideToProfile(), 2000);
  };

  const handleProfileSubmit = async (data: ParticipantInput) => {
    setLoading(true);
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
      setScenarios(scenarioData);

      const selection = buildAssessment(scenarioData, {
        ageBracket: data.ageBracket,
        occupation: data.occupation,
        digitalHabitLevel: data.digitalHabitLevel,
        scamExperience: data.scamExperience,
        digitalServices: data.digitalServices,
        digitalConfidence: data.digitalConfidence,
        exposureFrequency: data.exposureFrequency,
        decisionStyle: data.decisionStyle,
      });

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
      setLoading(false);
    }
  };

  const handleAnswerSubmit = useCallback(async () => {
    if (!selectedOptionId || !assessmentId || !participant) return;

    const scenario = scenarios[currentScenarioIndex];
    if (!scenario) return;

    const option = scenario.options.find((o) => o.id === selectedOptionId);
    if (!option) return;

    // SIA acknowledges the answer
    sia.acknowledgeAnswer();

    const response = handleSubmitResponse(
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
      console.error('Failed to submit response:', submitError);
    }

    if (currentScenarioIndex >= scenarios.length - 1) {
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

      router.push(`${ROUTES.RESULTS}?assessment=${assessmentId}&participant=${participant.id}`);
    }
  }, [selectedOptionId, assessmentId, participant, scenarios, currentScenarioIndex, responses, handleSubmitResponse, router, sia]);

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
                This assessment takes approximately 5 minutes. Your responses are
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
                onClick={handleBegin}
              >
                Begin Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
        <SIAAssistant />
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
          <ProfileForm onSubmit={handleProfileSubmit} loading={loading} />
        </div>
        <SIAAssistant />
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
        <SIAAssistant />
      </div>
    );
  }

  const currentScenario = scenarios[currentScenarioIndex];
  if (!currentScenario) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">No scenarios available.</p>
        <SIAAssistant />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
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
      <SIAAssistant />
      <LeaveConfirmationDialog
        onContinue={sia.continueAssessment}
        onLeave={sia.leaveAnyway}
      />
    </div>
  );
}
