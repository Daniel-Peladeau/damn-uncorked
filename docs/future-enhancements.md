# Future Enhancements

Candidate features that aren't GitHub issues yet. When one is picked up, open an issue, add it to `BACKLOG.md`, and remove it from this file.

Already filed as issues: navigation & usability (#74–#78), profile page (#79), database search + pagination (#80).

---

## Account & Profile

### Profile photo upload
The profile page (#79) shows initials only. Once label photo upload (#41) adds a Supabase Storage bucket pattern, reuse it for avatars and save the public URL to `profiles.avatar_url` (the column only accepts `https://` URLs).

**Why:** A photo is friendlier than an initial, and the column is already in place.

### Export my data + delete account
- **Export:** download all of my reviews (joined with wine/winery/vintage) as CSV or JSON from the profile page.
- **Delete:** with only two allowlisted users, "delete account" mostly means "delete my reviews". Removing the Supabase auth user requires the service-role key, so it must run in a server-only route handler and never be exposed to the client (see CLAUDE.md). Require a typed confirmation and offer export first.

**Why:** Export is a safety net and is useful in its own right. Delete is rarely needed but should be a deliberate, safe flow.

### Settings page
Lives alongside the profile page (#79). Preferences such as default sort on `/wines`, which score the wine list shows (mine / partner's / average), and theme (once dark mode #74 lands). Store in `profiles` or a `user_settings` table.

**Why:** Keeps the profile page simple once there are several options.

---

## Feedback & popup information

### Toast notifications
Add shadcn `sonner` (update CLAUDE.md for the new dependency). Fire toasts after server actions: review saved/deleted, wine edited, sign-in errors. Mount `<Toaster />` in `app/layout.tsx`.

**Why:** Actions currently redirect silently. This is a small change that makes the whole app feel responsive. **High priority.**

### Rating field tooltips
Add an ⓘ tooltip (shadcn `tooltip`, which also needs to work on tap for mobile) next to Appearance, Nose, Palate, Finish, Value and Overall on the review form and detail page, each with a one-line definition.

**Why:** Keeps both reviewers' scoring consistent over time.

### Quick-view dialog on wine cards
Use Next.js intercepting + parallel routes (`@modal/(.)wines/[id]`) so clicking a `WineCard` opens a dialog with both reviews, while a direct visit or refresh still renders the full page.

**Why:** Browse several wines without losing your scroll position in the list.

### Unsaved-changes warning on forms
Warn before navigating away from a dirty `ReviewForm`, `EditWineForm`, or the add-wine form (`beforeunload` + intercepting in-app link clicks).

**Why:** Prevents losing half-written tasting notes.

---

## Speed & performance

### Caching and streaming
Use Next.js 16 caching (`use cache` + `revalidateTag` from the server actions that mutate data) for the dashboard and wine list. Wrap the slower dashboard sections in `<Suspense>` so the rest of the page renders first.

**Why:** Fewer Supabase round trips on repeat visits and a faster first paint.

### Image optimisation for label photos
When label photo upload (#41) lands: resize/compress on the client before upload (e.g. max 1600px, WebP), add the Supabase Storage host to `images.remotePatterns` in `next.config.ts`, and always render through `next/image` with `sizes`.

**Why:** Raw phone photos are 5–10 MB each.

### Vercel Speed Insights + Web Analytics
Add `@vercel/speed-insights` and `@vercel/analytics` (both free on Hobby).

**Why:** Measures real load times on your own phones, so performance work is based on measurements rather than guesses.

---

## Features

### Stats / insights page
Favourite grapes and regions, average score by type, how often Dan and Madison agree (score delta per shared wine), ratings over time, would-buy-again rate. Computed from existing data, nothing new stored (consistent with "combined scores are computed, not stored").

### "Want to try" wishlist
Wines heard about but not yet tasted. Either a `status` column on `wine_vintages` or a separate `wishlist` table. Show on the dashboard, and add "Mark as tasted → write review" to move an item into the log.

### Installable app (PWA)
Add `app/manifest.ts`, proper app icons and a favicon (`public/` still has the default Next.js SVGs), theme colour, and optionally a service worker for an offline shell.

**Why:** Opens from the phone home screen like a native app, which suits logging at a restaurant.

### Barcode / label scan to pre-fill Add Wine
Use the phone camera (`BarcodeDetector` API, or a small library as a fallback) to read the EAN barcode, look it up in Open Food Facts (already used for photos in `lib/wine-photo.ts`), and pre-fill the winery and wine name.

---

## Quality & safety nets

### Automated tests + CI
- Vitest unit tests for `lib/wines/grapes.ts`, `lib/reviews/validation.ts`, `lib/types/sort.ts`, and `matchesSearch`
- A Playwright smoke test that uses a real signed-in test session. **No auth bypass in `proxy.ts`.**
- A GitHub Action running `lint`, `tsc --noEmit`, `build` and tests on every PR

**Why:** CLAUDE.md says "squash-merge after CI passes", but there's no CI yet.

### Accessibility pass
Keyboard navigation through all forms and menus, visible focus states, `alt` text on label images, colour contrast (especially after the redesign in #50 and dark mode in #74), and form labels/errors linked with `aria-describedby`.
