<div align="center">

# 🍾 DamnUncorked

**A private wine logging, rating & discovery site for Dan & Madison**

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## ✨ Features

- 🍷 **Wine logging** — record every bottle with winery, vintage, grape varieties, and label photo
- ⭐ **Multi-criteria ratings** — score on appearance, nose, palate, finish, and value independently
- 📊 **Rankings** — combined and per-user leaderboards that actually differentiate good wines from great ones
- 🗺️ **Winery map** — interactive map of every winery you've tried, powered by OpenStreetMap
- 🍇 **Grape tracking** — see which varietals you've explored across whites, rosés, and sparkling
- 👤 **Independent reviews** — Dan and Madison each log their own take on the same bottle
- 📱 **Mobile-first** — designed to be used at the table, at a winery, or on the couch

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Nova preset) |
| Database | Supabase — Postgres + PostGIS |
| Auth | Supabase Auth — Google OAuth |
| Storage | Supabase Storage (wine label photos) |
| Map | Leaflet + react-leaflet + OpenStreetMap |
| Hosting | Vercel (Hobby) |

---

## 🚀 Local Development

**Prerequisites:** Node.js 18+, a Supabase project, Git

```bash
# 1. Clone the repo
git clone https://github.com/Daniel-Peladeau/damn-uncorked.git
cd damn-uncorked

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key in .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app running.

---

## 🗄️ Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Enable the **PostGIS** extension under Database → Extensions
3. Run the full schema in the SQL Editor:

```bash
# Schema lives here:
supabase/schema.sql
```

Tables created: `allowed_users`, `wineries`, `grapes`, `wines`, `wine_vintages`, `wine_grapes`, `reviews`
Views created: `wine_rankings`

---

## 🔑 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

See `.env.local.example` for the full list.

---

## 📁 Project Structure

```
damn-uncorked/
├── app/                  # Next.js App Router pages & layouts
│   └── api/              # API route handlers
├── components/           # Shared UI components
├── lib/
│   ├── supabase/         # Supabase client helpers (browser + server)
│   └── types/            # Shared TypeScript types
├── supabase/
│   └── schema.sql        # Full database schema
├── public/               # Static assets
├── .env.local.example    # Environment variable template
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

---

<div align="center">

Made with 🍾 by Dan & Madison

</div>
