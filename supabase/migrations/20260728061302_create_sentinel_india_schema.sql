/*
# Sentinel India — Core Schema (fix: missing DROP POLICY on responses)

## Overview
Creates the complete normalized PostgreSQL schema for the Sentinel India
behavioral fraud-prevention research platform. Ten tables store
participants, assessments, scenarios, scenario options, responses,
behavioral scores, personas, analytics snapshots, feedback, and languages.

## Tables
1. languages — Supported UI/assessment languages
2. participants — Anonymous participant profiles
3. scenarios — Assessment scenarios
4. scenario_options — Multiple-choice options per scenario
5. assessments — Assessment sessions
6. responses — Individual scenario responses
7. behavior_scores — Computed behavioral metric scores
8. personas — Risk persona definitions
9. analytics — Aggregated analytics snapshots
10. feedback — User feedback

## Security
- RLS enabled on every table.
- Participant-facing tables use anon, authenticated (anonymous research).
- Admin/config tables use authenticated-only.
*/

-- ────────────────────────────────────────────────────────────────────────────
-- 1. LANGUAGES
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  native_label text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_languages" ON languages;
CREATE POLICY "anon_read_languages" ON languages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_manage_languages" ON languages;
CREATE POLICY "auth_manage_languages" ON languages FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. PARTICIPANTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text UNIQUE NOT NULL,
  age_bracket text NOT NULL CHECK (
    age_bracket IN ('18-25', '26-35', '36-50', '51-65', '65+')
  ),
  occupation text NOT NULL CHECK (
    occupation IN ('student', 'professional', 'business', 'homemaker',
                   'retired', 'government', 'other')
  ),
  digital_habit_level text NOT NULL CHECK (
    digital_habit_level IN ('low', 'moderate', 'high')
  ),
  scam_experience text NOT NULL DEFAULT 'none' CHECK (
    scam_experience IN ('none', 'attempted', 'victim', 'witnessed')
  ),
  locale text NOT NULL DEFAULT 'en',
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_participants" ON participants;
CREATE POLICY "anon_insert_participants" ON participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_own_participant" ON participants;
CREATE POLICY "anon_select_own_participant" ON participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_own_participant" ON participants;
CREATE POLICY "anon_update_own_participant" ON participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_participants_age_bracket ON participants(age_bracket);
CREATE INDEX IF NOT EXISTS idx_participants_occupation ON participants(occupation);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_anonymous_id ON participants(anonymous_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. SCENARIOS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (
    category IN ('phishing', 'investment', 'impersonation', 'urgency',
                 'authority', 'social', 'recovery', 'reporting')
  ),
  channel text NOT NULL CHECK (
    channel IN ('sms', 'call', 'email', 'social', 'app', 'inperson')
  ),
  title text NOT NULL,
  description text NOT NULL,
  voice_script text,
  is_core boolean NOT NULL DEFAULT true,
  difficulty int NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  tags text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_scenarios" ON scenarios;
CREATE POLICY "anon_read_scenarios" ON scenarios FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "auth_manage_scenarios" ON scenarios;
CREATE POLICY "auth_manage_scenarios" ON scenarios FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);
CREATE INDEX IF NOT EXISTS idx_scenarios_is_core ON scenarios(is_core);
CREATE INDEX IF NOT EXISTS idx_scenarios_is_active ON scenarios(is_active);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. SCENARIO OPTIONS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  response_type text NOT NULL CHECK (
    response_type IN ('safe', 'cautious', 'risky', 'critical')
  ),
  metric_impacts jsonb NOT NULL DEFAULT '{}',
  explanation text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scenario_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_scenario_options" ON scenario_options;
