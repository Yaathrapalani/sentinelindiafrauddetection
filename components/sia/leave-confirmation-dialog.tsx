'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSIAStore } from '@/hooks/use-sia-store';

interface LeaveConfirmationDialogProps {
  onContinue: () => void;
  onLeave: () => void;
}

export function LeaveConfirmationDialog({
  onContinue,
  onLeave,
}: LeaveConfirmationDialogProps) {
  const { showLeaveDialog, context } = useSIAStore();
  const pct = context.completionPercentage;

  return (
    <AnimatePresence>
      {showLeaveDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
          role="alertdialog"
          aria-labelledby="leave-dialog-title"
          aria-describedby="leave-dialog-desc"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <h2 id="leave-dialog-title" className="text-lg font-semibold text-foreground">
                Before you go
              </h2>
            </div>

            <p id="leave-dialog-desc" className="text-sm leading-relaxed text-muted-foreground">
              {pct > 0 ? (
                <>
                  You&apos;ve completed <span className="font-semibold text-foreground">{pct}%</span> of your assessment.
                  Completing it unlocks your personalized Digital Safety Profile.
                </>
              ) : (
                <>Your Digital Safety Profile will be ready once you complete the assessment.</>
              )}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <Button onClick={onContinue} className="w-full sm:w-auto">
                Continue Assessment
              </Button>
              <Button
                variant="outline"
                onClick={onLeave}
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Anyway
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
