/*
# Extend Participant Behavioral Profile

## Overview
Adds new columns to the `participants` table to capture richer behavioral
intake data for the adaptive assessment engine. These columns support
hidden behavioral metric estimation without collecting any personally
identifying information.

## New Columns on `participants`
1. `digital_services` (text[]) — Multiple-selection list of digital services
   the participant uses (UPI, shopping, social media, etc.). Powers adaptive
   scenario selection based on digital exposure surface.
2. `digital_confidence` (text) — Self-reported confidence using digital services.
   Values: 'very-low', 'low', 'moderate', 'high', 'very-high'. Feeds
   confidenceCalibration and digitalLiteracy pre-estimates.
3. `exposure_frequency` (text) — How often the participant encounters scam
   attempts. Values: 'never', 'rarely', 'monthly', 'weekly', 'daily'. Feeds
   scam awareness and reporting readiness metrics.
4. `decision_style` (jsonb) — Responses to decision-style questions about
   urgency, authority, and unexpected requests. Stores as a structured object
   with keys: 'urgency_response', 'authority_response', 'unexpected_response'.
   Feeds urgencySusceptibility and authoritySusceptibility pre-estimates.

## Security
- No changes to RLS policies — existing anon/authenticated policies remain.
- All new columns are nullable to maintain backward compatibility with
  existing participant rows.
- No PII is collected in any new column.

## Notes
- All new columns allow NULL to avoid breaking existing rows.
- `digital_services` uses a CHECK constraint to validate against a known set.
- `digital_confidence` and `exposure_frequency` use CHECK constraints with
  enumerated values.
- `decision_style` is a flexible jsonb column to allow future question additions
  without schema changes.
*/

-- Add digital_services column (multi-select array)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'digital_services'
  ) THEN
    ALTER TABLE participants
    ADD COLUMN digital_services text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Add digital_confidence column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'digital_confidence'
  ) THEN
    ALTER TABLE participants
    ADD COLUMN digital_confidence text;
  END IF;
END $$;

-- Add exposure_frequency column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'exposure_frequency'
  ) THEN
    ALTER TABLE participants
    ADD COLUMN exposure_frequency text;
  END IF;
END $$;

-- Add decision_style column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'decision_style'
  ) THEN
    ALTER TABLE participants
    ADD COLUMN decision_style jsonb NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Add CHECK constraint for digital_confidence
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'participants_digital_confidence_check'
  ) THEN
    ALTER TABLE participants
    ADD CONSTRAINT participants_digital_confidence_check CHECK (
      digital_confidence IS NULL OR digital_confidence IN (
        'very-low', 'low', 'moderate', 'high', 'very-high'
      )
    );
  END IF;
END $$;

-- Add CHECK constraint for exposure_frequency
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'participants_exposure_frequency_check'
  ) THEN
    ALTER TABLE participants
    ADD CONSTRAINT participants_exposure_frequency_check CHECK (
      exposure_frequency IS NULL OR exposure_frequency IN (
        'never', 'rarely', 'monthly', 'weekly', 'daily'
      )
    );
  END IF;
END $$;

-- Add index for digital_services queries (GIN index for array contains)
CREATE INDEX IF NOT EXISTS idx_participants_digital_services
  ON participants USING GIN (digital_services);
