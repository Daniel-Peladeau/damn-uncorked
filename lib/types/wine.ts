export type WineType = 'white' | 'rosé' | 'sparkling' | 'red' | 'dessert' | 'fortified'

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
