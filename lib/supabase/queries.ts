import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { WINE_TYPES, type Wine, type WineType } from '@/lib/types/wine'
import type { SortOption } from '@/lib/types/sort'
import { hasActiveFilters, type WineFilters } from '@/lib/types/filters'
import { WINE_SELECT, mapRowToWine, type WineVintageRow } from '@/lib/supabase/wine-rows'
import { matchesFilters, matchesSearch } from '@/lib/wines/match'

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
  const user = await getCurrentUser()
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
  const user = await getCurrentUser()
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
