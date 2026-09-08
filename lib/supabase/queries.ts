import { createClient } from '@/lib/supabase/server'
import type { Wine } from '@/lib/types/wine'
import type { SortOption } from '@/lib/types/sort'

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
  )
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
}

function mapRowToWine(row: WineVintageRow): Wine {
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
  }
}

export async function getWinesForUser(sortBy: SortOption = 'recent'): Promise<Wine[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

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

  const wines = (data ?? []).map(mapRowToWine)

  if (sortBy === 'rating') {
    // Wines this user hasn't rated yet (ratings.overall undefined) sort
    // last, matching the nullsFirst: false behavior used for the
    // database-level sorts above.
    wines.sort((a, b) => (b.ratings.overall ?? -Infinity) - (a.ratings.overall ?? -Infinity))
  }

  return wines
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

  return mapRowToWine(data)
}