CREATE POLICY "anon_read_scenario_options" ON scenario_options FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_manage_scenario_options" ON scenario_options;
CREATE POLICY "auth_manage_scenario_options" ON scenario_options FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_scenario_options_scenario_id ON scenario_options(scenario_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. ASSESSMENTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'intro' CHECK (
    status IN ('intro', 'profile', 'active', 'scoring', 'complete', 'abandoned')
  ),
  current_scenario_index int NOT NULL DEFAULT 0,
  scenario_ids jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_assessments" ON assessments;
CREATE POLICY "anon_insert_assessments" ON assessments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_assessments" ON assessments;
CREATE POLICY "anon_select_assessments" ON assessments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_assessments" ON assessments;
CREATE POLICY "anon_update_assessments" ON assessments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_assessments_participant_id ON assessments(participant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_started_at ON assessments(started_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. RESPONSES
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE RESTRICT,
  option_id uuid NOT NULL REFERENCES scenario_options(id) ON DELETE RESTRICT,
  response_type text NOT NULL CHECK (
    response_type IN ('safe', 'cautious', 'risky', 'critical')
  ),
  time_spent_ms int NOT NULL DEFAULT 0,
  confidence_level int NOT NULL DEFAULT 3 CHECK (confidence_level BETWEEN 1 AND 5),
  used_voice boolean NOT NULL DEFAULT false,
  metric_impacts jsonb NOT NULL DEFAULT '{}',
  answered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_responses" ON responses;
CREATE POLICY "anon_insert_responses" ON responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_responses" ON responses;
CREATE POLICY "anon_select_responses" ON responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_responses" ON responses;
CREATE POLICY "anon_update_responses" ON responses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_scenario_id ON responses(scenario_id);
CREATE INDEX IF NOT EXISTS idx_responses_response_type ON responses(response_type);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. BEHAVIOR SCORES
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS behavior_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  scores jsonb NOT NULL DEFAULT '{}',
  risk_level text NOT NULL DEFAULT 'moderate' CHECK (
    risk_level IN ('low', 'moderate', 'elevated', 'high', 'critical')
  ),
  overall_score int NOT NULL DEFAULT 50 CHECK (overall_score BETWEEN 0 AND 100),
  calculated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE behavior_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_behavior_scores" ON behavior_scores;
CREATE POLICY "anon_insert_behavior_scores" ON behavior_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_behavior_scores" ON behavior_scores;
CREATE POLICY "anon_select_behavior_scores" ON behavior_scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_behavior_scores" ON behavior_scores;
CREATE POLICY "anon_update_behavior_scores" ON behavior_scores FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_behavior_scores_participant_id ON behavior_scores(participant_id);
CREATE INDEX IF NOT EXISTS idx_behavior_scores_risk_level ON behavior_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_behavior_scores_assessment_id ON behavior_scores(assessment_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. PERSONAS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  characteristics jsonb NOT NULL DEFAULT '[]',
  risk_level text NOT NULL CHECK (
    risk_level IN ('low', 'moderate', 'elevated', 'high', 'critical')
  ),
  score_min int NOT NULL DEFAULT 0 CHECK (score_min BETWEEN 0 AND 100),
  score_max int NOT NULL DEFAULT 100 CHECK (score_max BETWEEN 0 AND 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_personas" ON personas;
CREATE POLICY "anon_read_personas" ON personas FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "auth_manage_personas" ON personas;
CREATE POLICY "auth_manage_personas" ON personas FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. ANALYTICS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type text NOT NULL CHECK (
    snapshot_type IN ('daily', 'weekly', 'monthly', 'realtime')
  ),
  summary jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_analytics" ON analytics;
CREATE POLICY "anon_read_analytics" ON analytics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_analytics" ON analytics;
CREATE POLICY "auth_insert_analytics" ON analytics FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_type ON analytics(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_analytics_computed_at ON analytics(computed_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. FEEDBACK
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'suggestion' CHECK (
    type IN ('bug', 'suggestion', 'praise', 'content', 'other')
  ),
  message text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  page text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback;
CREATE POLICY "anon_insert_feedback" ON feedback FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_own_feedback" ON feedback;
CREATE POLICY "anon_select_own_feedback" ON feedback FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_manage_feedback" ON feedback;
CREATE POLICY "auth_manage_feedback" ON feedback FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- ────────────────────────────────────────────────────────────────────────────
-- SEED: LANGUAGES
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO languages (code, label, native_label, is_enabled, sort_order) VALUES
  ('en', 'English', 'English', true, 1),
  ('hi', 'Hindi', 'हिन्दी', false, 2),
  ('ta', 'Tamil', 'தமிழ்', false, 3),
  ('kn', 'Kannada', 'ಕನ್ನಡ', false, 4),
  ('te', 'Telugu', 'తెలుగు', false, 5)
ON CONFLICT (code) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- SEED: PERSONAS
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO personas (name, description, characteristics, risk_level, score_min, score_max) VALUES
  (
    'Digital Guardian',
    'Highly aware and cautious. Strong verification habits and low susceptibility to manipulation.',
    '["Strong verification habits", "Low authority susceptibility", "High digital literacy", "Cautious trust calibration"]',
    'low', 80, 100
  ),
  (
    'Vigilant Navigator',
    'Generally aware with good habits, but may have specific blind spots in emerging scam types.',
    '["Good digital literacy", "Moderate verification habits", "Some AI scam awareness gaps"]',
    'moderate', 60, 79
  ),
  (
    'Cautious Learner',
    'Basic awareness but inconsistent application. Vulnerable under pressure or authority cues.',
    '["Inconsistent verification", "Moderate urgency susceptibility", "Basic digital literacy"]',
    'elevated', 40, 59
  ),
  (
    'At-Risk Explorer',
    'Limited awareness and verification habits. High susceptibility to multiple scam categories.',
    '["Low verification habits", "High authority susceptibility", "High urgency susceptibility", "Low reporting readiness"]',
    'high', 20, 39
  ),
  (
    'Vulnerable Novice',
    'Minimal digital safety awareness. Extremely susceptible to manipulation across all categories.',
    '["Very low digital literacy", "High susceptibility across metrics", "No reporting or recovery readiness"]',
    'critical', 0, 19
  )
ON CONFLICT (name) DO NOTHING;
