// Shared by the Add Wine and Edit Wine server actions — both accept the same
// wine fields, so the validation rules live in one place and can't drift.
import { WINE_TYPES, type WineType } from '@/lib/types/wine'
import { getTrimmedString, parseCanonicalInteger } from '@/lib/reviews/validation'
import { parseGrapeNames } from '@/lib/wines/grapes'

export type WineFields = {
  name: string
  wineryName: string
  region: string
  country: string
  type: WineType
  vintageYear: number
  grapeNames: string[]
}

function isWineType(value: string): value is WineType {
  return (WINE_TYPES as readonly string[]).includes(value)
}

export function parseWineFields(
  formData: FormData
): { ok: true; fields: WineFields } | { ok: false; error: string } {
  const name = getTrimmedString(formData, 'name')
  const wineryName = getTrimmedString(formData, 'winery')
  const region = getTrimmedString(formData, 'region')
  const country = getTrimmedString(formData, 'country')
  const type = getTrimmedString(formData, 'type')
  const vintageRaw = getTrimmedString(formData, 'vintage')
  const grapesRaw = getTrimmedString(formData, 'grapes')

  if (!name || !wineryName || !region || !country || !type || !vintageRaw || !grapesRaw) {
    return { ok: false, error: 'Please fill in all required fields.' }
  }

  if (!isWineType(type)) {
    return { ok: false, error: 'Please select a valid wine type.' }
  }

  const currentYear = new Date().getFullYear()
  const vintageYear = parseCanonicalInteger(vintageRaw)
  if (vintageYear === null || vintageYear < 1900 || vintageYear > currentYear + 1) {
    return { ok: false, error: 'Please enter a valid vintage year.' }
  }

  const grapeNames = parseGrapeNames(grapesRaw)
  if (grapeNames.length === 0) {
    return { ok: false, error: 'Please list at least one grape.' }
  }

  return { ok: true, fields: { name, wineryName, region, country, type, vintageYear, grapeNames } }
}
