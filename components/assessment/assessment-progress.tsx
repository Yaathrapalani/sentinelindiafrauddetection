'use client';

import { cn } from '@/lib/utils';

interface AssessmentProgressProps {
  current: number;
  total: number;
}

export function AssessmentProgress({ current, total }: AssessmentProgressProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full" aria-label="Assessment progress">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Scenario {current + 1} of {total}
        </span>
        <span className="font-semibold text-foreground">{percentage}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-label="Assessment progress"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full bg-accent transition-all duration-500 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
