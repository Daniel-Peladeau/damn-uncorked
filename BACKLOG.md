# DamnUncorked — Backlog

A prioritized list of features and tasks. Work top-to-bottom within each phase.
Check boxes as items are completed. Claude Code reads this file at the start of each session.

---

## Phase 1 — Auth & Infrastructure
*Nothing else ships without this. Do these in order.*

- [x] Set up Google OAuth provider in Supabase dashboard
- [x] Configure allowed redirect URLs in Supabase (localhost:3000 + Vercel production URL)
- [x] Build `/auth/signin` page — Google OAuth button + magic link fallback
- [x] Build `/auth/callback` route handler — exchanges OAuth code for session
- [x] Write `proxy.ts` — protect all routes, redirect unauthenticated users to `/auth/signin` (Next.js 16 uses `proxy.ts` not `middleware.ts`)
- [x] On sign-in, verify user email against `allowed_users` table — reject if not listed
- [x] Add sign-out button to sidebar footer
- [x] Connect GitHub repo to Vercel, add env vars to Vercel dashboard
- [x] Add production URL to Supabase redirect allowlist + Google OAuth console

---

## Phase 1.5 — Dependency Security (Dependabot)
*36 open Dependabot alerts on `main` as of 2026-08-31 (18 high, 17 medium, 1 low). Clear before piling on more Phase 2+ code — see https://github.com/Daniel-Peladeau/damn-uncorked/security/dependabot.*

- [x] Upgrade `next` (currently 16.2.9) to the patched release — covers the bulk of the high/medium `next` alerts (Server Actions DoS/SSRF, Turbopack middleware bypass, rewrites SSRF, cache confusion, Image Optimization DoS, internal Server Function disclosure, unbounded Edge payload)
- [x] Run a dependency audit/update pass for transitive packages and re-check remaining alerts: `brace-expansion`, `fast-uri`, `ip-address`, `js-yaml`, `nanoid`, `postcss`, `sharp`, `undici`, `hono` / `@hono/node-server`
- [x] Re-run `gh api repos/Daniel-Peladeau/damn-uncorked/dependabot/alerts` (or check the Dependabot tab) after upgrades to confirm the count has dropped, and triage/dismiss any that don't apply to how this app actually uses the package

---

## Phase 2 — Real Data (Replace Mock)
*Requires Phase 1 complete. Work in this order — each depends on the previous.*

- [x] Wire up wine entry form — find-or-create winery, create wine + vintage + review rows
- [x] Wine list page — fetch real wines from Supabase (replace mockWines)
- [x] Wine detail page — fetch real wine + reviews from Supabase (replace mockWines.find)
- [x] Dashboard — real top wines, real stats (total, avg rating, would-buy-again count)
- [x] Remove `lib/mock-data.ts` once all pages use real data

---

## Phase 3 — Reviews
*The core of the app — Dan and Madison each log independent reviews.*

- [x] Display both users' reviews on wine detail page (side by side or tabbed)
- [x] Show combined/averaged scores where both have reviewed
- [x] Edit existing review (update form pre-populated with saved values)
- [x] "Not yet reviewed" state — prompt the current user to add their review

---

## Phase 4 — Winery Map
- [x] Implement Leaflet + react-leaflet on `/map` page
- [x] Plot all wineries with PostGIS coordinates on OpenStreetMap tiles
- [x] Clicking a pin opens a popup with winery name + link to their wines
- [x] Handle SSR: Leaflet is client-only, needs dynamic import with `ssr: false`

---

## Phase 5 — Enhancements
*Auto-fetch (PR #40) hotlinks a bottle photo from Open Food Facts by winery+wine name during entry — free, no key, but coverage is hit-or-miss (weak for boutique wines) and image QUALITY is inconsistent since it's crowd-sourced (e.g. Kim Crawford's photo has other items visible in the background). Manual upload below is still needed as the real fix for both gaps, not just a fallback for zero-coverage wines.*

- [ ] Label photo upload — Supabase Storage, URL saved to `wine_vintages.label_image_url`
- [ ] Display label photo on wine detail page
- [ ] Wine search — filter by name, winery, region, grape, or type
- [ ] Sort wines — by rating, vintage, date added
- [ ] Delete wine / review (with confirmation)

---

## Phase 6 — Polish & Deploy
- [ ] Build public landing page at `/` (GitHub issue #11)
- [ ] Mobile testing pass — all pages, sidebar, forms
- [ ] Empty states — what shows when no wines are logged yet
- [ ] Loading states — skeletons while Supabase data fetches
- [ ] Error boundaries — graceful fallback if a page fetch fails
- [ ] Final Vercel production deploy + smoke test

---

## Completed
- [x] Next.js scaffold with TypeScript strict mode, Tailwind, shadcn/ui Nova preset
- [x] Supabase project created (US East), PostGIS enabled, full schema applied
- [x] Supabase client helpers (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [x] App layout: sidebar, top bar, mobile hamburger menu
- [x] Core pages: Dashboard, Wines, Wine Detail, Add Wine (scaffold), About, Map (placeholder)
- [x] WineCard and PageHeader reusable components
- [x] shadcn/ui form components: Input, Textarea, Label, Checkbox, Select
- [x] Wine type moved to `lib/types/wine.ts`, fortified added to union
- [x] Sidebar active state fixed for sub-routes
- [x] Server components used correctly (no unnecessary `'use client'`)
- [x] `noUnusedLocals` / `noUnusedParameters` enforced in tsconfig
- [x] MVP PR reviewed, fixed, and merged to main
