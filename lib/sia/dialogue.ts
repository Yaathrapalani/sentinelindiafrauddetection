import type { SIADialogue, AgeAdaptedDialogue, AgeCohort } from '@/types/sia';
import type { AgeBracket, ScenarioCategory } from '@/types';

export function getAgeCohort(bracket?: AgeBracket | string): AgeCohort {
  if (!bracket) return 'middle';
  if (bracket === '18-25' || bracket === '26-35') return 'young';
  if (bracket === '65+') return 'senior';
  return 'middle';
}

const SHARED: SIADialogue = {
  welcome: [
    "Hello! I'm SIA.",
    "I'll be your Digital Safety Companion today.",
  ],
  introduction: [
    "This assessment takes around five minutes.",
    "There's no pass or fail.",
    "We're interested in how people naturally respond to digital situations.",
    "At the end, you'll receive your own Digital Safety Profile.",
  ],
  profileGuidance: [
    "First, a few questions to personalize your experience.",
    "Everything stays anonymous.",
  ],
  scenarioIntro: {
    default: ["Let's look at a new situation."],
    phishing: [
      "This next situation involves a suspicious message.",
      "Phishing attempts have become very common in India.",
    ],
    investment: [
      "This next situation involves an investment opportunity.",
      "Investment fraud has affected many people across the country.",
    ],
    impersonation: [
      "This next scenario involves someone pretending to be someone you know.",
      "Impersonation scams are among the most reported in India.",
    ],
    urgency: [
      "This next situation involves a request that feels urgent.",
      "Urgency is one of the most common tactics scammers use.",
    ],
    authority: [
      "This next situation involves someone claiming authority.",
      "Authority scams often target people through phone calls or messages.",
    ],
    social: [
      "This next situation involves a social interaction.",
      "Social engineering scams exploit trust and familiarity.",
    ],
    recovery: [
      "This next situation involves what happens after a fraud has occurred.",
      "Recovery scams target people who have already been victimized.",
    ],
    reporting: [
      "This next situation is about reporting fraud.",
      "Knowing how to report is just as important as recognizing scams.",
    ],
  },
  observing: ["Take your time."],
  waiting: [
    "There isn't a right or wrong answer.",
    "We're interested in your natural decision.",
  ],
  encouraging: [
    "You're doing well.",
    "Your Digital Safety Profile is taking shape.",
  ],
  thinking: ["Let me process that."],
  progressUpdate: {
    quarter: ["You're off to a good start."],
    halfway: ["You're halfway through."],
    threeQuarters: ["You're making great progress."],
    finalStretch: ["Only a few scenarios remain."],
  },
  answerAcknowledgment: [
    "Thank you.",
    "That tells us something useful.",
    "Interesting.",
    "Let's continue.",
  ],
  resultsIntro: [
    "Congratulations.",
    "You've completed the assessment.",
    "Let's review your Digital Safety Profile together.",
  ],
  resultsReveal: [
    "Here's your overall safety score.",
    "These are your behavioral metrics.",
    "These are your strengths.",
    "Here are areas where you can grow.",
    "And here are your personalized recommendations.",
  ],
  goodbye: [
    "Thank you for contributing to fraud prevention research.",
    "Stay safe, and remember: pause, verify, then act.",
  ],
};

const YOUNG_ADAPTATIONS: Partial<SIADialogue> = {
  scenarioIntro: {
    ...SHARED.scenarioIntro,
    phishing: [
      "This next situation involves a suspicious message.",
      "These often come through gaming platforms, social media, or internship offers.",
    ],
    social: [
      "This next situation involves a social interaction.",
      "Think about how this might play out on social media or a messaging app.",
    ],
    investment: [
      "This next situation involves an investment opportunity.",
      "These often target young people through social media ads or influencer promotions.",
    ],
  },
  encouraging: [
    "You're doing well.",
    "Your Digital Safety Profile is taking shape.",
    "Every answer helps us understand how young people navigate digital risks.",
  ],
};

const SENIOR_ADAPTATIONS: Partial<SIADialogue> = {
  scenarioIntro: {
    ...SHARED.scenarioIntro,
    impersonation: [
      "This next scenario involves someone pretending to be a family member.",
      "Family impersonation scams often target older adults through phone calls.",
    ],
    urgency: [
      "This next situation involves a request that feels urgent.",
      "These scams often involve courier deliveries or fake package notifications.",
    ],
    authority: [
      "This next situation involves someone claiming to be from your bank or the government.",
      "KYC fraud and banking scams frequently target older adults.",
    ],
    investment: [
      "This next situation involves an investment opportunity.",
      "Pension fraud and fake investment schemes often target retirees.",
    ],
  },
  encouraging: [
    "You're doing well.",
    "Your Digital Safety Profile is taking shape.",
    "Your experience helps us protect others in your community.",
  ],
};

function mergeDialogue(base: SIADialogue, overrides: Partial<SIADialogue>): SIADialogue {
  return {
    ...base,
    ...overrides,
    scenarioIntro: {
      ...base.scenarioIntro,
      ...(overrides.scenarioIntro || {}),
    },
    progressUpdate: {
      ...base.progressUpdate,
      ...(overrides.progressUpdate || {}),
    },
  };
}

export const SIA_DIALOGUE: AgeAdaptedDialogue = {
  young: mergeDialogue(SHARED, YOUNG_ADAPTATIONS),
  middle: SHARED,
  senior: mergeDialogue(SHARED, SENIOR_ADAPTATIONS),
};

export function getDialogue(cohort: AgeCohort): SIADialogue {
  return SIA_DIALOGUE[cohort];
}

export function getScenarioIntro(
  category: ScenarioCategory,
  cohort: AgeCohort
): string[] {
  const dialogue = getDialogue(cohort);
  return dialogue.scenarioIntro[category] || dialogue.scenarioIntro.default;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
