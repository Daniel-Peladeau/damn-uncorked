Review the current branch changes for code quality, correctness, and adherence to this project's conventions. Focus on changes since the branch diverged from main.

## What to check

**TypeScript**
- No `any` types or suppressed errors without an explanatory comment
- Strict mode compliance — no implicit `any`, no missing return types on exported functions
- Proper async/await usage, no floating promises

**Next.js / React**
- Server components used where possible; `'use client'` only when needed (event handlers, hooks, browser APIs)
- Dynamic route params awaited (`params: Promise<{id: string}>`, then `await params`)
- `useSearchParams()` wrapped in a `<Suspense>` boundary
- No direct data fetching in client components — use server components or server actions

**Supabase**
- All DB access goes through `lib/supabase/client.ts` (browser) or `lib/supabase/server.ts` (server)
- Never use the service role key in client-side code
- No `SELECT *` — always specify columns
- RLS is never bypassed from client code
- Queries check for both `data` and `error`, not just `data`

**Components**
- No file exceeds ~150 lines — split if needed
- Only Lucide icons from `lucide-react` — no other icon libraries
- shadcn/ui components used for all form inputs (Input, Textarea, Label, Select, Checkbox) — no raw HTML form elements

**Security**
- No secrets or env vars hardcoded
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the only key used client-side
- Auth-protected routes go through the proxy matcher

**General**
- No unused imports or variables
- No comments that describe *what* the code does — only *why* if non-obvious
- No mock data imported in production code paths
- Conventional commit style on any commits in the branch

## Output format

Report findings grouped by file. For each issue include: file path + line number, what the problem is, and a one-line fix. Skip anything that's fine — only report actual issues. End with a short summary of overall branch health.
