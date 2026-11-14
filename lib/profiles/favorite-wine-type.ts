import { WINE_TYPES, type WineType } from '@/lib/types/wine'

// The <Select> can't submit an empty value, so "No preference" is sent as
// this sentinel and stored as null.
export const NO_FAVORITE_WINE_TYPE = 'none'

export function parseFavoriteWineType(raw: FormDataEntryValue | null): { value: WineType | null } | { error: string } {
  if (raw === null || raw === '' || raw === NO_FAVORITE_WINE_TYPE) return { value: null }
  const match = WINE_TYPES.find((type) => type === raw)
  return match ? { value: match } : { error: 'Choose a valid wine type.' }
}
