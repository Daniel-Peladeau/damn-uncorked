// Shared by every server action that accepts review-field form data
// (wine entry, review create/edit) — kept in one place so the validation
// rules (and the reasoning behind them) can't drift between the two.

export function getTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

// Number("5e0") === 5 and Number.isInteger(5) === true, so a plain
// Number()+isInteger check accepts scientific notation and other
// non-canonical numeric strings. Server actions are entrypoints reachable
// directly (not just through the UI's constrained inputs), so parsing is
// restricted to a canonical integer string before converting.
export function parseCanonicalInteger(raw: string): number | null {
  if (!/^-?\d+$/.test(raw)) return null
  return Number(raw)
}

// The <Select> options in the UI already constrain ratings to 1-5/1-10, but
// server actions are reachable directly (not just through that UI), so the
// range/integer check has to be enforced here too.
export function getRating(formData: FormData, key: string, min: number, max: number): number | null {
  const raw = getTrimmedString(formData, key)
  if (raw.length === 0) return null
  const parsed = parseCanonicalInteger(raw)
  if (parsed === null || parsed < min || parsed > max) return null
  return parsed
}

function getOptionalText(formData: FormData, key: string): string | null {
  const value = getTrimmedString(formData, key)
  return value.length > 0 ? value : null
}

export const INVALID_RATINGS_ERROR = 'Please provide valid ratings (1–5 for each category, 1–10 for overall).'

// Keys match the `reviews` columns, so the result spreads straight into an
// insert/upsert.
export type ReviewFields = {
  appearance: number
  nose: number
  palate: number
  finish: number
  value: number
  overall: number
  tasting_notes: string | null
  food_pairing: string | null
  occasion: string | null
  would_buy_again: boolean
}

// Returns null if any rating is missing or out of range — callers show
// INVALID_RATINGS_ERROR. A form without an `occasion` field yields null for it.
export function parseReviewFields(formData: FormData): ReviewFields | null {
  const appearance = getRating(formData, 'appearance', 1, 5)
  const nose = getRating(formData, 'nose', 1, 5)
  const palate = getRating(formData, 'palate', 1, 5)
  const finish = getRating(formData, 'finish', 1, 5)
  const value = getRating(formData, 'value', 1, 5)
  const overall = getRating(formData, 'overall', 1, 10)

  if (
    appearance === null ||
    nose === null ||
    palate === null ||
    finish === null ||
    value === null ||
    overall === null
  ) {
    return null
  }

  return {
    appearance,
    nose,
    palate,
    finish,
    value,
    overall,
    tasting_notes: getOptionalText(formData, 'tastingNotes'),
    food_pairing: getOptionalText(formData, 'foodPairing'),
    occasion: getOptionalText(formData, 'occasion'),
    would_buy_again: formData.get('wouldBuyAgain') === 'on',
  }
}
