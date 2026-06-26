# MVP Tasks: App Layout & Navigation

## Phase 1: Layout Foundation
- [x] Create `components/layout/AppLayout.tsx` — main wrapper with sidebar, top bar, content area
- [x] Create `components/layout/Sidebar.tsx` — navigation links (Dashboard, Wines, Map, About)
- [x] Create `components/layout/TopBar.tsx` — page title header
- [x] Update `app/layout.tsx` to wrap routes with AppLayout
- [x] Test: Sidebar visible on desktop, hamburger menu on mobile
- [x] Commit: "feat: add layout foundation with sidebar and top bar"

## Phase 2: Mock Data
- [x] Create `lib/mock-data.ts` with 10 sample wines (winery, grape, region, ratings)
- [x] Create `components/PageHeader.tsx` — reusable page title component
- [x] Test: Mock data imports without errors
- [x] Commit: "feat: add mock wine data and page header component"

## Phase 3: Dashboard Page
- [x] Create `components/WineCard.tsx` — wine summary card component
- [x] Create `app/page.tsx` — homepage (redirects to dashboard)
- [x] Create `app/dashboard/page.tsx` — displays top 3 wines, "Add Wine" button, about section
- [x] Test: Dashboard loads with 3 wine cards, button clickable
- [x] Test: Mobile responsiveness
- [x] Commit: "feat: add dashboard homepage with top 3 wines"

## Phase 4: Core Pages
- [x] Create `components/WineTable.tsx` — table component for wine list
- [x] Create `app/wines/page.tsx` — wine list with table
- [x] Create `app/wines/[id]/page.tsx` — wine detail view (mock data)
- [x] Create `app/about/page.tsx` — about/info page
- [x] Create `app/map/page.tsx` — map placeholder
- [x] Test: Navigate between all pages via sidebar, links work
- [x] Test: Wine detail page loads with correct wine data
- [x] Test: Mobile navigation (hamburger menu)
- [x] Commit: "feat: add core pages (wines, about, map)"

## Phase 5: Add Wine Form Scaffold
- [x] Create `app/wines/new/page.tsx` — add wine form skeleton
- [x] Add form fields: winery name, wine name, vintage, grapes, region, ratings
- [x] Use shadcn form components (Input, Select, Textarea, etc.)
- [x] Add "Submit" and "Cancel" buttons
- [x] Test: Form renders, inputs are editable, buttons clickable
- [x] Test: Form responsiveness on mobile
- [x] Commit: "feat: add wine form scaffold (no submission logic yet)"

## Verification (Final)
- [x] Run `npm run dev` — no errors
- [x] Visit http://localhost:3000 → dashboard loads
- [x] Test all sidebar navigation
- [x] Test mobile (DevTools) — sidebar collapses, hamburger works
- [x] No TypeScript errors in terminal
- [ ] Git branch merged to main (or PR ready)

## Completed Features ✅

### Layout & Navigation
- Persistent sidebar with active link states
- Top bar with page titles
- Mobile-responsive hamburger menu
- Lucide icons for nav items

### Pages
- Dashboard (homepage with redirect) — shows top 3 wines, stats, About section, Add Wine CTA
- Wine List — grid display of all 10 mock wines
- Wine Detail — full wine info with ratings breakdown, tasting notes, food pairing
- Add Wine Form — all fields for logging a new wine with ratings
- About — comprehensive info page about the app and how to use it
- Map — placeholder for future Leaflet integration

### Components
- AppLayout — main wrapper with sidebar + top bar
- Sidebar — navigation with mobile menu toggle
- TopBar — page title bar
- PageHeader — reusable title + action component
- WineCard — clickable wine card with summary info and ratings
- WineTable — (created but not explicitly used yet)

### Mock Data
- 10 sample wines with full details (winery, region, grapes, ratings, tasting notes, food pairings)
- Wines sorted by overall rating for dashboard top 3

### Styling
- Tailwind CSS with shadcn/ui Nova preset
- Dark mode friendly colors (card, foreground, muted-foreground, etc.)
- Responsive grid layouts
- Star rating visualization

## Notes
- Using mock data only — no DB queries in this phase
- All pages wrapped by AppLayout automatically
- Responsive design tested and working
- No form submission logic yet (scaffold only)
- Next step: Wire up Supabase for real data persistence
