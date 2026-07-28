/**
 * Translation system for Sentinel India
 *
 * Architecture:
 * - All UI text lives in translation files, never hardcoded
 * - English is the primary language (fully translated)
 * - Hindi, Tamil, Kannada, Telugu are architecturally ready (stubs)
 * - Each locale has its own file with the same key structure
 * - A `t()` function resolves keys with dot notation: t('nav.home')
 * - Missing keys fall back to English
 */

import type { Locale } from '@/types';

export type TranslationKey = string;

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

// ── English (Primary) ───────────────────────────────────────────────────────

export const en: TranslationMessages = {
  nav: {
    home: 'Home',
    about: 'About',
    assessment: 'Assessment',
    dashboard: 'Dashboard',
    privacy: 'Privacy',
    accessibility: 'Accessibility',
    admin: 'Admin',
  },
  common: {
    appName: 'Sentinel India',
    tagline: 'Understand. Identify. Resist.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    takeAssessment: 'Take Assessment',
    viewResults: 'View Results',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again',
    close: 'Close',
    optional: 'optional',
    required: 'required',
  },
  landing: {
    hero: {
      title: 'Your Shield Against Digital Fraud',
      subtitle: 'An AI-assisted behavioral research platform that helps you identify, understand, and resist digital fraud.',
      cta: 'Start Your Safety Assessment',
      secondaryCta: 'Explore the Platform',
    },
    stats: {
      participants: 'Research Participants',
      scenarios: 'Assessment Scenarios',
      metrics: 'Behavioral Metrics',
      languages: 'Languages Supported',
    },
    features: {
      title: 'How Sentinel India Works',
      subtitle: 'A research-grade behavioral assessment platform designed for India\'s digital landscape.',
      adaptive: {
        title: 'Adaptive Assessment',
        description: 'Scenarios adapt to your age, occupation, and digital habits for relevant evaluation.',
      },
      behavioral: {
        title: 'Behavioral Metrics',
        description: '10 hidden metrics measure your fraud susceptibility across multiple dimensions.',
      },
      profile: {
        title: 'Digital Safety Profile',
        description: 'Receive a personalized safety profile with actionable recommendations.',
      },
      voice: {
        title: 'Voice Support',
        description: 'Optional voice narration for accessibility and multilingual support.',
      },
      multilingual: {
        title: 'Multilingual Ready',
        description: 'Architecture supports English, Hindi, Tamil, Kannada, and Telugu.',
      },
      research: {
        title: 'Research Quality Data',
        description: 'Anonymous behavioral data collection for academic fraud research.',
      },
    },
    cta: {
      title: 'Ready to Test Your Digital Safety?',
      subtitle: 'Join thousands of participants in India\'s largest behavioral fraud research study.',
      button: 'Begin Assessment',
    },
  },
  about: {
    title: 'About Sentinel India',
    mission: {
      title: 'Our Mission',
      description: 'Sentinel India is a behavioral research and education platform dedicated to understanding how Indians interact with digital fraud. We collect research-quality behavioral data to build better fraud prevention tools.',
    },
    research: {
      title: 'Research Goals',
      points: 'Understand behavioral patterns. Develop adaptive tools. Create education materials. Build Indian fraud dataset.',
    },
    privacy: {
      title: 'Privacy First',
      description: 'All participation is anonymous. We collect only research-relevant behavioral data — no personally identifiable information is stored.',
    },
  },
  assessment: {
    intro: {
      title: 'Digital Safety Assessment',
      subtitle: 'This assessment takes approximately 10 minutes. Your responses are anonymous and used only for research.',
      consent: 'I consent to participate in this research study and understand my data will be used anonymously.',
      start: 'Begin Assessment',
    },
    profile: {
      title: 'Tell Us About You',
      subtitle: 'This helps us customize your assessment scenarios. All data is anonymous.',
      ageBracket: 'Age Group',
      occupation: 'Occupation',
      digitalHabitLevel: 'Digital Usage Level',
      scamExperience: 'Have you ever been targeted by a scam?',
      continue: 'Continue to Assessment',
    },
    scenario: {
      title: 'Scenario',
      of: 'of',
      question: 'What would you do?',
      confidence: 'How confident are you in your answer?',
      submit: 'Submit Answer',
      voice: 'Listen to scenario',
      voiceStop: 'Stop voice',
      timeRemaining: 'Time remaining',
    },
    complete: {
      title: 'Assessment Complete',
      subtitle: 'Your Digital Safety Profile is ready.',
      viewProfile: 'View My Safety Profile',
    },
  },
  results: {
    title: 'Your Digital Safety Profile',
    subtitle: 'Based on your assessment responses, here is your personalized fraud susceptibility analysis.',
    overallScore: 'Overall Safety Score',
    riskLevel: 'Risk Level',
    persona: 'Your Persona',
    strengths: 'Your Strengths',
    vulnerabilities: 'Areas for Improvement',
    recommendations: 'Personalized Recommendations',
    metrics: 'Behavioral Metrics',
    retake: 'Retake Assessment',
    share: 'Share Results',
    download: 'Download Report',
  },
  dashboard: {
    title: 'Research Dashboard',
    subtitle: 'Aggregated behavioral analytics from Sentinel India participants.',
    overview: 'Overview',
    demographics: 'Demographics',
    metrics: 'Metric Analysis',
    riskDistribution: 'Risk Distribution',
    categoryPerformance: 'Category Performance',
    totalParticipants: 'Total Participants',
    completedAssessments: 'Completed Assessments',
    averageScore: 'Average Safety Score',
    avgScoreByDemographic: 'Average Score by Demographic',
  },
  admin: {
    title: 'Admin Panel',
    login: 'Admin Login',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    scenarios: 'Scenario Management',
    analytics: 'Analytics',
    participants: 'Participants',
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your data.',
    dataCollection: {
      title: 'What We Collect',
      description: 'We collect anonymous behavioral data including: age bracket, occupation, digital usage level, assessment responses, response timing, and confidence levels. We do NOT collect names, emails, phone numbers, or any personally identifiable information.',
    },
    dataUse: {
      title: 'How We Use Data',
      description: 'Your anonymous data is used exclusively for academic research on digital fraud behavior patterns in India. Aggregated, non-identifiable data may be shared in research publications.',
    },
    dataRetention: {
      title: 'Data Retention',
      description: 'Anonymous behavioral data is retained indefinitely for longitudinal research. You can request data deletion at any time by contacting our research team.',
    },
  },
  accessibility: {
    title: 'Accessibility',
    subtitle: 'Sentinel India is committed to WCAG 2.2 AA compliance.',
    features: {
      title: 'Accessibility Features',
      keyboard: 'Full keyboard navigation support',
      screenReader: 'Screen reader compatible with semantic HTML',
      voice: 'Optional voice narration for all assessment scenarios',
      contrast: 'High contrast color ratios meeting WCAG AA standards',
      motion: 'Respects reduced motion preferences',
      touch: 'Large touch targets for mobile accessibility',
    },
    report: {
      title: 'Report an Accessibility Issue',
      description: 'If you encounter an accessibility barrier, please let us know.',
    },
  },
  error: {
    title: 'Something Went Wrong',
    subtitle: 'An unexpected error occurred. Please try again.',
    notFound: {
      title: 'Page Not Found',
      subtitle: 'The page you are looking for does not exist.',
    },
  },
  feedback: {
    title: 'Feedback',
    type: 'Type',
    message: 'Message',
    rating: 'Rating',
    submit: 'Submit Feedback',
    success: 'Thank you for your feedback!',
  },
};

