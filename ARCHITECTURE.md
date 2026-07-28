# Sentinel India — Architecture Document

## Overview

Sentinel India is an AI-assisted behavioral research and education platform that helps users identify, understand, and resist digital fraud. This document describes the complete production-grade architecture.

---

## 1. Folder Structure

```
app/
  (marketing)/          — Marketing route group (landing, about)
  assessment/           — Assessment flow (intro → profile → scenarios → results)
    results/            — Digital Safety Profile results page
  dashboard/            — Research analytics dashboard
  admin/                — Admin/researcher login
  privacy/              — Privacy policy
  accessibility/        — Accessibility statement
  layout.tsx            — Root layout (fonts, header, footer, providers)
  page.tsx              — Landing page
  loading.tsx           — Route-level loading state
  error.tsx             — Route-level error boundary
  global-error.tsx      — Global error boundary (catches root layout errors)
  not-found.tsx         — 404 page
  globals.css           — Global styles + design tokens

components/
  ui/                   — shadcn/ui primitives (button, card, dialog, etc.)
  assessment/           — Assessment-specific components (scenario card, profile form, progress)
  dashboard/            — Dashboard-specific components
  navigation/           — Site header and footer
  charts/               — Recharts wrappers (radar, bar, pie)
  voice/                — Voice narration components
  providers/            — React context providers (TanStack Query)
  error-boundary.tsx    — Reusable error boundary

lib/
  supabase/             — Supabase client (browser + server)
  scoring/              — Behavioral scoring engine + adaptive assessment
  services/             — API service layer (all database operations)
  validation/           — Zod validation schemas
  utils/                — Utility functions (formatting, helpers)

hooks/
  use-voice.ts          — Web Speech API hook
  use-assessment.ts     — Assessment state management hook
  use-reduced-motion.ts — Reduced motion preference hook

types/
  index.ts              — All domain types and interfaces

constants/
  index.ts              — Metric definitions, routes, languages, config

translations/
  index.ts              — i18n messages (English primary, Hindi/Tamil/Kannada/Telugu stubs)
```

### Purpose of Each Folder

