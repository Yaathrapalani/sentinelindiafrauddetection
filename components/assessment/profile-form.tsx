'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, ArrowLeft, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { ParticipantInput } from '@/lib/validation/schemas';
import type {
  AgeBracket,
  Occupation,
  DigitalHabitLevel,
  ScamExperience,
  DigitalService,
  DigitalConfidence,
  ExposureFrequency,
  DecisionStyleKey,
  DecisionStyleValue,
  Locale,
} from '@/types';
import {
  AGE_BRACKETS,
  OCCUPATIONS,
  DIGITAL_SERVICES,
  DIGITAL_CONFIDENCE_LEVELS,
  EXPOSURE_FREQUENCIES,
  SCAM_EXPERIENCES,
  DECISION_STYLE_QUESTIONS,
} from '@/constants';

interface ProfileFormProps {
  onSubmit: (data: ParticipantInput) => void;
  loading?: boolean;
  onStepChange?: (step: StepId, stepIndex: number, totalSteps: number) => void;
}

type StepId =
  | 'welcome'
  | 'language'
  | 'age'
  | 'occupation'
  | 'services'
  | 'confidence'
  | 'exposure'
  | 'scam-experience'
  | 'decision-1'
  | 'decision-2'
  | 'decision-3'
  | 'consent';

const STEP_ORDER: StepId[] = [
  'welcome',
  'language',
  'age',
  'occupation',
  'services',
  'confidence',
  'exposure',
  'scam-experience',
  'decision-1',
  'decision-2',
  'decision-3',
  'consent',
];

interface ProfileData {
  locale: Locale;
  ageBracket: AgeBracket | '';
  occupation: Occupation | '';
  digitalHabitLevel: DigitalHabitLevel | '';
  scamExperience: ScamExperience | '';
  digitalServices: DigitalService[];
  digitalConfidence: DigitalConfidence | '';
  exposureFrequency: ExposureFrequency | '';
  decisionStyle: Partial<Record<DecisionStyleKey, DecisionStyleValue>>;
  consentGiven: boolean;
}

const INITIAL_DATA: ProfileData = {
  locale: 'en',
  ageBracket: '',
  occupation: '',
  digitalHabitLevel: '',
  scamExperience: '',
  digitalServices: [],
  digitalConfidence: '',
  exposureFrequency: '',
  decisionStyle: {},
  consentGiven: false,
};

function deriveDigitalHabit(
  services: string[],
  confidence: string
): DigitalHabitLevel {
  const serviceCount = services.filter((s) => s !== 'none').length;
  const confMap: Record<string, number> = {
    'very-low': 0, low: 1, moderate: 2, high: 3, 'very-high': 4,
  '': 2,
  };
  const score = serviceCount + (confMap[confidence] ?? 2);
  if (score <= 2) return 'low';
  if (score >= 6) return 'high';
  return 'moderate';
}

const STEP_RATIONALES: Partial<Record<StepId, string>> = {
  age: 'Age helps us select scenarios relevant to your life stage and common fraud patterns.',
  occupation: 'Occupation helps us tailor scenarios to your professional context.',
  services: 'Knowing which services you use helps us target scenarios to your digital exposure.',
  confidence: 'Your confidence level helps us understand your digital literacy baseline.',
  exposure: 'Previous exposure helps us calibrate scenario difficulty and assess awareness.',
  'decision-1': 'Helps us understand your natural response to urgency tactics — a common scam technique.',
  'decision-2': 'Helps us understand how authority claims affect your decision-making.',
  'decision-3': 'Helps us understand your baseline trust for unexpected digital communications.',
  'scam-experience': 'Previous experience helps us calibrate scenario difficulty and assess recovery readiness.',
};

