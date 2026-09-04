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
