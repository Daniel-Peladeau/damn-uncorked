import type { Database } from '@/lib/types/database'

// Narrowed to just the columns the detail page's query selects — the full
// table Row also has currency/price_paid/purchase_location/tasted_on/
// updated_at, which aren't fetched there.
export type Review = Pick<
  Database['public']['Tables']['reviews']['Row'],
  | 'id'
  | 'wine_vintage_id'
  | 'user_id'
  | 'appearance'
  | 'nose'
  | 'palate'
  | 'finish'
  | 'value'
  | 'overall'
  | 'tasting_notes'
  | 'food_pairing'
  | 'would_buy_again'
  | 'occasion'
  | 'created_at'
>

export const RATING_CATEGORIES = [
  { label: 'Appearance', key: 'appearance' as const },
  { label: 'Nose', key: 'nose' as const },
  { label: 'Palate', key: 'palate' as const },
  { label: 'Finish', key: 'finish' as const },
  { label: 'Value', key: 'value' as const },
]

export type RatingKey = (typeof RATING_CATEGORIES)[number]['key']

// Rounded to 1 decimal place — these are averages of small integers (1-5 or
// 1-10), so more precision would just be noise.
export function average(values: number[]): number {
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10
}
