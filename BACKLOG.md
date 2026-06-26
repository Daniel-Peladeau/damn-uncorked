# DamnUncorked — Backlog

A prioritized list of features and tasks. Work top-to-bottom within each phase.
Check boxes as items are completed. Claude Code reads this file at the start of each session.

---

## Phase 1 — Auth & Infrastructure
*Nothing else ships without this. Do these in order.*

- [ ] Set up Google OAuth provider in Supabase dashboard
- [ ] Configure allowed redirect URLs in Supabase (localhost:3000 + future Vercel URL)
- [x] Build `/auth/signin` page — Google OAuth button + magic link fallback
- [x] Build `/auth/callback` route handler — exchanges OAuth code for session
- [x] Write `proxy.ts` — protect all routes, redirect unauthenticated users to `/auth/signin` (Next.js 16 uses `proxy.ts` not `middleware.ts`)
- [x] On sign-in, verify user email against `allowed_users` table — reject if not listed
- [x] Add sign-out button to sidebar footer
- [ ] Connect GitHub repo to Vercel, add env vars to Vercel dashboard
- [ ] Add production URL to Supabase redirect allowlist + Google OAuth console

---

## Phase 2 — Real Data (Replace Mock)
*Requires Phase 1 complete. Work in this order — each depends on the previous.*

- [ ] Wire up wine entry form — find-or-create winery, create wine + vintage + review rows
- [ ] Wine list page — fetch real wines from Supabase (replace mockWines)
- [ ] Wine detail page — fetch real wine + reviews from Supabase (replace mockWines.find)
- [ ] Dashboard — real top wines, real stats (total, avg rating, would-buy-again count)
- [ ] Remove `lib/mock-data.ts` once all pages use real data

---

## Phase 3 — Reviews
*The core of the app — Dan and Madison each log independent reviews.*

- [ ] Display both users' reviews on wine detail page (side by side or tabbed)
- [ ] Show combined/averaged scores where both have reviewed
- [ ] Edit existing review (update form pre-populated with saved values)
- [ ] "Not yet reviewed" state — prompt the current user to add their review

---

## Phase 4 — Winery Map
- [ ] Implement Leaflet + react-leaflet on `/map` page
- [ ] Plot all wineries with PostGIS coordinates on OpenStreetMap tiles
- [ ] Clicking a pin opens a popup with winery name + link to their wines
- [ ] Handle SSR: Leaflet is client-only, needs dynamic import with `ssr: false`

---

## Phase 5 — Enhancements
- [ ] Label photo upload — Supabase Storage, URL saved to `wine_vintages.label_photo_url`
- [ ] Display label photo on wine detail page
- [ ] Wine search — filter by name, winery, region, grape, or type
- [ ] Sort wines — by rating, vintage, date added
- [ ] Delete wine / review (with confirmation)

---

## Phase 6 — Polish & Deploy
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