export function ProfileForm({ onSubmit, loading = false, onStepChange }: ProfileFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<ProfileData>(INITIAL_DATA);
  const [direction, setDirection] = useState(1);

  const currentStep = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;
  const progressValue = ((stepIndex + 1) / totalSteps) * 100;

  const update = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'language':
        return !!data.locale;
      case 'age':
        return !!data.ageBracket;
      case 'occupation':
        return !!data.occupation;
      case 'services':
        return data.digitalServices.length > 0;
      case 'confidence':
        return !!data.digitalConfidence;
      case 'exposure':
        return !!data.exposureFrequency;
      case 'scam-experience':
        return !!data.scamExperience;
      case 'decision-1':
        return !!data.decisionStyle.urgency_response;
      case 'decision-2':
        return !!data.decisionStyle.authority_response;
      case 'decision-3':
        return !!data.decisionStyle.unexpected_response;
      case 'consent':
        return data.consentGiven;
      default:
        return false;
    }
  }, [currentStep, data]);

  const handleNext = useCallback(() => {
    if (!canProceed()) return;
    if (currentStep === 'consent') {
      onSubmit({
        ageBracket: data.ageBracket as ParticipantInput['ageBracket'],
        occupation: data.occupation as ParticipantInput['occupation'],
        digitalHabitLevel: deriveDigitalHabit(data.digitalServices, data.digitalConfidence) as ParticipantInput['digitalHabitLevel'],
        scamExperience: data.scamExperience as ParticipantInput['scamExperience'],
        digitalServices: data.digitalServices,
        digitalConfidence: data.digitalConfidence || null,
        exposureFrequency: data.exposureFrequency || null,
        decisionStyle: data.decisionStyle,
        locale: data.locale,
        consentGiven: data.consentGiven,
      });
      return;
    }
    setDirection(1);
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [canProceed, currentStep, data, onSubmit, totalSteps]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Notify parent of step changes for SIA narration
  useEffect(() => {
    onStepChange?.(currentStep, stepIndex, totalSteps);
  }, [currentStep, stepIndex, totalSteps, onStepChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed() && currentStep !== 'consent') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canProceed, currentStep, handleNext]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Progress indicator */}
      {currentStep !== 'welcome' && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {stepIndex} of {totalSteps - 1}</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={Math.round(progressValue)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      )}

      <Card className="overflow-hidden border-border shadow-lg">
        <CardContent className="p-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-6 sm:p-8"
            >
              {currentStep === 'welcome' && (
                <WelcomeStep />
              )}

              {currentStep === 'language' && (
                <LanguageStep
                  value={data.locale}
                  onChange={(v) => update('locale', v)}
                />
              )}

              {currentStep === 'age' && (
                <ChoiceStep
                  title="What is your age group?"
                  rationale={STEP_RATIONALES.age!}
                  options={AGE_BRACKETS.map((b) => ({ value: b.value, label: b.label }))}
                  value={data.ageBracket}
                  onChange={(v) => update('ageBracket', v as AgeBracket)}
                  columns={3}
                />
              )}

              {currentStep === 'occupation' && (
                <ChoiceStep
                  title="What best describes your occupation?"
                  rationale={STEP_RATIONALES.occupation!}
                  options={OCCUPATIONS.map((o) => ({ value: o.value, label: o.label }))}
                  value={data.occupation}
                  onChange={(v) => update('occupation', v as Occupation)}
                  columns={2}
                />
              )}

              {currentStep === 'services' && (
                <MultiChoiceStep
                  title="Which digital services do you use?"
                  rationale={STEP_RATIONALES.services!}
                  options={DIGITAL_SERVICES.map((s) => ({
                    value: s.value,
                    label: s.label,
                    hint: s.hint,
                  }))}
                  values={data.digitalServices}
                  onChange={(v) => update('digitalServices', v as DigitalService[])}
                />
              )}

              {currentStep === 'confidence' && (
                <ChoiceStep
                  title="How confident do you feel using digital services?"
                  rationale={STEP_RATIONALES.confidence!}
                  options={DIGITAL_CONFIDENCE_LEVELS.map((c) => ({
                    value: c.value,
                    label: c.label,
                    hint: c.hint,
                  }))}
                  value={data.digitalConfidence}
                  onChange={(v) => update('digitalConfidence', v as DigitalConfidence)}
                />
              )}

              {currentStep === 'exposure' && (
                <ChoiceStep
                  title="How often do you encounter scam attempts?"
                  rationale={STEP_RATIONALES.exposure!}
                  options={EXPOSURE_FREQUENCIES.map((f) => ({
                    value: f.value,
                    label: f.label,
                    hint: f.hint,
                  }))}
                  value={data.exposureFrequency}
                  onChange={(v) => update('exposureFrequency', v as ExposureFrequency)}
                />
              )}

              {currentStep === 'scam-experience' && (
                <ChoiceStep
                  title="Have you or someone close to you ever been targeted by a scam?"
                  rationale={STEP_RATIONALES['scam-experience']!}
                  options={SCAM_EXPERIENCES.map((s) => ({
                    value: s.value,
                    label: s.label,
                  }))}
                  value={data.scamExperience}
                  onChange={(v) => update('scamExperience', v as ScamExperience)}
                />
              )}

              {currentStep.startsWith('decision-') && (
                <DecisionStep
                  questionIndex={parseInt(currentStep.split('-')[1]) - 1}
                  value={data.decisionStyle[
                    DECISION_STYLE_QUESTIONS[parseInt(currentStep.split('-')[1]) - 1].key
                  ]}
                  onChange={(v) => {
                    const key = DECISION_STYLE_QUESTIONS[parseInt(currentStep.split('-')[1]) - 1].key;
                    setData((prev) => ({
                      ...prev,
                      decisionStyle: { ...prev.decisionStyle, [key]: v as DecisionStyleValue },
                    }));
                  }}
                />
              )}

              {currentStep === 'consent' && (
                <ConsentStep
                  checked={data.consentGiven}
                  onChange={(v) => update('consentGiven', v)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep !== 'welcome' && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={stepIndex === 0 || loading}
            aria-label="Go back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            size="lg"
          >
            {currentStep === 'consent' ? (
              loading ? 'Starting...' : 'Begin Assessment'
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {currentStep === 'welcome' && (
        <div className="mt-6 flex justify-center">
          <Button onClick={handleNext} size="lg" className="min-w-[200px]">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Welcome Step ───────────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Shield className="h-8 w-8 text-accent" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Welcome</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        I&apos;m SIA, your Digital Safety Companion.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This assessment takes about five minutes. There&apos;s no pass or fail —
        we&apos;re interested in how people naturally respond to digital situations.
      </p>
      <div className="mt-6 space-y-3 text-left">
        <FeatureRow text="Your responses are completely anonymous" />
        <FeatureRow text="You'll receive a personalized Digital Safety Profile" />
        <FeatureRow text="You can pause or leave at any time" />
      </div>
    </div>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
      <Check className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

// ── Language Step ──────────────────────────────────────────────────────────

const LANGUAGES = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

function LanguageStep({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (v: Locale) => void;
}) {
  return (
    <StepWrapper
      title="Select your preferred language"
      rationale="This sets the language for your assessment and results."
    >
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as Locale)}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {LANGUAGES.map((lang) => (
          <label
            key={lang.value}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all',
              value === lang.value
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-border hover:border-accent/40 hover:bg-secondary/30'
            )}
          >
            <RadioGroupItem value={lang.value} id={`lang-${lang.value}`} />
            <div>
              <p className="text-sm font-medium text-foreground">{lang.label}</p>
              <p className="text-xs text-muted-foreground">{lang.native}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </StepWrapper>
  );
}

// ── Single Choice Step ─────────────────────────────────────────────────────

interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
}

function ChoiceStep({
  title,
  rationale,
  options,
  value,
  onChange,
  columns = 1,
}: {
  title: string;
  rationale: string;
  options: ChoiceOption[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <StepWrapper title={title} rationale={rationale}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={cn(
          'grid gap-2',
          columns === 2 && 'sm:grid-cols-2',
          columns === 3 && 'sm:grid-cols-3',
          columns === 5 && 'sm:grid-cols-5'
        )}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
              value === opt.value
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-border hover:border-accent/40 hover:bg-secondary/30'
            )}
          >
            <RadioGroupItem value={opt.value} id={`opt-${opt.value}`} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              {opt.hint && <p className="mt-0.5 text-xs text-muted-foreground">{opt.hint}</p>}
            </div>
          </label>
        ))}
      </RadioGroup>
    </StepWrapper>
  );
}

// ── Multi-Choice Step ───────────────────────────────────────────────────────

function MultiChoiceStep({
  title,
  rationale,
  options,
  values,
  onChange,
}: {
  title: string;
  rationale: string;
  options: ChoiceOption[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (val === 'none') {
      onChange(['none']);
      return;
    }
    const filtered = values.filter((v) => v !== 'none');
    if (filtered.includes(val)) {
      onChange(filtered.filter((v) => v !== val));
    } else {
      onChange([...filtered, val]);
    }
  };

  return (
    <StepWrapper title={title} rationale={rationale}>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                checked
                  ? 'border-accent bg-accent/5 ring-1 ring-accent'
                  : 'border-border hover:border-accent/40 hover:bg-secondary/30'
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(opt.value)}
                id={`svc-${opt.value}`}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                {opt.hint && <p className="mt-0.5 text-xs text-muted-foreground">{opt.hint}</p>}
              </div>
            </label>
          );
        })}
      </div>
    </StepWrapper>
  );
}

