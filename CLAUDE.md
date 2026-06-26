# CLAUDE.md — DamnUncorked

A private wine logging, rating, and research site for Dan & Madison.

## Stack
- **Framework:** Next.js 16 (App Router) + TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui (Nova preset, Lucide icons, Geist font)
- **Database:** Supabase — Postgres + PostGIS + Auth + Storage
- **Hosting:** Vercel (Hobby — non-commercial)
- **Map:** Leaflet + react-leaflet + OpenStreetMap tiles

## Git Conventions
- NEVER push directly to `main`
- Branch naming: `feat/<description>`, `fix/<description>`, `chore/<description>`
- Commit style: conventional commits — `feat: add wine entry form`, `fix: login redirect`
- Always open a PR; squash-merge after CI passes
- Delete the branch after merging

## Project Structure
- `app/` — Next.js App Router pages and layouts
- `app/api/` — API route handlers
- `components/` — shared UI components
- `lib/supabase/` — Supabase client helpers (browser + server)
- `lib/types/` — shared TypeScript types and interfaces
- `public/` — static assets

## Code Conventions
- TypeScript strict mode — no `any`, no type suppression without a comment explaining why
- All database access goes through the Supabase client in `lib/supabase/`
- Never use the Supabase service role key in client-side code
- Use server components and server actions for data mutations where possible
- Components should be small and focused — split if a file exceeds ~150 lines
- Use Lucide icons from `lucide-react` — do not add other icon libraries

## Database Rules
- NEVER bypass Row Level Security (RLS) from client code
- All tables have RLS enabled and policies keyed to `auth.uid()`
- Two users only: Dan and Madison — enforced via an email allowlist in the `allowed_users` table
- Never store sensitive data (passwords, tokens) in the database directly — Supabase Auth handles this

## Database Schema (source of truth)
### Core tables
- `allowed_users` — email allowlist (2 rows: Dan + Madison)
- `wineries` — name, region, country, website, notes, PostGIS geography(POINT) for map
- `grapes` — name, color (white/rosé/sparkling/other), description
- `wines` — abstract wine product, linked to winery
- `wine_vintages` — specific year of a wine, linked to wines; one wine can have many vintages
- `wine_grapes` — join table linking wines to grapes (supports blends with percentage)
- `reviews` — one row per user per wine_vintage; contains all rating fields

### Review rating fields (Option A — confirmed)
- `appearance` int (1–5)
- `nose` int (1–5)
- `palate` int (1–5)
- `finish` int (1–5)
- `value` int (1–5)
- `overall` int (1–10)
- `tasting_notes` text
- `food_pairing` text
- `would_buy_again` boolean
- `occasion` text

## Auth
- Supabase Auth with Google OAuth as primary method
- Magic link email as fallback
- On sign-in, check user email against `allowed_users` table — reject if not listed
- RLS policies use `auth.uid()` to scope all data access

## Wine Focus
- Primary: whites, rosés, sparkling
- Reds are supported in the schema but not a current focus
- Wine type enum: white, rosé, sparkling, red, dessert, fortified

## Key Decisions
- Dan and Madison each log independent reviews of the same bottle
- Combined/averaged scores can be computed and displayed but are not stored
- `wines` and `wine_vintages` are separate tables — same wine across years = one wine, many vintages
- Winery coordinates use PostGIS geography(POINT) for native geo queries on the map
- Image storage via Supabase Storage (label photos linked from `wine_vintages`)
- No separate backend — Next.js API routes + Supabase client covers all needs

## Environment Variables
Required in `.env.local` (never commit this file):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Next.js 16 Conventions
- **Middleware file is `proxy.ts`** (not `middleware.ts`) — Next.js 16 renamed the convention; `middleware.ts` is deprecated and will log a warning
- The exported function must be named `proxy` (or be a default export): `export async function proxy(request: NextRequest)`
- `middleware.ts` still works but do not create it — if both files exist Next.js throws an error
- This was verified from `node_modules/next/dist/esm/lib/constants.js`: `PROXY_FILENAME = 'proxy'`

## Do Not
- Do not push `.env.local` or any file containing secrets to GitHub
- Do not install additional UI or icon libraries without updating this file
- Do not add a separate Express/Fastify backend — use Next.js API routes
- Do not store image binaries in Postgres — store URLs only
- Do not use `SELECT *` in queries — always specify columns

## Current Status (as of project start)

### Completed
- Next.js scaffolded with TypeScript, Tailwind, shadcn/ui (Nova preset)
- GitHub repo created: github.com/Daniel-Peladeau/damn-uncorked
- CLAUDE.md committed to repo
- Supabase project created (US East), PostGIS enabled
- Full database schema run successfully — all tables and views created
- Supabase client helpers created in lib/supabase/client.ts and server.ts
- .env.local configured with Supabase URL and anon key

### Next Steps (in order)
1. Set up Google OAuth in Supabase dashboard
2. Configure Supabase Auth redirect URLs
3. Build sign-in page in Next.js
4. Add auth middleware to protect routes
5. Connect Vercel and add env vars to dashboard
6. Build wine entry form (first real feature)

### Key Decisions for Claude Code to Know
- Two users only: Dan and Madison — emails stored in allowed_users table
- Ratings: appearance, nose, palate, finish, value (each 1–5) + overall (1–10)
- Wine focus: whites, rosés, sparkling primarily
- Dan and Madison log independent reviews of the same bottle
- Never push directly to main — always use feature branches and PRs