import type { MetricKey, MetricDefinition, LanguageOption, Locale } from '@/types';

// ── Behavioral Metrics ──────────────────────────────────────────────────────

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  digitalLiteracy: {
    key: 'digitalLiteracy',
    label: 'Digital Literacy',
    description:
      'Ability to identify, evaluate, and safely navigate digital platforms and tools.',
    direction: 'positive',
    weight: 1.2,
    relatedCategories: ['phishing', 'social', 'investment'],
  },
  verificationHabit: {
    key: 'verificationHabit',
    label: 'Verification Habit',
    description:
      'Tendency to independently verify claims, identities, and links before acting.',
    direction: 'positive',
    weight: 1.3,
    relatedCategories: ['phishing', 'impersonation', 'social'],
  },
  authoritySusceptibility: {
    key: 'authoritySusceptibility',
    label: 'Authority Susceptibility',
    description:
      'Likelihood of complying with perceived authority figures without independent verification.',
    direction: 'negative',
    weight: 1.4,
    relatedCategories: ['authority', 'impersonation'],
  },
  urgencySusceptibility: {
    key: 'urgencySusceptibility',
    label: 'Urgency Susceptibility',
    description:
      'Tendency to act quickly under time pressure without proper verification.',
    direction: 'negative',
    weight: 1.4,
    relatedCategories: ['urgency', 'phishing'],
  },
  trustCalibration: {
    key: 'trustCalibration',
    label: 'Trust Calibration',
    description:
      'Accuracy of trust assessment — neither over-trusting nor under-trusting unknown contacts.',
    direction: 'positive',
    weight: 1.1,
    relatedCategories: ['social', 'investment', 'recovery'],
  },
  confidenceCalibration: {
    key: 'confidenceCalibration',
    label: 'Confidence Calibration',
    description:
      'Alignment between self-reported confidence and actual response accuracy.',
    direction: 'positive',
    weight: 1.0,
    relatedCategories: ['phishing', 'investment', 'authority'],
  },
  aiScamAwareness: {
    key: 'aiScamAwareness',
    label: 'AI Scam Awareness',
    description:
      'Recognition of AI-enabled fraud techniques including deepfakes, voice cloning, and AI-generated content.',
    direction: 'positive',
    weight: 1.2,
    relatedCategories: ['investment', 'social', 'recovery'],
  },
  reportingReadiness: {
    key: 'reportingReadiness',
    label: 'Reporting Readiness',
    description:
      'Knowledge of and willingness to use official reporting channels after encountering fraud.',
    direction: 'positive',
    weight: 1.1,
    relatedCategories: ['reporting'],
  },
  recoveryReadiness: {
    key: 'recoveryReadiness',
    label: 'Recovery Readiness',
    description:
      'Understanding of post-fraud recovery steps and ability to avoid secondary recovery scams.',
    direction: 'positive',
    weight: 1.0,
    relatedCategories: ['recovery', 'reporting'],
  },
  overallRisk: {
    key: 'overallRisk',
    label: 'Overall Risk',
    description:
      'Composite risk score synthesizing all behavioral metrics into a single risk indicator.',
    direction: 'negative',
    weight: 1.0,
    relatedCategories: [
      'phishing',
      'investment',
      'impersonation',
      'urgency',
      'authority',
      'social',
      'recovery',
      'reporting',
    ],
  },
};

export const METRIC_KEYS = Object.keys(METRIC_DEFINITIONS) as MetricKey[];

export const POSITIVE_METRICS: MetricKey[] = [
  'digitalLiteracy',
  'verificationHabit',
  'trustCalibration',
  'confidenceCalibration',
  'aiScamAwareness',
  'reportingReadiness',
  'recoveryReadiness',
];

export const NEGATIVE_METRICS: MetricKey[] = [
  'authoritySusceptibility',
  'urgencySusceptibility',
  'overallRisk',
];

// ── Risk Levels ─────────────────────────────────────────────────────────────

