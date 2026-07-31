/**
 * SIA Conversation Scripts
 *
 * Natural, non-repetitive dialogue variants.
 * Each category has multiple variants; SIA picks randomly while
 * tracking recently-used phrases to avoid immediate repetition.
 */

export type ScriptCategory =
  | 'greeting'
  | 'platformIntro'
  | 'anonymity'
  | 'assessmentIntro'
  | 'consentPrompt'
  | 'profileIntro'
  | 'scenarioIntro'
  | 'scenarioRead'
  | 'acknowledgement'
  | 'encouragement'
  | 'progress'
  | 'completion'
  | 'resultsIntro'
  | 'resultsExplanation'
  | 'farewell'
  | 'voicePrompt'
  | 'thinking'
  | 'patience';

const RECENT_LIMIT = 5;

const SCRIPTS: Record<ScriptCategory, string[]> = {
  greeting: [
    "Welcome. I'm SIA, your digital safety guide for today.",
    "Hello, and thank you for joining. I'm SIA, and I'll be with you throughout this assessment.",
    "It's great to have you here. I'm SIA, your companion for this digital safety journey.",
    "Thank you for participating. I'm SIA, and I'll walk you through everything step by step.",
    "Welcome aboard. I'm SIA, here to guide you through your digital safety assessment.",
  ],

  platformIntro: [
    "This platform is designed to help you understand how you respond to digital fraud scenarios in a safe, judgment-free space.",
    "Sentinel India is a behavioral research platform. It helps you recognize and resist digital fraud patterns.",
    "Think of this as a learning experience. You'll encounter realistic scenarios and discover your behavioral patterns.",
    "This is a research-grade tool that measures your digital safety instincts across several dimensions.",
  ],

  anonymity: [
    "Everything you share here is completely anonymous. No names, no emails, no phone numbers. Only behavioral patterns.",
    "Your privacy is protected. We collect no personally identifiable information. Your responses are research data only.",
    "You remain anonymous throughout. Nothing you answer can be traced back to you.",
    "Rest assured, this is fully anonymous. We study behavioral patterns, not identities.",
  ],

  assessmentIntro: [
    "The assessment takes about ten minutes. You'll see realistic scenarios based on actual fraud patterns in India.",
    "You'll work through a series of scenarios inspired by real fraud cases. There are no trick questions.",
    "Each scenario presents a situation you might genuinely face. Simply choose what you would actually do.",
    "You'll encounter scenarios drawn from real digital fraud patterns across India. Answer honestly, and rate your confidence after each.",
  ],

  consentPrompt: [
    "Before we begin, please review and provide your consent to participate in this research.",
    "I need your consent to proceed. You can find the consent details on the form below.",
    "Please read the consent statement and confirm your participation when you're ready.",
    "Your consent is important. Take a moment to review the terms below.",
  ],

  profileIntro: [
    "Let's start with a few basic questions to customize your assessment. This takes less than a minute.",
    "I'll ask a few quick questions about your background. This helps tailor the scenarios to you.",
    "A few quick details will help me select the most relevant scenarios for you.",
    "Let's begin with some basic information so I can personalize your experience.",
  ],

  scenarioIntro: [
    "Here's your next scenario. Take your time to read it carefully.",
    "Let's look at this situation together.",
    "Here's a new scenario for you to consider.",
    "I'd like you to think about this next situation.",
    "Take a look at this scenario, and choose what feels right to you.",
  ],

  scenarioRead: [
    "I'll read this scenario for you.",
    "Let me narrate this one.",
    "Here's what's happening in this scenario.",
    "I'll walk you through this situation.",
  ],

  acknowledgement: [
    "Thank you. I've recorded your response.",
    "That's helpful. Let's continue.",
    "Got it. I've noted your answer.",
    "Thank you for that. Let's move on.",
    "I've recorded your response. Let's continue.",
    "Noted. Let's proceed to the next one.",
  ],

  encouragement: [
    "Take your time. There's no rush.",
    "It's okay to think carefully before answering. That's actually wise.",
    "You're doing well. Trust your instincts.",
    "There's no wrong pace here. Just answer honestly.",
    "I appreciate your thoughtful approach to this.",
  ],

  progress: [
    "You're making excellent progress.",
    "We're about halfway through now.",
    "Only a few scenarios remain.",
    "You're doing great. Just a few more to go.",
    "We're nearly there. Keep going.",
    "You've completed most of the assessment. Well done.",
  ],

  completion: [
    "Congratulations. You've completed the assessment.",
    "You've finished all the scenarios. That's wonderful.",
    "Well done. You've completed the entire assessment.",
    "That's the last one done. Thank you for your patience.",
  ],

  resultsIntro: [
    "Let's review your personalized Digital Safety Profile.",
    "Here's your Digital Safety Profile, based on your responses.",
    "I've prepared your personalized safety analysis. Let's walk through it together.",
    "Your results are ready. Let me explain what they mean.",
  ],

  resultsExplanation: [
    "Your overall safety score reflects how well you identify and resist digital fraud. Higher scores mean stronger safety instincts.",
    "This profile shows your behavioral strengths and areas where you might be more vulnerable. Use it as a learning tool.",
    "Each metric measures a different aspect of your digital safety behavior. Your strengths are highlighted, along with areas for improvement.",
    "Your radar chart shows your scores across all behavioral dimensions. The recommendations below are tailored to your specific profile.",
  ],

  farewell: [
    "Thank you for participating. Stay safe, and remember to verify before you trust.",
    "I hope this was helpful. Be vigilant out there, and take care.",
    "Thank you for your time. Remember, a moment of caution can save you from a lifetime of regret.",
    "It was a pleasure guiding you. Stay alert, stay safe, and take care of yourself.",
    "Thank you for being part of this research. Wishing you a safe digital journey ahead.",
  ],

  voicePrompt: [
    "I'd love to guide you through this assessment with voice. Click below to enable the voice guide.",
    "To hear me narrate each step, please enable voice by clicking below.",
    "Would you like me to talk you through this? Click to enable voice guidance.",
    "Enable voice below, and I'll walk you through everything out loud.",
  ],

  thinking: [
    "Let me think for a moment.",
    "Just a second...",
    "Processing your response...",
    "Let me prepare the next step.",
  ],

  patience: [
    "No rush at all. Take all the time you need.",
    "I'm here whenever you're ready.",
    "There's no timer. Answer when you feel comfortable.",
    "I'll wait. Take your time with this one.",
  ],
};

