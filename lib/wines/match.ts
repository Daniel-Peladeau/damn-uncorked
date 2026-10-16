import type { Wine } from '@/lib/types/wine'
import type { WineFilters } from '@/lib/types/filters'
import { foldDiacritics } from '@/lib/utils'

// Case-insensitive, diacritic-insensitive substring match across every
// field the search UI advertises (name, winery, region, grape, or type)
// plus country, since a wine's country is shown right alongside its region
// on every card. Country is deliberately not in the search UI's own
// wording; anyone typing "New Zealand" still expects it to work like
// region does.
export function matchesSearch(wine: Wine, query: string): boolean {
  const q = foldDiacritics(query.trim().toLowerCase())
  if (q.length === 0) return true

  const fold = (value: string) => foldDiacritics(value.toLowerCase())

  return (
    fold(wine.name).includes(q) ||
    fold(wine.winery).includes(q) ||
    fold(wine.region).includes(q) ||
    fold(wine.country).includes(q) ||
    fold(wine.type).includes(q) ||
    wine.grapes.some((grape) => fold(grape).includes(q))
  )
}

export function matchesFilters(wine: Wine, filters: WineFilters): boolean {
  if (filters.types.length > 0 && !filters.types.includes(wine.type)) return false
  if (filters.buyAgain && wine.wouldBuyAgain !== true) return false
  if (filters.status === 'unreviewed' && wine.reviewedByMe) return false
  if (filters.status === 'both' && !(wine.reviewedByMe && wine.reviewedByPartner)) return false
  return true
}
