'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { SiaVisualMode } from '@/lib/voice/state-machine';

interface SiaAvatarProps {
  visualMode: SiaVisualMode;
  size?: number;
}

function SiaAvatarComponent({ visualMode, size = 56 }: SiaAvatarProps) {
  const reducedMotion = useReducedMotion();

  // Animation configs per visual mode
  const animations = {
    idle: {
      scale: [1, 1.04, 1],
      opacity: [0.85, 1, 0.85],
    },
    breathing: {
      scale: [1, 1.06, 1],
      opacity: [0.9, 1, 0.9],
    },
    speaking: {
      scale: [1, 1.08, 0.98, 1.05, 1],
      opacity: 1,
    },
    listening: {
      scale: [1, 1.03, 1],
      opacity: 1,
    },
    thinking: {
      scale: [1, 1.02, 1],
      opacity: [1, 0.7, 1],
    },
  };

  const transition = reducedMotion
    ? { duration: 0.01, repeat: 0 }
    : {
        duration: visualMode === 'speaking' ? 0.6 : visualMode === 'listening' ? 1.2 : 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      };

  // Ring pulse for speaking
  const ringAnimation = reducedMotion
    ? { scale: 1, opacity: 0 }
    : {
        scale: [1, 1.4, 1.6],
        opacity: [0.6, 0.2, 0],
      };

  const ringTransition = reducedMotion
    ? { duration: 0.01 }
    : {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut' as const,
      };

  // Listening wave
  const waveHeights = reducedMotion
    ? { height: '20%' }
    : undefined;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`SIA is ${visualMode}`}
    >
      {/* Outer pulse ring (speaking only) */}
      {visualMode === 'speaking' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid hsl(var(--accent))',
            background: 'hsl(var(--accent) / 0.05)',
          }}
          animate={ringAnimation}
          transition={ringTransition}
          aria-hidden="true"
        />
      )}

      {/* Main orb */}
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background:
            visualMode === 'listening'
              ? 'radial-gradient(circle at 35% 30%, hsl(var(--accent) / 0.9), hsl(var(--primary) / 0.8))'
              : visualMode === 'thinking'
                ? 'radial-gradient(circle at 35% 30%, hsl(var(--muted-foreground) / 0.6), hsl(var(--primary) / 0.7))'
                : 'radial-gradient(circle at 35% 30%, hsl(var(--accent) / 0.85), hsl(var(--primary) / 0.9))',
          boxShadow:
            visualMode === 'speaking'
              ? '0 0 20px hsl(var(--accent) / 0.4), 0 4px 12px hsl(var(--primary) / 0.3)'
              : '0 4px 12px hsl(var(--primary) / 0.2)',
        }}
        animate={animations[visualMode]}
        transition={transition}
        aria-hidden="true"
      >
        {/* Inner highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: '18%',
            left: '28%',
            width: '30%',
            height: '30%',
            background:
              'radial-gradient(circle, hsl(0 0% 100% / 0.35), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Sound waves for listening */}
        {visualMode === 'listening' && (
          <div className="flex items-center gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: 3,
                  borderRadius: 2,
                  background: 'hsl(var(--accent-foreground) / 0.8)',
                  originY: 1,
                }}
                animate={
                  waveHeights || {
                    height: ['30%', '70%', '40%', '80%', '30%'],
                  }
                }
                transition={
                  reducedMotion
                    ? { duration: 0.01 }
                    : {
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut' as const,
                      }
                }
              />
            ))}
          </div>
        )}

        {/* Thinking dots */}
        {visualMode === 'thinking' && (
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'hsl(var(--accent-foreground) / 0.7)',
                }}
                animate={
                  reducedMotion
                    ? { opacity: 0.5 }
                    : { opacity: [0.3, 1, 0.3] }
                }
                transition={
                  reducedMotion
                    ? { duration: 0.01 }
                    : {
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }
                }
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export const SiaAvatar = memo(SiaAvatarComponent);