export const RISK_LEVELS = [
  { level: 'low', label: 'Low Risk', color: 'success', min: 80, max: 100 },
  { level: 'moderate', label: 'Moderate Risk', color: 'accent', min: 60, max: 79 },
  { level: 'elevated', label: 'Elevated Risk', color: 'warning', min: 40, max: 59 },
  { level: 'high', label: 'High Risk', color: 'destructive', min: 20, max: 39 },
  { level: 'critical', label: 'Critical Risk', color: 'destructive', min: 0, max: 19 },
] as const;

// ── Assessment Configuration ────────────────────────────────────────────────

export const ASSESSMENT_CONFIG = {
  CORE_SCENARIO_COUNT: 8,
  ADAPTIVE_SCENARIO_COUNT: 4,
  TOTAL_SCENARIOS: 12,
  MIN_CONFIDENCE: 1,
  MAX_CONFIDENCE: 5,
  DEFAULT_CONFIDENCE: 3,
  MAX_TIME_PER_SCENARIO_MS: 120000,
} as const;

// ── Languages ──────────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', enabled: true },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', enabled: false },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', enabled: false },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', enabled: false },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', enabled: false },
];

export const DEFAULT_LOCALE: Locale = 'en';

// ── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  ASSESSMENT: '/assessment',
  RESULTS: '/assessment/results',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PROFILE: '/profile',
  PRIVACY: '/privacy',
  ACCESSIBILITY: '/accessibility',
} as const;

// ── Navigation ─────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { href: ROUTES.HOME, labelKey: 'nav.home' },
  { href: ROUTES.ABOUT, labelKey: 'nav.about' },
  { href: ROUTES.ASSESSMENT, labelKey: 'nav.assessment' },
  { href: ROUTES.DASHBOARD, labelKey: 'nav.dashboard' },
  { href: ROUTES.PRIVACY, labelKey: 'nav.privacy' },
] as const;

// ── Age Brackets ─────────────────────────────────────────────────────────────

export const AGE_BRACKETS = [
  { value: '18-25', label: '18–25' },
  { value: '26-35', label: '26–35' },
  { value: '36-50', label: '36–50' },
  { value: '51-65', label: '51–65' },
  { value: '65+', label: '65+' },
] as const;

export const OCCUPATIONS = [
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Working Professional' },
  { value: 'business', label: 'Business Owner' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'retired', label: 'Retired' },
  { value: 'government', label: 'Government Employee' },
  { value: 'other', label: 'Other' },
] as const;

export const DIGITAL_HABITS = [
  { value: 'low', label: 'Low — Basic smartphone use, limited apps' },
  { value: 'moderate', label: 'Moderate — Regular use of apps, payments, social media' },
  { value: 'high', label: 'High — Advanced use, multiple devices, online banking' },
] as const;

export const SCAM_EXPERIENCES = [
  { value: 'none', label: 'No, I have never been targeted' },
  { value: 'attempted', label: 'Yes, someone tried to scam me but I avoided it' },
  { value: 'victim', label: 'Yes, I lost money or data to a scam' },
  { value: 'witnessed', label: 'I have seen someone close to me get scammed' },
] as const;

// ── Chart Colors ───────────────────────────────────────────────────────────

export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
];

export const METRIC_CHART_COLOR: Record<MetricKey, string> = {
  digitalLiteracy: 'hsl(var(--chart-1))',
  verificationHabit: 'hsl(var(--chart-2))',
  authoritySusceptibility: 'hsl(var(--chart-4))',
  urgencySusceptibility: 'hsl(var(--chart-8))',
  trustCalibration: 'hsl(var(--chart-5))',
  confidenceCalibration: 'hsl(var(--chart-7))',
  aiScamAwareness: 'hsl(var(--chart-6))',
  reportingReadiness: 'hsl(var(--chart-3))',
  recoveryReadiness: 'hsl(var(--chart-9))',
  overallRisk: 'hsl(var(--chart-4))',
};
