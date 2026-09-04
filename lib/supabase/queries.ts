import { createClient } from '@/lib/supabase/server'
import type { Wine } from '@/lib/types/wine'

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

export async function getWinesForUser(): Promise<Wine[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('wine_vintages')
    .select(WINE_SELECT)
    .eq('reviews.user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<WineVintageRow[]>()

  if (error) throw error

  return (data ?? []).map(mapRowToWine)
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
