# Sentinel India — Production Deployment

Stack: **Next.js 13** (App Router) + **Supabase** (Postgres / Auth / RLS) → host on **Netlify**.

Repo: `https://github.com/Yaathrapalani/sentinelindiafrauddetection`

---

## Prerequisites

- Node.js 18+ (20 LTS recommended)
- GitHub account (repo already on `main`)
- [Supabase](https://supabase.com) account
- [Netlify](https://netlify.com) account

---

## 1. Supabase (database + auth)

### Create project

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. Pick org, name (e.g. `sentinel-india`), strong DB password, region close to users (e.g. Mumbai / Singapore)
3. Wait until the project is ready

### Apply migrations (SQL Editor)

In **SQL Editor**, run these files **in order** (copy entire file contents each time):

1. `supabase/migrations/20260728061302_create_sentinel_india_schema.sql`
2. `supabase/migrations/20260728061354_seed_assessment_scenarios.sql`
3. `supabase/migrations/20260728134223_extend_participant_behavioral_profile.sql`
4. `supabase/migrations/20260730120000_seed_adaptive_scenarios.sql`

Confirm tables exist under **Table Editor**: `languages`, `participants`, `scenarios`, `scenario_options`, `assessments`, `responses`, `behavior_scores`, `personas`, `analytics`, `feedback`.

### Auth (admin dashboard)

1. **Authentication → Providers** → enable **Email**
2. **Authentication → Users → Add user** → create your admin email/password  
   (used on `/admin`)

### Copy API keys

**Project Settings → API**:

| Env var | Value |
|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (secret — server only) |

---

## 2. Local verify (optional but recommended)

```powershell
cd c:\Users\Administrator\sentinelindiafrauddetection
copy .env.example .env.local
# Edit .env.local with your real Supabase values
npm install
npm run build
npm run start
```

Open http://localhost:3000 — smoke-test home, assessment, and `/admin` login.

---

## 3. Netlify deploy

### Connect the site

1. [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Connect GitHub → select `Yaathrapalani/sentinelindiafrauddetection`
3. Branch: `main`
4. Build settings (should match `netlify.toml`):
   - **Build command:** `npx next build`
   - **Publish directory:** `.next`
   - Plugin: `@netlify/plugin-nextjs` (already in repo)

### Environment variables

**Site configuration → Environment variables** → add for **Production** (and Preview if you want):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Redeploy after saving env vars (**Deploys → Trigger deploy → Clear cache and deploy site**).

### Custom domain (optional)

**Domain management → Add domain** → follow DNS instructions (A/CNAME or Netlify nameservers).

---

## 4. Post-deploy checklist

- [ ] Landing page loads on the Netlify URL
- [ ] Assessment flow completes and writes a participant row in Supabase
- [ ] `/admin` accepts the Auth user you created
- [ ] Research dashboard shows data after at least one completed assessment
- [ ] HTTPS works (Netlify default certificate)

---

## 5. Ongoing updates

Push to `main` → Netlify auto-builds.

```powershell
git add .
git commit -m "your message"
git push origin main
```

New SQL changes: apply in Supabase SQL Editor (or Supabase CLI) **before** relying on new columns/tables in production.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails: missing Supabase env | Set `NEXT_PUBLIC_*` vars on Netlify, clear cache, redeploy |
| Blank / runtime “Missing Supabase…” | Same — public env vars must be present at **build** time for Next |
| Assessment doesn’t save | Migrations not applied, or RLS policies blocking — re-run schema SQL |
| Admin login fails | Create user in Supabase Auth; Email provider enabled |
| Old site after push | Wait for deploy; or clear cache and redeploy |

---

## Architecture reference

See `ARCHITECTURE.md` for routes, schema, and scoring details.
