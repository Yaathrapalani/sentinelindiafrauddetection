'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Gauge, X } from 'lucide-react';
import { useSIAStore } from '@/hooks/use-sia-store';
import { useSIAVoice } from '@/hooks/use-sia-voice';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

interface SIAAssistantProps {
  locale?: Locale;
}

const STATE_LABELS: Record<string, string> = {
  IDLE: 'Ready',
  WELCOME: 'Welcome',
  INTRODUCTION: 'Introduction',
  PROFILE_GUIDANCE: 'Profile',
  SCENARIO_INTRO: 'Scenario',
  OBSERVING: 'Observing',
  WAITING: 'Waiting',
  ENCOURAGING: 'Encouraging',
  THINKING: 'Thinking',
  PROGRESS_UPDATE: 'Progress',
  ANSWER_ACKNOWLEDGMENT: 'Acknowledged',
  RESULTS_INTRO: 'Results',
  RESULTS_REVEAL: 'Revealing',
  GOODBYE: 'Goodbye',
};

export function SIAAssistant({ locale = 'en' }: SIAAssistantProps) {
  const { state, messages, context } = useSIAStore();
  const voice = useSIAVoice(locale);
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [showRateControl, setShowRateControl] = useState(false);
  const lastSpokenRef = useRef<string | null>(null);

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  useEffect(() => {
    if (!latestMessage || lastSpokenRef.current === latestMessage.id) return;
    lastSpokenRef.current = latestMessage.id;
    if (voice.hasInteracted && !voice.muted) {
      voice.speak(latestMessage.text);
    }
  }, [latestMessage, voice]);

  const handleMuteToggle = () => {
    voice.toggleMute();
    voice.markInteracted();
  };

  const handleReplay = () => {
    if (latestMessage) {
      voice.replay(latestMessage.text);
      voice.markInteracted();
    }
  };

  const handleExpand = () => {
    setExpanded(true);
    voice.markInteracted();
  };

  const isSpeaking = voice.isSpeaking && !voice.muted;
  const showVisualOnly = !voice.isSupported;

  return (
    <>
      <div
        className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
        aria-live="polite"
        aria-label="SIA Digital Safety Companion"
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-sm"
            >
              <div className="rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SIAAvatar isSpeaking={isSpeaking} reducedMotion={reducedMotion} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">SIA</p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isSpeaking ? 'bg-accent animate-pulse' : 'bg-muted-foreground/40'
                          )}
                          aria-hidden="true"
                        />
                        <span className="text-xs text-muted-foreground">
                          {STATE_LABELS[state] || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setExpanded(false)}
                    aria-label="Collapse SIA"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Message area */}
                <div className="max-h-48 min-h-[5rem] overflow-y-auto px-4 py-3">
                  {latestMessage ? (
                    <p className="text-sm leading-relaxed text-foreground">
                      {latestMessage.text}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {showVisualOnly
                        ? 'Voice narration is not available on this device. I will guide you visually.'
                        : 'Tap below to begin voice guidance.'}
                    </p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 border-t border-border px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMuteToggle}
                    aria-label={voice.muted ? 'Unmute SIA' : 'Mute SIA'}
                    className="h-8"
                  >
                    {voice.muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span className="ml-1.5 text-xs">{voice.muted ? 'Unmute' : 'Mute'}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplay}
                    disabled={!latestMessage}
                    aria-label="Replay last message"
                    className="h-8"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="ml-1.5 text-xs">Replay</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRateControl((v) => !v)}
                    aria-label="Adjust speech rate"
                    className="h-8"
                  >
                    <Gauge className="h-4 w-4" />
                    <span className="ml-1.5 text-xs">Speed</span>
                  </Button>

                  {context.completionPercentage > 0 && (
                    <span className="ml-auto text-xs font-medium text-muted-foreground">
                      {context.completionPercentage}%
                    </span>
                  )}
                </div>

                {/* Rate control */}
                <AnimatePresence>
                  {showRateControl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border px-4 py-3"
                    >
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Speech Rate: {voice.rate.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min={0.6}
                        max={1.4}
                        step={0.05}
                        value={voice.rate}
                        onChange={(e) => voice.setRate(parseFloat(e.target.value))}
                        className="w-full accent-accent"
                        aria-label="Speech rate slider"
                      />
                      <div className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <button
                onClick={handleExpand}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md transition-all hover:shadow-xl hover:border-accent/40"
                aria-label="Open SIA companion"
                aria-expanded={false}
              >
                <SIAAvatar isSpeaking={isSpeaking} reducedMotion={reducedMotion} size="md" />
                <div className="max-w-[200px] text-left">
                  <p className="text-xs font-semibold text-foreground">SIA</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {latestMessage ? latestMessage.text : 'Tap to start guidance'}
                  </p>
                </div>
                {voice.muted && (
                  <VolumeX className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function SIAAvatar({
  isSpeaking,
  reducedMotion,
  size = 'md',
}: {
  isSpeaking: boolean;
  reducedMotion: boolean;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-primary/10 ring-1 ring-accent/20',
        dim
      )}
      aria-hidden="true"
    >
      {/* Speaking rings */}
      {!reducedMotion && isSpeaking && (
        <>
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" style={{ animationDuration: '1.5s' }} />
          <span className="absolute inset-0 animate-pulse rounded-full bg-accent/10" style={{ animationDuration: '0.8s' }} />
        </>
      )}
      {/* Avatar icon — stylized shield with dot */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('relative', size === 'sm' ? 'h-5 w-5' : 'h-6 w-6')}
      >
        <path
          d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="hsl(var(--accent) / 0.08)"
        />
        <circle cx="12" cy="11" r="2.5" fill="hsl(var(--accent))">
          {!reducedMotion && isSpeaking && (
            <animate
              attributeName="r"
              values="2.5;3.2;2.5"
              dur="0.6s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
    </div>
  );
}
