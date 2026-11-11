<div align="center">

# 🍾 DamnUncorked

**A private wine logging, rating & discovery site for Dan & Madison**

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## ✨ Features

- 🍷 **Wine logging** — record every bottle with winery, vintage, type, and grape varieties (blends with percentages supported); edit or delete a wine after the fact
- 🖼️ **Label photos** — a bottle photo is looked up automatically from [Open Food Facts](https://world.openfoodfacts.org) when you log a wine
- ⭐ **Multi-criteria ratings** — score appearance, nose, palate, finish, and value independently, plus an overall 1–10
- 👥 **Independent reviews** — Dan and Madison each log, edit, or delete their own take on the same bottle, with combined scores shown side by side
- 📊 **Dashboard** — your top wines and running stats (total logged, average rating, would-buy-again count)
- 🔎 **Search, filter & sort** — find wines by name, winery, region, grape, or type; filter chips for type, would-buy-again, and review status; sort by rating, vintage, or date added
- ⌘ **Command palette** — press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> anywhere for global search and quick navigation
- 🗺️ **Winery map** — interactive map of every winery you've tried, with live location search (OpenStreetMap Nominatim) when adding a winery
- 🌗 **Light / dark / system theme**
- 📱 **Mobile-friendly** — bottom navigation with one-tap Add Wine, built to use at the table, at a winery, or on the couch
- 🔒 **Private by design** — Google OAuth or magic-link sign-in, restricted to an email allowlist

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (Nova preset), Geist font |
| Icons | Lucide (`lucide-react`) |
| Command palette | `cmdk` (via shadcn `command` + `dialog`) |
| Theming | `next-themes` |
| Database | Supabase — Postgres + PostGIS, Row Level Security on every table |
| Auth | Supabase Auth — Google OAuth + magic link, email allowlist |
| Storage | Supabase Storage (wine label photos) |
| Map | Leaflet + react-leaflet + OpenStreetMap tiles, Nominatim geocoding |
| Hosting | Vercel (Hobby) |

---

## 🚀 Local Development

**Prerequisites:** Node.js 20.9+, a Supabase project, Git

```bash
# 1. Clone the repo
git clone https://github.com/Daniel-Peladeau/damn-uncorked.git
cd damn-uncorked

# 2. Install dependencies
npm install

# 3. Create .env.local with your Supabase URL and anon key (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Every route except the landing page and `/auth/*` requires a signed-in, allowlisted account.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

### Adding shadcn/ui components

The shadcn CLI is intentionally **not** a project dependency. Run it on demand:

```bash
npx shadcn@latest add <component>
```

---

## 🔑 Environment Variables

Create `.env.local` in the project root (it is git-ignored — never commit it):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🗄️ Database

Supabase Postgres with the **PostGIS** extension enabled. Migrations are applied directly to the Supabase project (dashboard / Supabase MCP) — there is no migrations folder in this repo. Generated types live in `lib/types/database.ts`.

| Table | Purpose |
|---|---|
| `allowed_users` | Email allowlist (Dan + Madison) |
| `wineries` | Name, region, country, website, notes, PostGIS `geography(POINT)` |
| `grapes` | Grape varieties and color |
| `wines` | An abstract wine product, linked to a winery |
| `wine_vintages` | A specific year of a wine, with label photo URL |
| `wine_grapes` | Wine ↔ grape join table (blend percentages) |
| `reviews` | One row per user per vintage, with all rating fields |

View: `wine_rankings` (aggregated scores per vintage).

---

## 📁 Project Structure

```
damn-uncorked/
├── app/
│   ├── page.tsx          # Public landing page
│   ├── (app)/            # Signed-in app: dashboard, wines, map, about
│   ├── api/geocode/      # Winery location search (Nominatim)
│   └── auth/             # Sign-in page + OAuth callback
├── components/           # Shared UI (forms/, layout/, ui/ = shadcn)
├── lib/
│   ├── supabase/         # Supabase clients (browser + server) and queries
│   ├── wines/            # Wine/winery/vintage find-or-create logic
│   ├── reviews/          # Review validation
│   └── types/            # Shared TypeScript types
├── docs/                 # Architecture diagram
├── public/               # Static assets
├── proxy.ts              # Auth guard (Next.js 16's replacement for middleware.ts)
├── BACKLOG.md            # Live roadmap / task tracker
└── CLAUDE.md             # AI assistant conventions (read this first)
```

---

## ⭐ Rating System

Each wine review scores five criteria independently on a **1–5 scale**, plus an overall gut-feel score out of 10:

| Criteria | What you're scoring |
|---|---|
| 👁️ Appearance | Color, clarity, bubbles |
| 👃 Nose | Aroma complexity and pleasantness |
| 👅 Palate | How it actually tastes |
| ⏱️ Finish | How long the taste lingers |
| 💰 Value | Was it worth what you paid? |
| ⭐ Overall | Your holistic 1–10 — not an average |

Reviews also capture tasting notes, food pairing, occasion, and whether you'd buy it again.

---

## 🤝 Contributing

- Never push to `main` — use `feat/…`, `fix/…`, or `chore/…` branches and open a PR
- Conventional commit messages (`feat: add wine entry form`)
- Squash-merge after CI passes, then delete the branch
- See [`CLAUDE.md`](CLAUDE.md) for full conventions and [`BACKLOG.md`](BACKLOG.md) for what's next

---

<div align="center">

Made with 🍾 by Dan & Madison

</div>