// ── Hindi (Stub — Architecture Ready) ───────────────────────────────────────

export const hi: TranslationMessages = {
  nav: {
    home: 'होम',
    about: 'हमारे बारे में',
    assessment: 'मूल्यांकन',
    dashboard: 'डैशबोर्ड',
    privacy: 'गोपनीयता',
    accessibility: 'सुलभता',
    admin: 'व्यवस्थापक',
  },
  common: {
    appName: 'Sentinel India',
    tagline: 'समझें। पहचानें। प्रतिरोध करें।',
    getStarted: 'शुरू करें',
    learnMore: 'और जानें',
    takeAssessment: 'मूल्यांकन लें',
    viewResults: 'परिणाम देखें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    loading: 'लोड हो रहा है...',
    error: 'कुछ गलत हुआ',
    retry: 'पुनः प्रयास करें',
    close: 'बंद करें',
    optional: 'वैकल्पिक',
    required: 'आवश्यक',
  },
};

// ── Tamil, Kannada, Telugu (Stubs) ───────────────────────────────────────────

export const ta: TranslationMessages = {};
export const kn: TranslationMessages = {};
export const te: TranslationMessages = {};

// ── Registry ────────────────────────────────────────────────────────────────

export const translations: Record<Locale, TranslationMessages> = {
  en,
  hi,
  ta,
  kn,
  te,
};

export function getTranslation(
  locale: Locale,
  key: TranslationKey
): string {
  const parts = key.split('.');
  let current: TranslationMessages | string = translations[locale] || en;

  for (const part of parts) {
    if (typeof current === 'string') return key;
    current = (current as TranslationMessages)[part];
    if (current === undefined) {
      // Fall back to English
      let fallback: TranslationMessages | string = en;
      for (const p of parts) {
        if (typeof fallback === 'string') return key;
        fallback = (fallback as TranslationMessages)[p];
        if (fallback === undefined) return key;
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }

  return typeof current === 'string' ? current : key;
}
