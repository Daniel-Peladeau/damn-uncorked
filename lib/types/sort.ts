// Kept separate from lib/supabase/queries.ts (which imports the server-only
// Supabase client via next/headers) so client components can import these
// constants without pulling a server-only module into the browser bundle.

export const SORT_OPTIONS = ['recent', 'rating', 'vintage'] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export function isSortOption(value: string | undefined): value is SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(value ?? '')
}