// ── Decision Style Step ────────────────────────────────────────────────────

function DecisionStep({
  questionIndex,
  value,
  onChange,
}: {
  questionIndex: number;
  value?: DecisionStyleValue;
  onChange: (v: string) => void;
}) {
  const question = DECISION_STYLE_QUESTIONS[questionIndex];
  return (
    <StepWrapper title={question.question} rationale={question.rationale}>
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        className="space-y-2"
      >
        {question.options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
              value === opt.value
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-border hover:border-accent/40 hover:bg-secondary/30'
            )}
          >
            <RadioGroupItem value={opt.value} id={`ds-${questionIndex}-${opt.value}`} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.hint}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </StepWrapper>
  );
}

// ── Consent Step ────────────────────────────────────────────────────────────

function ConsentStep({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <StepWrapper
      title="Research Consent"
      rationale="Your responses will be used anonymously for academic fraud prevention research."
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This study is conducted by the Sentinel India research initiative.
            Your responses will be stored anonymously and used solely for
            academic research on digital fraud prevention. No personally
            identifying information is collected. You may withdraw at any
            time without consequence.
          </p>
        </div>
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
            checked
              ? 'border-accent bg-accent/5 ring-1 ring-accent'
              : 'border-border hover:border-accent/40'
          )}
        >
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => onChange(v === true)}
            id="consent"
            className="mt-0.5"
          />
          <span className="text-sm leading-relaxed text-foreground">
            I consent to participate in this research study and understand my
            data will be used anonymously for academic fraud prevention research.
          </span>
        </label>
      </div>
    </StepWrapper>
  );
}

// ── Shared Step Wrapper ────────────────────────────────────────────────────

function StepWrapper({
  title,
  rationale,
  children,
}: {
  title: string;
  rationale: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-2 mb-5 flex items-start gap-2 rounded-lg bg-secondary/40 p-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">{rationale}</p>
      </div>
      {children}
    </div>
  );
}
