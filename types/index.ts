/**
 * Core domain types for Sentinel India
 * Behavioral digital fraud prevention research platform
 */

// ── Languages ──────────────────────────────────────────────────────────────

export type Locale = 'en' | 'hi' | 'ta' | 'kn' | 'te';

export interface LanguageOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  enabled: boolean;
}

// ── Participant / User ────────────────────────────────────────────────────

export type AgeBracket = '18-25' | '26-35' | '36-50' | '51-65' | '65+';

export type Occupation =
  | 'student'
  | 'professional'
  | 'business'
  | 'homemaker'
  | 'retired'
  | 'government'
  | 'other';

export type DigitalHabitLevel = 'low' | 'moderate' | 'high';

export type ScamExperience = 'none' | 'attempted' | 'victim' | 'witnessed';

export type DigitalService =
  | 'upi'
  | 'online-banking'
  | 'shopping'
  | 'social-media'
  | 'messaging'
  | 'email'
  | 'govt-portals'
  | 'investments'
  | 'gaming'
  | 'streaming'
  | 'none';

export type DigitalConfidence =
  | 'very-low'
  | 'low'
  | 'moderate'
  | 'high'
  | 'very-high';

export type ExposureFrequency =
  | 'never'
  | 'rarely'
  | 'monthly'
  | 'weekly'
  | 'daily';

export type DecisionStyleKey =
  | 'urgency_response'
  | 'authority_response'
  | 'unexpected_response';

export type DecisionStyleValue = 'act-fast' | 'verify-first' | 'ask-someone' | 'ignore';

export type DecisionStyle = Record<DecisionStyleKey, DecisionStyleValue>;

export interface ParticipantProfile {
  id: string;
  anonymousId: string;
  ageBracket: AgeBracket;
  occupation: Occupation;
  digitalHabitLevel: DigitalHabitLevel;
  scamExperience: ScamExperience;
  digitalServices: DigitalService[];
  digitalConfidence: DigitalConfidence | null;
  exposureFrequency: ExposureFrequency | null;
  decisionStyle: Partial<DecisionStyle>;
  locale: Locale;
  consentGiven: boolean;
  createdAt: string;
  completedAt: string | null;
}

// ── Assessment ─────────────────────────────────────────────────────────────

export type AssessmentStatus =
  | 'intro'
  | 'profile'
  | 'active'
  | 'scoring'
  | 'complete'
  | 'abandoned';

export type ScenarioCategory =
  | 'phishing'
  | 'investment'
  | 'impersonation'
  | 'urgency'
  | 'authority'
  | 'social'
  | 'recovery'
  | 'reporting';

export type ScenarioChannel =
  | 'sms'
  | 'call'
  | 'email'
  | 'social'
  | 'app'
  | 'inperson';

export type ResponseType = 'safe' | 'cautious' | 'risky' | 'critical';

export interface ScenarioOption {
  id: string;
  text: string;
  responseType: ResponseType;
  metricImpacts: Partial<Record<MetricKey, number>>;
  explanation: string;
}

export interface Scenario {
  id: string;
  category: ScenarioCategory;
  channel: ScenarioChannel;
  title: string;
  description: string;
  voiceScript?: string;
  options: ScenarioOption[];
  isCore: boolean;
  difficulty: number;
  tags: string[];
}

export interface ScenarioResponse {
  scenarioId: string;
  optionId: string;
  responseType: ResponseType;
  timeSpentMs: number;
  confidenceLevel: number;
  usedVoice: boolean;
  metricImpacts: Partial<Record<MetricKey, number>>;
  answeredAt: string;
}

export interface AssessmentSession {
  id: string;
  participantId: string;
  status: AssessmentStatus;
  currentScenarioIndex: number;
  scenarioIds: string[];
  responses: ScenarioResponse[];
  startedAt: string;
  completedAt: string | null;
  locale: Locale;
}

// ── Behavioral Metrics ─────────────────────────────────────────────────────

export type MetricKey =
  | 'digitalLiteracy'
  | 'verificationHabit'
  | 'authoritySusceptibility'
  | 'urgencySusceptibility'
  | 'trustCalibration'
  | 'confidenceCalibration'
  | 'aiScamAwareness'
  | 'reportingReadiness'
  | 'recoveryReadiness'
  | 'overallRisk';

export type MetricDirection = 'positive' | 'negative';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  description: string;
  direction: MetricDirection;
  weight: number;
  relatedCategories: ScenarioCategory[];
}

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export interface BehaviorScore {
  participantId: string;
  assessmentId: string;
  scores: Record<MetricKey, number>;
  riskLevel: RiskLevel;
  overallScore: number;
  calculatedAt: string;
}

// ── Digital Safety Profile ────────────────────────────────────────────────

export interface SafetyProfile {
  participantId: string;
  behaviorScore: BehaviorScore;
  strengths: MetricKey[];
  vulnerabilities: MetricKey[];
  recommendations: SafetyRecommendation[];
  personaId: string | null;
  generatedAt: string;
}

export interface SafetyRecommendation {
  id: string;
  metricKey: MetricKey;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: ScenarioCategory;
}

// ── Personas ────────────────────────────────────────────────────────────────

export interface Persona {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  riskLevel: RiskLevel;
  scoreRange: { min: number; max: number };
}

// ── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalParticipants: number;
  completedAssessments: number;
  averageOverallScore: number;
  riskDistribution: Record<RiskLevel, number>;
  metricAverages: Record<MetricKey, number>;
  topVulnerabilities: { metric: MetricKey; averageScore: number }[];
  demographicBreakdown: {
    ageBracket: Record<AgeBracket, number>;
    occupation: Record<Occupation, number>;
    digitalHabitLevel: Record<DigitalHabitLevel, number>;
  };
  categoryPerformance: Record<ScenarioCategory, number>;
  lastUpdated: string;
}

export interface AnalyticsTimeSeriesPoint {
  date: string;
  participants: number;
  completedAssessments: number;
  averageScore: number;
}

// ── Feedback ────────────────────────────────────────────────────────────────

export type FeedbackType = 'bug' | 'suggestion' | 'praise' | 'content' | 'other';

export interface Feedback {
  id: string;
  participantId: string | null;
  type: FeedbackType;
  message: string;
  rating: number | null;
  page: string;
  createdAt: string;
}

// ── Admin / Researcher ──────────────────────────────────────────────────────

export type AdminRole = 'researcher' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  displayName: string;
  createdAt: string;
}

// ── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
