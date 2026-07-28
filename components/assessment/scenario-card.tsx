'use client';

import { cn } from '@/lib/utils';
import type { Scenario, ResponseType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/hooks/use-voice';
import { useEffect, useState } from 'react';

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
  total: number;
  selectedOptionId: string | null;
  confidenceLevel: number;
  onSelectOption: (optionId: string) => void;
  onSetConfidence: (level: number) => void;
  onSubmit: () => void;
  onVoiceUsed: () => void;
}

const RESPONSE_TYPE_LABELS: Record<ResponseType, string> = {
  safe: 'Safe',
  cautious: 'Cautious',
  risky: 'Risky',
  critical: 'Critical',
};

const CATEGORY_LABELS: Record<string, string> = {
  phishing: 'Phishing',
  investment: 'Investment Fraud',
  impersonation: 'Impersonation',
  urgency: 'Urgency Scam',
  authority: 'Authority Scam',
  social: 'Social Engineering',
  recovery: 'Recovery Scam',
  reporting: 'Reporting',
};

const CHANNEL_ICONS: Record<string, string> = {
  sms: 'SMS',
  call: 'Call',
  email: 'Email',
  social: 'Social',
  app: 'App',
  inperson: 'In-Person',
};

export function ScenarioCard({
  scenario,
  index,
  total,
  selectedOptionId,
  confidenceLevel,
  onSelectOption,
  onSetConfidence,
  onSubmit,
  onVoiceUsed,
}: ScenarioCardProps) {
  const { isSupported, isSpeaking, speak, stop } = useVoice();
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVoice = () => {
    if (isSpeaking) {
      stop();
    } else if (scenario.voiceScript) {
      speak(scenario.voiceScript);
      onVoiceUsed();
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {index + 1} of {total}
            </Badge>
            <Badge variant="outline">{CATEGORY_LABELS[scenario.category] || scenario.category}</Badge>
            <Badge variant="outline">{CHANNEL_ICONS[scenario.channel] || scenario.channel}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {isSupported && scenario.voiceScript && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoice}
                aria-label={isSpeaking ? 'Stop voice narration' : 'Play voice narration'}
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="ml-1.5 text-xs">
                  {isSpeaking ? 'Stop' : 'Listen'}
                </span>
              </Button>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
        <CardTitle className="mt-3 text-xl leading-tight">
          {scenario.title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-foreground/80">
          {scenario.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-semibold text-foreground">
            What would you do?
          </legend>
          {scenario.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                  isSelected
                    ? 'border-primary bg-secondary ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                )}
              >
                <input
                  type="radio"
                  name="scenario-option"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelectOption(option.id)}
                  className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                  aria-label={option.text}
                />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{option.text}</p>
                  <span
                    className={cn(
                      'mt-1.5 inline-block rounded px-1.5 py-0.5 text-2xs font-medium',
                      option.responseType === 'safe' && 'bg-success/10 text-success',
                      option.responseType === 'cautious' && 'bg-accent/10 text-accent',
                      option.responseType === 'risky' && 'bg-warning/10 text-warning',
                      option.responseType === 'critical' && 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {RESPONSE_TYPE_LABELS[option.responseType]}
                  </span>
                </div>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-foreground">
              How confident are you in your answer?
            </legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSetConfidence(level)}
                  className={cn(
                    'h-10 flex-1 rounded-md border text-sm font-medium transition-colors',
                    confidenceLevel === level
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-secondary'
                  )}
                  aria-label={`Confidence level ${level} of 5`}
                  aria-pressed={confidenceLevel === level}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-2xs text-muted-foreground">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </fieldset>
        </div>

        <Button
          onClick={onSubmit}
          disabled={!selectedOptionId}
          className="mt-6 w-full"
          size="lg"
        >
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  );
}
