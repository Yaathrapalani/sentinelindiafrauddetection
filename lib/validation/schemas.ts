import { z } from 'zod';

export const ageBracketSchema = z.enum(['18-25', '26-35', '36-50', '51-65', '65+']);
export const occupationSchema = z.enum([
  'student',
  'professional',
  'business',
  'homemaker',
  'retired',
  'government',
  'other',
]);
export const digitalHabitSchema = z.enum(['low', 'moderate', 'high']);
export const scamExperienceSchema = z.enum([
  'none',
  'attempted',
  'victim',
  'witnessed',
]);

export const digitalServiceSchema = z.enum([
  'upi',
  'online_banking',
  'shopping',
  'social_media',
  'food_delivery',
  'ride_hailing',
  'investments',
  'email',
]);

export const digitalConfidenceSchema = z.enum([
  'very-low',
  'low',
  'moderate',
  'high',
  'very-high',
]);

export const exposureFrequencySchema = z.enum([
  'never',
  'rarely',
  'monthly',
  'weekly',
  'daily',
]);

export const decisionStyleResponseSchema = z.enum([
  'pause',
  'verify',
  'act',
  'comply',
]);

export const decisionStyleSchema = z.object({
  urgencyResponse: decisionStyleResponseSchema,
  authorityResponse: decisionStyleResponseSchema,
  unexpectedResponse: decisionStyleResponseSchema,
});

export const localeSchema = z.enum(['en', 'hi', 'ta', 'kn', 'te']);

export const participantSchema = z.object({
  ageBracket: ageBracketSchema,
  occupation: occupationSchema,
  digitalHabitLevel: digitalHabitSchema,
  scamExperience: scamExperienceSchema,
  digitalServices: z.array(digitalServiceSchema).default([]),
  digitalConfidence: digitalConfidenceSchema,
  exposureFrequency: exposureFrequencySchema,
  decisionStyle: decisionStyleSchema,
  locale: localeSchema.default('en'),
  consentGiven: z.boolean().refine((v) => v === true, {
    message: 'You must provide consent to participate',
  }),
});

export const responseSchema = z.object({
  scenarioId: z.string().uuid(),
  optionId: z.string().uuid(),
  responseType: z.enum(['safe', 'cautious', 'risky', 'critical']),
  timeSpentMs: z.number().int().min(0).max(120000),
  confidenceLevel: z.number().int().min(1).max(5),
  usedVoice: z.boolean().default(false),
});

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'suggestion', 'praise', 'content', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  page: z.string().max(200),
});

export const assessmentStartSchema = z.object({
  participantId: z.string().uuid(),
  locale: localeSchema.default('en'),
});

export type ParticipantInput = z.infer<typeof participantSchema>;
export type ResponseInput = z.infer<typeof responseSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type AssessmentStartInput = z.infer<typeof assessmentStartSchema>;
