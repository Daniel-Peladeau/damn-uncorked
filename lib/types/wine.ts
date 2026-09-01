export type WineType = 'white' | 'rosé' | 'sparkling' | 'red' | 'dessert' | 'fortified'

// Single source of truth for the wine type enum's runtime values — shared by
// the entry form's <Select> options and the server action's validation so
// the two can't drift apart.
export const WINE_TYPES = [
  'white',
  'rosé',
  'sparkling',
  'red',
  'dessert',
  'fortified',
] as const satisfies readonly WineType[]

export type Wine = {
  id: string
  name: string
  winery: string
  vintage: number
  region: string
  country: string
  grapes: string[]
  type: WineType
  ratings: {
    appearance?: number
    nose?: number
    palate?: number
    finish?: number
    value?: number
    overall?: number
  }
  tastingNotes?: string
  foodPairing?: string
  wouldBuyAgain?: boolean
}
