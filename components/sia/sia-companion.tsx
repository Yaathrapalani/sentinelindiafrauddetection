'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCw,
  X,
  Settings2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useSia } from '@/components/providers/sia-provider';
import { SiaAvatar } from '@/components/sia/sia-avatar';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export function SiaCompanion() {
  const sia = useSia();
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaption, setShowCaption] = useState(false);

  // Show caption when available
  useEffect(() => {
    if (sia.caption) {
      setShowCaption(true);
    } else {
      setShowCaption(false);
    }
  }, [sia.caption]);

  const handleToggleMute = useCallback(() => {
    sia.toggleMute();
  }, [sia]);

  const handleTogglePause = useCallback(() => {
    if (sia.isPaused) sia.resume();
    else sia.pause();
  }, [sia]);

  const handleReplay = useCallback(() => {
    sia.replay();
  }, [sia]);

  const handleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  // Don't render if speech synthesis is not supported at all
  if (!sia.isSupported) return null;

  // Position: bottom-right desktop, bottom-center mobile
  const positionClasses =
    'fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2';

  return (
    <div
      className={positionClasses}
      aria-label="SIA voice companion"
    >
      {/* Caption bubble */}
      <AnimatePresence>
        {showCaption && sia.caption && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-full right-0 max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2 mb-3 w-72 max-w-[calc(100vw-2rem)]"
          >
            <div
              className="rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md"
              role="status"
              aria-live="polite"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-accent">SIA</span>
                {sia.isSpeaking && !sia.isPaused && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    speaking
                  </span>
                )}
                {sia.isPaused && (
                  <span className="text-xs text-muted-foreground">paused</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {sia.caption}
              </p>
            </div>
            {/* Speech bubble tail */}
            <div
              className="absolute -bottom-1.5 right-6 max-sm:left-1/2 max-sm:-translate-x-1/2 h-3 w-3 rotate-45 border-b border-r border-border bg-card/95"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2 mb-3 w-56"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-sm font-semibold text-foreground">SIA Controls</span>
                <button
                  onClick={() => setExpanded(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Close controls"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Control buttons */}
              <div className="grid grid-cols-3 gap-1 p-3">
                <ControlButton
                  onClick={handleToggleMute}
                  active={!sia.isMuted}
                  label={sia.isMuted ? 'Unmute' : 'Mute'}
                  icon={sia.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                />
                <ControlButton
                  onClick={handleTogglePause}
                  active={sia.isSpeaking && !sia.isPaused}
                  disabled={!sia.isSpeaking}
                  label={sia.isPaused ? 'Resume' : 'Pause'}
                  icon={sia.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                />
                <ControlButton
                  onClick={handleReplay}
                  active={false}
                  disabled={!sia.hasLastSpoken}
                  label="Replay"
                  icon={<RotateCw className="h-4 w-4" />}
                />
              </div>

              {/* Settings toggle */}
              <button
                onClick={handleSettings}
                className="flex w-full items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground hover:bg-secondary/50"
                aria-expanded={showSettings}
                aria-controls="sia-voice-settings"
                aria-label="Toggle voice settings"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5" />
                  Voice settings
                </span>
                {showSettings ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    id="sia-voice-settings"
                    initial={reducedMotion ? { height: 0 } : { height: 0, opacity: 0 }}
                    animate={reducedMotion ? { height: 'auto' } : { height: 'auto', opacity: 1 }}
                    exit={reducedMotion ? { height: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="space-y-3 p-4">
                      <SliderControl
                        label="Rate"
                        value={sia.speechRate}
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        onChange={sia.setSpeechRate}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <span className="text-xs font-medium text-foreground">
                          {sia.isMuted
                            ? 'Muted'
                            : sia.isPaused
                              ? 'Paused'
                              : sia.isSpeaking
                                ? 'Speaking'
                                : 'Ready'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Voice</span>
                        <span className="text-xs font-medium text-foreground">
                          {sia.voicesLoaded ? 'Loaded' : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main avatar button */}
      <motion.button
        onClick={handleExpand}
        className="relative flex items-center justify-center rounded-full bg-card/80 p-2 shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl"
        aria-label={`SIA voice companion — ${sia.isMuted ? 'muted' : sia.isSpeaking ? 'speaking' : 'idle'}`}
        aria-expanded={expanded}
        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      >
        <SiaAvatar visualMode={sia.visualMode} size={48} />

        {/* Muted indicator */}
        {sia.isMuted && (
          <div
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive"
            aria-hidden="true"
          >
            <VolumeX className="h-3 w-3 text-destructive-foreground" />
          </div>
        )}

        {/* Speaking indicator dot */}
        {sia.isSpeaking && !sia.isMuted && !sia.isPaused && (
          <motion.div
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-success"
            animate={reducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
      </motion.button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface ControlButtonProps {
  onClick: () => void;
  active: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
}

function ControlButton({ onClick, active, disabled, label, icon }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors',
        disabled
          ? 'cursor-not-allowed text-muted-foreground/50'
          : active
            ? 'bg-accent/10 text-accent hover:bg-accent/20'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
      aria-label={label}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: SliderControlProps) {
  return (
    <div className={cn(disabled && 'opacity-50')}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full accent-accent"
        aria-label={label}
      />
    </div>
  );
}
