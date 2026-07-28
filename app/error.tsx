'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Something Went Wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Your progress has been saved. Please try again.
        </p>
        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="mt-6" size="lg">
          Try Again
        </Button>
      </div>
    </div>
  );
}
