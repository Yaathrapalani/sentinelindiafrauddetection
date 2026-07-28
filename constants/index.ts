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

// ── Digital Services (multi-select) ──────────────────────────────────────────

export const DIGITAL_SERVICES = [
  { value: 'upi', label: 'UPI / Payment Apps', hint: 'PhonePe, Google Pay, Paytm' },
  { value: 'online-banking', label: 'Online Banking', hint: 'Net banking, mobile banking' },
  { value: 'shopping', label: 'Online Shopping', hint: 'Amazon, Flipkart, Myntra' },
  { value: 'social-media', label: 'Social Media', hint: 'Instagram, Facebook, WhatsApp' },
  { value: 'messaging', label: 'Messaging Apps', hint: 'WhatsApp, Telegram' },
  { value: 'email', label: 'Email', hint: 'Gmail, Outlook' },
  { value: 'govt-portals', label: 'Government Portals', hint: 'Aadhaar, PAN, DigiLocker' },
  { value: 'investments', label: 'Investment / Trading', hint: 'Stocks, mutual funds, crypto' },
  { value: 'gaming', label: 'Online Gaming', hint: 'Mobile games, fantasy sports' },
  { value: 'streaming', label: 'Streaming / Entertainment', hint: 'YouTube, Netflix, OTT' },
  { value: 'none', label: 'None of these', hint: 'I use very few digital services' },
] as const;

// ── Digital Confidence ──────────────────────────────────────────────────────

export const DIGITAL_CONFIDENCE_LEVELS = [
  { value: 'very-low', label: 'Very Low', hint: 'I feel unsure using most digital services' },
  { value: 'low', label: 'Low', hint: 'I can do basics but feel uncertain often' },
  { value: 'moderate', label: 'Moderate', hint: 'I am comfortable with everyday tasks' },
  { value: 'high', label: 'High', hint: 'I am confident exploring new apps and services' },
  { value: 'very-high', label: 'Very High', hint: 'I help others with digital tasks' },
] as const;

// ── Exposure Frequency ─────────────────────────────────────────────────────

export const EXPOSURE_FREQUENCIES = [
  { value: 'never', label: 'Never', hint: 'I have never encountered a scam attempt' },
  { value: 'rarely', label: 'Rarely', hint: 'Maybe once or twice a year' },
  { value: 'monthly', label: 'Monthly', hint: 'A few times a month' },
  { value: 'weekly', label: 'Weekly', hint: 'Almost every week' },
  { value: 'daily', label: 'Daily', hint: 'Multiple times a week or daily' },
] as const;

// ── Decision Style ──────────────────────────────────────────────────────────

export const DECISION_STYLE_QUESTIONS = [
  {
    key: 'urgency_response' as const,
    question: 'When someone says you must act immediately or lose something important, what do you usually do?',
    rationale: 'Helps us understand your natural response to urgency tactics — a common scam technique.',
    options: [
      { value: 'act-fast' as const, label: 'Act quickly to avoid losing out', hint: 'I prioritize speed' },
      { value: 'verify-first' as const, label: 'Pause and verify before acting', hint: 'I check first' },
      { value: 'ask-someone' as const, label: 'Ask someone I trust for advice', hint: 'I seek a second opinion' },
      { value: 'ignore' as const, label: 'Ignore it — it is probably not urgent', hint: 'I dismiss urgency claims' },
    ],
  },
  {
    key: 'authority_response' as const,
    question: 'If someone claims to be from the government, police, or your bank, how do you usually respond?',
    rationale: 'Helps us understand how authority claims affect your decision-making.',
    options: [
      { value: 'act-fast' as const, label: 'Follow their instructions', hint: 'I trust authority figures' },
      { value: 'verify-first' as const, label: 'Ask for proof and verify independently', hint: 'I confirm identity first' },
      { value: 'ask-someone' as const, label: 'Consult family or friends first', hint: 'I seek advice' },
      { value: 'ignore' as const, label: 'Be suspicious and end the conversation', hint: 'I distrust unsolicited contact' },
    ],
  },
  {
    key: 'unexpected_response' as const,
    question: 'When you receive an unexpected message about money, a package, or a prize, what is your first instinct?',
    rationale: 'Helps us understand your baseline trust for unexpected digital communications.',
    options: [
      { value: 'act-fast' as const, label: 'Check it out — it might be real', hint: 'I explore opportunities' },
      { value: 'verify-first' as const, label: 'Research before clicking or responding', hint: 'I investigate first' },
      { value: 'ask-someone' as const, label: 'Ask family or friends if it is legit', hint: 'I get a second opinion' },
      { value: 'ignore' as const, label: 'Delete or ignore it', hint: 'I dismiss unexpected messages' },
    ],
  },
];

// ── Onboarding Step Configuration ────────────────────────────────────────────

export const ONBOARDING_STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'language', label: 'Language' },
  { id: 'age', label: 'Age' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'services', label: 'Digital Life' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'exposure', label: 'Exposure' },
  { id: 'decision-1', label: 'Decision Style' },
  { id: 'decision-2', label: 'Decision Style' },
  { id: 'decision-3', label: 'Decision Style' },
  { id: 'consent', label: 'Consent' },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

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