// ── Variant selector with anti-repetition ─────────────────────────────────

const recentHistory: ScriptCategory[] = [];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getScript(category: ScriptCategory): string {
  const variants = SCRIPTS[category];
  if (!variants || variants.length === 0) return '';

  // Simple anti-repetition: if this category was used very recently,
  // we still pick randomly but the caller can track and avoid re-using
  recentHistory.push(category);
  if (recentHistory.length > RECENT_LIMIT) {
    recentHistory.shift();
  }

  return pickRandom(variants);
}

/**
 * Get a script that's different from the last one returned for the same category.
 * Tracks per-category history to avoid back-to-back repetition.
 */
const lastByCategory: Record<string, string> = {};

export function getUniqueScript(category: ScriptCategory): string {
  const variants = SCRIPTS[category];
  if (!variants || variants.length === 0) return '';

  const last = lastByCategory[category];
  if (variants.length === 1) {
    lastByCategory[category] = variants[0];
    return variants[0];
  }

  let candidate = pickRandom(variants);
  // Try up to 5 times to get a different one
  for (let i = 0; i < 5 && candidate === last; i++) {
    candidate = pickRandom(variants);
  }
  lastByCategory[category] = candidate;
  return candidate;
}

/**
 * Build a dynamic scenario introduction that includes the scenario title.
 */
export function getScenarioIntro(title: string): string {
  const prefix = getUniqueScript('scenarioIntro');
  return `${prefix} ${title}.`;
}

/**
 * Build a progress message with actual numbers.
 */
export function getProgressMessage(current: number, total: number): string {
  const base = getUniqueScript('progress');
  const remaining = total - current - 1;

  if (current === 0) {
    return `Let's begin. ${base}`;
  }
  if (remaining === 1) {
    return `${base} Just one scenario left.`;
  }
  if (remaining <= 3) {
    return `${base} Only ${remaining} scenarios remain.`;
  }
  if (current + 1 === Math.ceil(total / 2)) {
    return `${base} We're now halfway through.`;
  }
  return base;
}

/**
 * Build a results narration based on actual score.
 */
export function getResultsNarration(
  overallScore: number,
  riskLevel: string,
  topStrength: string | null,
  topVulnerability: string | null
): string {
  const intro = getUniqueScript('resultsIntro');
  const explanation = getUniqueScript('resultsExplanation');

  let detail = '';
  if (topStrength && topVulnerability) {
    detail = ` Your strongest area is ${topStrength}. The area that needs the most attention is ${topVulnerability}.`;
  }

  const riskPhrase =
    riskLevel === 'low'
      ? ' You have a low risk profile, which is excellent.'
      : riskLevel === 'moderate'
        ? ' Your risk level is moderate. With some awareness, you can strengthen your defenses.'
        : riskLevel === 'elevated'
          ? ' Your risk level is elevated. I recommend reviewing the recommendations carefully.'
          : riskLevel === 'high'
            ? ' Your risk level is high. Please take the recommendations seriously.'
            : ' Your risk level is critical. I strongly encourage you to study the safety recommendations.';

  return `${intro} Your overall safety score is ${overallScore} out of 100.${riskPhrase}${detail} ${explanation}`;
}
