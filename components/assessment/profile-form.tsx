'use client';

import type { ParticipantInput } from '@/lib/validation/schemas';
import {
  AGE_BRACKETS,
  OCCUPATIONS,
  DIGITAL_HABITS,
  SCAM_EXPERIENCES,
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
  loading?: boolean;
}

export function ProfileForm({ onSubmit, loading = false }: ProfileFormProps) {
  const [consent, setConsent] = useState(false);
  const [ageBracket, setAgeBracket] = useState('');
  const [occupation, setOccupation] = useState('');
  const [digitalHabit, setDigitalHabit] = useState('');
  const [scamExperience, setScamExperience] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!ageBracket) newErrors.ageBracket = 'Please select your age group';
    if (!occupation) newErrors.occupation = 'Please select your occupation';
    if (!digitalHabit) newErrors.digitalHabit = 'Please select your digital usage level';
    if (!scamExperience) newErrors.scamExperience = 'Please select your scam experience';
    if (!consent) newErrors.consent = 'You must provide consent to participate';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      ageBracket: ageBracket as ParticipantInput['ageBracket'],
      occupation: occupation as ParticipantInput['occupation'],
      digitalHabitLevel: digitalHabit as ParticipantInput['digitalHabitLevel'],
      scamExperience: scamExperience as ParticipantInput['scamExperience'],
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

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            Continue to Assessment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
