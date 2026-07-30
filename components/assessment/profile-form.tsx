'use client';

import type { ParticipantInput } from '@/lib/validation/schemas';
import {
  AGE_BRACKETS,
  OCCUPATIONS,
  DIGITAL_HABITS,
  SCAM_EXPERIENCES,
  DIGITAL_SERVICES,
  DIGITAL_CONFIDENCE_LEVELS,
  EXPOSURE_FREQUENCIES,
  DECISION_STYLE_OPTIONS,
} from '@/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface ProfileFormProps {
  onSubmit: (data: ParticipantInput) => void;
  submitting?: boolean;
}

export function ProfileForm({ onSubmit, submitting = false }: ProfileFormProps) {
  const [consent, setConsent] = useState(false);
  const [ageBracket, setAgeBracket] = useState('');
  const [occupation, setOccupation] = useState('');
  const [digitalHabit, setDigitalHabit] = useState('');
  const [scamExperience, setScamExperience] = useState('');
  const [digitalServices, setDigitalServices] = useState<string[]>([]);
  const [digitalConfidence, setDigitalConfidence] = useState('');
  const [exposureFrequency, setExposureFrequency] = useState('');
  const [urgencyResponse, setUrgencyResponse] = useState('');
  const [authorityResponse, setAuthorityResponse] = useState('');
  const [unexpectedResponse, setUnexpectedResponse] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (value: string, checked: boolean) => {
    setDigitalServices((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!ageBracket) newErrors.ageBracket = 'Please select your age group';
    if (!occupation) newErrors.occupation = 'Please select your occupation';
    if (!digitalHabit) newErrors.digitalHabit = 'Please select your digital usage level';
    if (!scamExperience) newErrors.scamExperience = 'Please select your scam experience';
    if (!digitalConfidence) newErrors.digitalConfidence = 'Please select your digital confidence';
    if (!exposureFrequency) newErrors.exposureFrequency = 'Please select how often you see scam attempts';
    if (!urgencyResponse) newErrors.urgencyResponse = 'Please select how you usually respond to urgent requests';
    if (!authorityResponse) newErrors.authorityResponse = 'Please select how you usually respond to authority requests';
    if (!unexpectedResponse) newErrors.unexpectedResponse = 'Please select how you usually respond to unexpected requests';
    if (!consent) newErrors.consent = 'You must provide consent to participate';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      ageBracket: ageBracket as ParticipantInput['ageBracket'],
      occupation: occupation as ParticipantInput['occupation'],
      digitalHabitLevel: digitalHabit as ParticipantInput['digitalHabitLevel'],
      scamExperience: scamExperience as ParticipantInput['scamExperience'],
      digitalServices: digitalServices as ParticipantInput['digitalServices'],
      digitalConfidence: digitalConfidence as ParticipantInput['digitalConfidence'],
      exposureFrequency: exposureFrequency as ParticipantInput['exposureFrequency'],
      decisionStyle: {
        urgencyResponse: urgencyResponse as ParticipantInput['decisionStyle']['urgencyResponse'],
        authorityResponse: authorityResponse as ParticipantInput['decisionStyle']['authorityResponse'],
        unexpectedResponse: unexpectedResponse as ParticipantInput['decisionStyle']['unexpectedResponse'],
      },
      locale: 'en',
      consentGiven: consent,
    });
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Tell Us About You</CardTitle>
        <CardDescription className="text-base">
          This helps us customize your assessment scenarios. All data is anonymous.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-semibold">Age Group</Label>
            <RadioGroup
              value={ageBracket}
              onValueChange={setAgeBracket}
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5"
            >
              {AGE_BRACKETS.map((bracket) => (
                <div key={bracket.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={bracket.value} id={`age-${bracket.value}`} />
                  <Label htmlFor={`age-${bracket.value}`} className="cursor-pointer text-sm">
                    {bracket.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.ageBracket && (
              <p className="mt-1 text-sm text-destructive">{errors.ageBracket}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold">Occupation</Label>
            <RadioGroup
              value={occupation}
              onValueChange={setOccupation}
              className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {OCCUPATIONS.map((occ) => (
                <div key={occ.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={occ.value} id={`occ-${occ.value}`} />
                  <Label htmlFor={`occ-${occ.value}`} className="cursor-pointer text-sm">
                    {occ.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.occupation && (
              <p className="mt-1 text-sm text-destructive">{errors.occupation}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold">Digital Usage Level</Label>
            <RadioGroup
              value={digitalHabit}
              onValueChange={setDigitalHabit}
              className="mt-2 space-y-2"
            >
              {DIGITAL_HABITS.map((habit) => (
                <div key={habit.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={habit.value} id={`habit-${habit.value}`} className="mt-0.5" />
                  <Label htmlFor={`habit-${habit.value}`} className="cursor-pointer text-sm">
                    {habit.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.digitalHabit && (
              <p className="mt-1 text-sm text-destructive">{errors.digitalHabit}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold">Digital services you use</Label>
            <p className="mt-1 text-xs text-muted-foreground">Select all that apply (optional)</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DIGITAL_SERVICES.map((service) => (
                <div key={service.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`svc-${service.value}`}
                    checked={digitalServices.includes(service.value)}
                    onCheckedChange={(checked) =>
                      toggleService(service.value, checked === true)
                    }
                  />
                  <Label htmlFor={`svc-${service.value}`} className="cursor-pointer text-sm">
                    {service.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">How confident are you using digital services?</Label>
            <RadioGroup
              value={digitalConfidence}
              onValueChange={setDigitalConfidence}
              className="mt-2 space-y-2"
            >
              {DIGITAL_CONFIDENCE_LEVELS.map((level) => (
                <div key={level.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={level.value} id={`conf-${level.value}`} className="mt-0.5" />
                  <Label htmlFor={`conf-${level.value}`} className="cursor-pointer text-sm">
                    {level.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.digitalConfidence && (
              <p className="mt-1 text-sm text-destructive">{errors.digitalConfidence}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold">How often do you encounter scam attempts?</Label>
            <RadioGroup
              value={exposureFrequency}
              onValueChange={setExposureFrequency}
              className="mt-2 space-y-2"
            >
              {EXPOSURE_FREQUENCIES.map((freq) => (
                <div key={freq.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={freq.value} id={`exp-freq-${freq.value}`} className="mt-0.5" />
                  <Label htmlFor={`exp-freq-${freq.value}`} className="cursor-pointer text-sm">
                    {freq.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.exposureFrequency && (
              <p className="mt-1 text-sm text-destructive">{errors.exposureFrequency}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold">Have you ever been targeted by a scam?</Label>
            <RadioGroup
              value={scamExperience}
              onValueChange={setScamExperience}
              className="mt-2 space-y-2"
            >
              {SCAM_EXPERIENCES.map((exp) => (
                <div key={exp.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={exp.value} id={`exp-${exp.value}`} className="mt-0.5" />
                  <Label htmlFor={`exp-${exp.value}`} className="cursor-pointer text-sm">
                    {exp.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.scamExperience && (
              <p className="mt-1 text-sm text-destructive">{errors.scamExperience}</p>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-4">
            <p className="text-sm font-semibold">How do you usually decide?</p>

            <div>
              <Label className="text-sm text-muted-foreground">When a request feels urgent</Label>
              <RadioGroup
                value={urgencyResponse}
                onValueChange={setUrgencyResponse}
                className="mt-2 space-y-2"
              >
                {DECISION_STYLE_OPTIONS.map((opt) => (
                  <div key={`urg-${opt.value}`} className="flex items-start space-x-2">
                    <RadioGroupItem value={opt.value} id={`urg-${opt.value}`} className="mt-0.5" />
                    <Label htmlFor={`urg-${opt.value}`} className="cursor-pointer text-sm">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.urgencyResponse && (
                <p className="mt-1 text-sm text-destructive">{errors.urgencyResponse}</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">When someone claims to be an authority</Label>
              <RadioGroup
                value={authorityResponse}
                onValueChange={setAuthorityResponse}
                className="mt-2 space-y-2"
              >
                {DECISION_STYLE_OPTIONS.map((opt) => (
                  <div key={`auth-${opt.value}`} className="flex items-start space-x-2">
                    <RadioGroupItem value={opt.value} id={`auth-${opt.value}`} className="mt-0.5" />
                    <Label htmlFor={`auth-${opt.value}`} className="cursor-pointer text-sm">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.authorityResponse && (
                <p className="mt-1 text-sm text-destructive">{errors.authorityResponse}</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">When you get an unexpected request</Label>
              <RadioGroup
                value={unexpectedResponse}
                onValueChange={setUnexpectedResponse}
                className="mt-2 space-y-2"
              >
                {DECISION_STYLE_OPTIONS.map((opt) => (
                  <div key={`unx-${opt.value}`} className="flex items-start space-x-2">
                    <RadioGroupItem value={opt.value} id={`unx-${opt.value}`} className="mt-0.5" />
                    <Label htmlFor={`unx-${opt.value}`} className="cursor-pointer text-sm">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.unexpectedResponse && (
                <p className="mt-1 text-sm text-destructive">{errors.unexpectedResponse}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
              />
              <Label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed">
                I consent to participate in this research study and understand my data
                will be used anonymously for academic fraud prevention research.
              </Label>
            </div>
            {errors.consent && (
              <p className="mt-1 text-sm text-destructive">{errors.consent}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Preparing your assessment...' : 'Continue to Assessment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
