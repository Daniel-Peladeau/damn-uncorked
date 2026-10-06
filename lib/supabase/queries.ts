import { createClient } from '@/lib/supabase/server'
import { WINE_TYPES, type Wine, type WineType } from '@/lib/types/wine'
import type { SortOption } from '@/lib/types/sort'
import { hasActiveFilters, type WineFilters } from '@/lib/types/filters'
import { foldDiacritics } from '@/lib/utils'

// No generated Database types exist in this repo yet, so the query result is
// typed to match this exact select string rather than widened to `any`.
const WINE_SELECT = `
  id,
  vintage_year,
  wines (
    name,
    wine_type,
    region,
    country,
    winery:wineries ( name ),
    wine_grapes ( grapes ( name ) )
  ),
  reviews!left (
    appearance,
    nose,
    palate,
    finish,
    value,
    overall,
    tasting_notes,
    food_pairing,
    would_buy_again
  ),
  review_authors:reviews ( user_id )
`

type WineVintageRow = {
  id: string
  vintage_year: number | null
  wines: {
    name: string
    wine_type: Wine['type']
    region: string | null
    country: string | null
    winery: { name: string } | null
    wine_grapes: { grapes: { name: string } }[]
  }
  // `reviews!left` + `.eq('reviews.user_id', ...)` scopes this to at most the
  // current user's own review, but the relationship is still one-to-many —
  // an empty array means "not yet reviewed by this user".
  reviews: {
    appearance: number | null
    nose: number | null
    palate: number | null
    finish: number | null
    value: number | null
    overall: number | null
    tasting_notes: string | null
    food_pairing: string | null
    would_buy_again: boolean | null
  }[]
  // A second, unfiltered embed of the same relation (the user_id filter
  // above targets only the unaliased `reviews` embed) so the
  // "reviewed by both" filter can see whether the partner has reviewed too.
  // Only user_id is selected — the partner's scores aren't needed here.
  review_authors: { user_id: string }[]
}

// Case-insensitive, diacritic-insensitive substring match across every
// field the search UI advertises (name, winery, region, grape, or type)
// plus country, since a wine's country is shown right alongside its region
// on every card. Country is deliberately not in the search UI's own
// wording; anyone typing "New Zealand" still expects it to work like
// region does.
function matchesSearch(wine: Wine, query: string): boolean {
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

function matchesFilters(wine: Wine, filters: WineFilters): boolean {
  if (filters.types.length > 0 && !filters.types.includes(wine.type)) return false
  if (filters.buyAgain && wine.wouldBuyAgain !== true) return false
  if (filters.status === 'unreviewed' && wine.reviewedByMe) return false
  if (filters.status === 'both' && !(wine.reviewedByMe && wine.reviewedByPartner)) return false
  return true
}

function mapRowToWine(row: WineVintageRow, userId: string): Wine {
  const review = row.reviews[0]

  return {
    id: row.id,
    name: row.wines.name,
    winery: row.wines.winery?.name ?? '',
    vintage: row.vintage_year ?? 0,
    region: row.wines.region ?? '',
    country: row.wines.country ?? '',
    grapes: row.wines.wine_grapes.map((wineGrape) => wineGrape.grapes.name),
    type: row.wines.wine_type,
    ratings: {
      appearance: review?.appearance ?? undefined,
      nose: review?.nose ?? undefined,
      palate: review?.palate ?? undefined,
      finish: review?.finish ?? undefined,
      value: review?.value ?? undefined,
      overall: review?.overall ?? undefined,
    },
    tastingNotes: review?.tasting_notes ?? undefined,
    foodPairing: review?.food_pairing ?? undefined,
    wouldBuyAgain: review?.would_buy_again ?? undefined,
    reviewedByMe: review !== undefined,
    reviewedByPartner: row.review_authors.some((author) => author.user_id !== userId),
  }
}

export type WineList = {
  wines: Wine[]
  // Size and types of the whole collection, before search/filters, so the
  // page can tell "nothing logged yet" from "nothing matches" and offer
  // only the type chips that would return something.
  totalCount: number
  loggedTypes: WineType[]
}

const EMPTY_WINE_LIST: WineList = { wines: [], totalCount: 0, loggedTypes: [] }

export async function getWinesForUser(
  sortBy: SortOption = 'recent',
  search?: string,
  filters?: WineFilters
): Promise<WineList> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return EMPTY_WINE_LIST

  const baseQuery = supabase.from('wine_vintages').select(WINE_SELECT).eq('reviews.user_id', user.id)

  // "vintage" and "recent" are genuine top-level wine_vintages columns, so
  // Postgrest can sort them at the database level. "rating" can't be pushed
  // down the same way: reviews is a one-to-many embed at the schema level
  // (many users could in principle review the same vintage), so Postgrest's
  // foreignTable ordering only reorders each row's embedded reviews array —
  // not the top-level rows — even though the .eq('reviews.user_id', ...)
  // filter above collapses it to at most one review per row in practice.
  // Sorted in JS below instead, after each row is mapped down to that one
  // (or zero) review.
  const query =
    sortBy === 'vintage'
      ? baseQuery.order('vintage_year', { ascending: false, nullsFirst: false })
      : baseQuery.order('created_at', { ascending: false })

  const { data, error } = await query.returns<WineVintageRow[]>()

  if (error) throw error

  // Search filters across name/winery/region/grape/type, which straddles
  // three levels of embedded relation (wines, wineries, and the doubly-
  // nested wine_grapes -> grapes) — not something a single Postgrest .or()
  // can express cleanly. Filtered in JS after mapping instead, same
  // reasoning as the rating sort below. The filter chips run here too
  // rather than as Postgrest filters: the full list is already in hand to
  // compute loggedTypes, and keeping every narrowing step in one place
  // leaves a single spot for #80 to move into SQL.
  const allWines = (data ?? []).map((row) => mapRowToWine(row, user.id))
  let wines = allWines

  if (search) {
    wines = wines.filter((wine) => matchesSearch(wine, search))
  }

  if (filters && hasActiveFilters(filters)) {
    wines = wines.filter((wine) => matchesFilters(wine, filters))
  }

  if (sortBy === 'rating') {
    // Wines this user hasn't rated yet (ratings.overall undefined) sort
    // last, matching the nullsFirst: false behavior used for the
    // database-level sorts above.
    wines.sort((a, b) => (b.ratings.overall ?? -Infinity) - (a.ratings.overall ?? -Infinity))
  }

  const typesInLog = new Set(allWines.map((wine) => wine.type))

  return {
    wines,
    totalCount: allWines.length,
    loggedTypes: WINE_TYPES.filter((type) => typesInLog.has(type)),
  }
}

export async function getWineById(vintageId: string): Promise<Wine | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('wine_vintages')
    .select(WINE_SELECT)
    .eq('id', vintageId)
    .eq('reviews.user_id', user.id)
    .maybeSingle()
    .returns<WineVintageRow>()

  if (error) throw error
  if (!data) return null

  return mapRowToWine(data, user.id)
}
