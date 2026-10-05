// Kept separate from lib/supabase/queries.ts for the same reason as
// lib/types/sort.ts: FilterChips (a client component) needs the parser and
// constants without pulling the server-only Supabase client into the bundle.

import { WINE_TYPES, type WineType } from '@/lib/types/wine'

// "unreviewed" and "both" are mutually exclusive (reviewed-by-both implies
// reviewed-by-me), so status is a single value rather than a set.
export const REVIEW_STATUSES = ['unreviewed', 'both'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export type WineFilters = {
  types: WineType[]
  buyAgain: boolean
  status: ReviewStatus | null
}

export type WineFilterParams = {
  type?: string | string[]
  buy?: string | string[]
  status?: string | string[]
}

// Next.js delivers a repeated URL param (?type=a&type=b) as string[] at
// runtime regardless of the declared type — take only the first so a
// hand-crafted URL degrades to a valid filter instead of throwing.
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function isReviewStatus(value: string | undefined): value is ReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(value ?? '')
}

// Unknown values are dropped rather than rejected, matching isSortOption:
// a stale or mistyped link should still render the list.
export function parseWineFilters(params: WineFilterParams): WineFilters {
  // NFC so a hand-typed decomposed "rose\u0301" still matches "rosé".
  const requested = new Set((first(params.type) ?? '').normalize('NFC').split(','))
  const status = first(params.status)

  return {
    // Filtered from WINE_TYPES (not the param) so the result is deduped and
    // in a stable order, which keeps the URL canonical when chips toggle.
    types: WINE_TYPES.filter((type) => requested.has(type)),
    buyAgain: first(params.buy) === '1',
    status: isReviewStatus(status) ? status : null,
  }
}

export function hasActiveFilters(filters: WineFilters): boolean {
  return filters.types.length > 0 || filters.buyAgain || filters.status !== null
}
