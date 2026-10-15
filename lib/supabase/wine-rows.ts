import type { Wine } from '@/lib/types/wine'

// The query result is typed by hand (WineVintageRow below) to match this
// exact select string — it predates the generated types in
// lib/types/database.ts.
export const WINE_SELECT = `
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

export type WineVintageRow = {
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

export function mapRowToWine(row: WineVintageRow, userId: string): Wine {
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