- **app/**: Next.js App Router pages and layouts. Route groups isolate marketing pages from functional areas.
- **components/ui/**: Reusable shadcn/ui primitives — the design system foundation.
- **components/assessment/**: Assessment-specific UI (scenario cards, profile form, progress bar).
- **components/charts/**: Recharts wrappers that consume the design tokens for consistent styling.
- **components/navigation/**: Global header/footer with responsive mobile menu.
- **components/providers/**: React context providers (TanStack Query).
- **lib/supabase/**: Singleton Supabase clients — separate browser and server instances.
- **lib/scoring/**: The behavioral scoring engine and adaptive assessment selector.
- **lib/services/**: The API service layer — all database operations go through here.
- **lib/validation/**: Zod schemas for all input validation.
- **lib/utils/**: Pure utility functions (formatting, color mapping).
- **hooks/**: Custom React hooks for voice, assessment state, and accessibility.
- **types/**: Centralized TypeScript domain types — imported everywhere.
- **constants/**: Configuration constants (metrics, routes, languages, chart colors).
- **translations/**: i18n message files — English is fully translated, other languages are stubs.

---

## 2. Routing Plan

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing page with hero, features, CTA | None |
| `/about` | About page with mission, research goals, values | None |
| `/assessment` | Assessment flow (intro → profile → scenarios) | None (anonymous) |
| `/assessment/results` | Digital Safety Profile results | None (participant ID in query) |
| `/dashboard` | Research analytics dashboard | None (aggregated, anonymous) |
| `/admin` | Admin/researcher login | Admin auth (architecture ready) |
| `/privacy` | Privacy policy | None |
| `/accessibility` | Accessibility statement | None |

---

## 3. Database Schema

### Tables

1. **languages** — Supported UI languages (en, hi, ta, kn, te)
2. **participants** — Anonymous participant profiles (age bracket, occupation, digital habits, scam experience)
3. **scenarios** — Assessment scenarios (8 categories: phishing, investment, impersonation, urgency, authority, social, recovery, reporting)
4. **scenario_options** — Multiple-choice options per scenario (4 per scenario: safe, cautious, risky, critical)
5. **assessments** — Assessment sessions tracking progress through scenarios
6. **responses** — Individual scenario responses with timing, confidence, voice usage, and metric impacts
7. **behavior_scores** — Computed behavioral metric scores (10 metrics) per assessment
8. **personas** — Risk persona definitions (5 personas: Digital Guardian → Vulnerable Novice)
9. **analytics** — Aggregated analytics snapshots for the dashboard
10. **feedback** — User feedback (bug, suggestion, praise, content, other)

### Relationships

```
participants (1) ──→ (N) assessments
assessments (1) ──→ (N) responses
responses (N) ──→ (1) scenarios
responses (N) ──→ (1) scenario_options
participants (1) ──→ (1) behavior_scores (per assessment)
participants (N) ──→ (1) personas (matched by score range)
```

### Indexes

- All foreign keys indexed for join performance
- `participants.created_at` for time-based queries
- `assessments.status` for filtering active/complete
- `behavior_scores.risk_level` for risk distribution analytics
- `responses.response_type` for category performance analysis

### RLS Strategy

- **Participant-facing tables** (participants, assessments, responses, behavior_scores, feedback): `TO anon, authenticated` — anonymous participants can read/write their own data.
- **Config tables** (languages, scenarios, scenario_options, personas): `SELECT` for `anon, authenticated`, `ALL` for `authenticated` (admin management).
- **Analytics**: `SELECT` for `anon, authenticated`, `INSERT` for `authenticated` (admin generates snapshots).

---

## 4. Behavioral Model

### 10 Hidden Metrics

| Metric | Direction | Description |
|--------|-----------|-------------|
| Digital Literacy | Positive | Ability to identify, evaluate, and safely navigate digital platforms |
| Verification Habit | Positive | Tendency to independently verify claims before acting |
| Authority Susceptibility | Negative | Likelihood of complying with perceived authority without verification |
| Urgency Susceptibility | Negative | Tendency to act quickly under time pressure without verification |
| Trust Calibration | Positive | Accuracy of trust assessment — neither over-trusting nor under-trusting |
| Confidence Calibration | Positive | Alignment between self-reported confidence and actual accuracy |
| AI Scam Awareness | Positive | Recognition of AI-enabled fraud (deepfakes, voice cloning, AI content) |
| Reporting Readiness | Positive | Knowledge of and willingness to use official reporting channels |
| Recovery Readiness | Positive | Understanding of post-fraud recovery and avoidance of secondary scams |
| Overall Risk | Negative | Composite risk score synthesizing all metrics |

### Scoring Pipeline

```
responses → accumulate → normalize → calibrate → synthesize → classify → match persona
```

1. **Accumulate**: Collect raw metric impacts from each response
2. **Normalize**: Scale to 0–100 per metric (base 50, impacts shift ±)
3. **Calibrate**: Penalize overconfidence on wrong answers
4. **Synthesize**: Weighted combination of all metrics → overall risk
5. **Classify**: Map overall score to risk level (low/moderate/elevated/high/critical)
6. **Match**: Map score to predefined persona

---

## 5. Adaptive Assessment Engine

### Architecture

```
Participant Profile → Core Selector (8 shared scenarios)
                    → Adaptive Selector (4 profile-based scenarios)
                    → Assessment Builder (12 total scenarios)
```

### Inputs

- **Age bracket**: 18-25, 26-35, 36-50, 51-65, 65+
- **Occupation**: student, professional, business, homemaker, retired, government, other
- **Digital habits**: low, moderate, high
- **Scam experience**: none, attempted, victim, witnessed

### Selection Rules

- 8 core scenarios are **always included** (same for all participants → comparability)
- 4 adaptive scenarios selected based on profile:
  - Younger → social/investment scams
  - Older → authority/urgency scams
  - Students → social engineering
  - Retired → recovery/authority
  - High digital habits → advanced phishing/investment
  - Scam victims → recovery/reporting focus
- Selection is deterministic for the same profile (reproducible research)

---

## 6. Voice Architecture

- Uses **SpeechSynthesis API** (text-to-speech)
- **Optional** — user must click to enable
- **Graceful degradation**: if `speechSynthesis` not in window, the voice button is hidden
- Locale-aware: maps `en` → `en-IN`, `hi` → `hi-IN`, etc.
- Cleans up on unmount (cancels pending speech)
- Respects reduced motion preferences

---

## 7. Internationalization

- **Primary**: English (fully translated)
- **Architecture ready**: Hindi, Tamil, Kannada, Telugu (stubs with nav + common keys)
- All UI text lives in `translations/index.ts`
- `getTranslation(locale, key)` resolves dot-notation keys with English fallback
- No hardcoded UI text in components
- Language registry in `constants/index.ts` with `enabled` flag per language

---

## 8. Authentication

- **Anonymous participants**: No auth required — uses Supabase anon key with RLS
- **Admin/researcher**: Supabase Auth email/password (architecture ready, login UI built)
- Participant/admin functionality is fully separated:
  - Participants interact with `participants`, `assessments`, `responses`, `behavior_scores`
  - Admins manage `scenarios`, `personas`, `analytics`, `feedback`

---

## 9. Security Strategy

### OWASP Top 10 Coverage

- **Injection**: Supabase parameterized queries (no raw SQL in app code)
- **XSS**: React auto-escaping, no `dangerouslySetInnerHTML`, Content-Security-Policy headers
- **CSRF**: Supabase auth uses JWT tokens, not cookies
- **Rate Abuse**: Supabase built-in rate limiting + RLS policies
- **Security Misconfig**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`
- **Sensitive Data Exposure**: No PII stored, all data anonymous
- **Broken Access Control**: RLS on every table, role-based policies
- **Input Validation**: Zod schemas validate all inputs before database writes

### Headers (configured in next.config.js)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## 10. Accessibility Strategy (WCAG 2.2 AA)

- **Keyboard navigation**: Full tab order, visible focus rings (`ring-2 ring-ring ring-offset-2`)
- **Screen reader**: Semantic HTML5, ARIA labels, `aria-current`, `aria-expanded`, `aria-pressed`, `aria-label`
- **High contrast**: Color tokens meet AA contrast ratios (4.5:1 text, 3:1 large text)
- **Reduced motion**: `prefers-reduced-motion` media query disables all animations
- **Large touch targets**: All buttons meet 44x44px minimum
- **Semantic HTML**: `<main>`, `<nav>`, `<header>`, `<footer>`, `<fieldset>`, `<legend>`
- **Skip link**: "Skip to main content" link for keyboard users
- **Form labels**: Every input has an associated `<Label>`
- **Progress indicators**: `role="progressbar"` with `aria-valuenow/min/max`

---

## 11. Performance Strategy

### Targets

- Lighthouse Performance ≥ 95
- Lighthouse Accessibility ≥ 95
- Lighthouse Best Practices ≥ 95

### Techniques

- **Code splitting**: Route-level lazy loading via App Router
- **Image optimization**: `next/image` with AVIF/WebP formats
- **Package optimization**: `optimizePackageImports` for lucide-react, framer-motion, recharts
- **Font optimization**: `next/font` with `display: swap`
- **Loading states**: Route-level `loading.tsx` for instant feedback
- **Query caching**: TanStack Query with 60s stale time
- **Minimal client JS**: Server components for static pages (about, privacy, accessibility, admin)

---

## 12. Design System

### Typography

- Font: Inter (variable, via `next/font`)
- Scale: 2xs (0.625rem) → 6xl (3.75rem)
- Line height: 150% body, 120% headings
- Weights: 400 (regular), 500 (medium), 700 (bold)

### Color Palette

- **Primary**: Deep Trust Navy (`hsl(222 47% 18%)`)
- **Accent**: Trust Teal (`hsl(173 58% 39%)`)
- **Success**: Green (`hsl(142 71% 38%)`)
- **Warning**: Amber (`hsl(38 92% 50%)`)
- **Error**: Red (`hsl(0 72% 51%)`)
- **Neutrals**: Slate ramp (50–950)
- **Chart palette**: 9 distinct colors for metrics

### Spacing

- 8px base system (with 18, 22, 30 extensions)
- Consistent gap utilities (gap-2, gap-4, gap-6, gap-8)

### Border Radius

- `--radius: 0.625rem` (10px) — consistent across all components

### Elevation

- 5 shadow levels: xs, sm, md, lg, xl
- Subtle by default, elevated on hover

### Form Standards

- All inputs use shadcn/ui primitives
- Labels above inputs
- Error messages in destructive color below input
- Required fields marked
- Radio groups for single-select, checkboxes for multi-select

### Button Variants

- `default` (primary), `outline`, `secondary`, `ghost`, `destructive`
- Sizes: `sm`, `default`, `lg`

### Card Variants

- Default: white background, border, shadow-sm
- Hover: shadow-md transition

---

## 13. API Design

### REST Endpoints (Architecture — implemented via Supabase client)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /participants | Create anonymous participant |
| GET | /participants/:id | Get participant profile |
| POST | /assessments | Start new assessment |
| GET | /assessments/:id | Get assessment session |
| POST | /responses | Submit scenario response |
| GET | /profile/:participantId | Get Digital Safety Profile |
| GET | /analytics | Get aggregated analytics |
| GET | /dashboard | Get dashboard data |
| POST | /feedback | Submit feedback |
| GET | /scenarios | Get active scenarios |
| GET | /personas | Get personas |

---

## 14. State Management

- **TanStack Query**: Server state (API data, caching, mutations)
- **React Hook Form**: Form state (profile form, admin login)
- **Local state (useState)**: UI-only state (mobile menu, selected options)
- **No Zustand**: Not needed — no complex global client state required
- **Assessment state**: Custom `useAssessmentState` hook manages scenario progression

---

## 15. Development Roadmap

### Phase 1 — Foundation (Complete)

- [x] Design system (tokens, Tailwind, typography)
- [x] Database schema (10 tables, RLS, indexes, seeds)
- [x] Type system (all domain types)
- [x] Constants (metrics, routes, languages)
- [x] Lib layer (Supabase, validation, scoring, services)
- [x] Translations (English + stubs)
- [x] Hooks (voice, assessment, reduced motion)
- [x] Components (navigation, assessment, charts, error boundary)
- [x] Routes (landing, about, assessment, results, dashboard, admin, privacy, accessibility)
- [x] Error pages (404, error, global-error)
- [x] Engineering config (ESLint, Prettier, next.config, headers)

### Phase 2 — Enhancement

- [ ] Complete Hindi translations
- [ ] Admin dashboard (scenario management, participant analytics)
- [ ] Feedback form component
- [ ] Export/download results as PDF
- [ ] Time-series analytics chart
- [ ] Category performance chart
- [ ] A/B testing for scenario difficulty

### Phase 3 — Scale

- [ ] Edge function for analytics aggregation
- [ ] Rate limiting via edge function
- [ ] Real-time dashboard updates
- [ ] Multi-tenant researcher access
- [ ] API key authentication for external researchers
- [ ] Longitudinal study support (repeat assessments)
