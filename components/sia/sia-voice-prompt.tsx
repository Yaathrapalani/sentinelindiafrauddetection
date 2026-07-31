'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Sparkles } from 'lucide-react';
import { useSia } from '@/components/providers/sia-provider';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function SiaVoicePrompt() {
  const sia = useSia();
  const reducedMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show prompt after a short delay if voice is supported, not enabled, and not dismissed
    if (!sia.isSupported || sia.isEnabled || dismissed) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [sia.isSupported, sia.isEnabled, dismissed]);

  const handleEnable = () => {
    sia.enable();
    setDismissed(true);
    setVisible(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4"
          role="dialog"
          aria-label="Enable voice guide"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md sm:gap-4 sm:p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Enable Voice Guide
              </p>
              <p className="text-xs text-muted-foreground">
                Let SIA narrate your assessment
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleEnable}
              className="flex-shrink-0"
            >
              <Volume2 className="mr-1.5 h-3.5 w-3.5" />
              Enable
            </Button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Dismiss voice prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
