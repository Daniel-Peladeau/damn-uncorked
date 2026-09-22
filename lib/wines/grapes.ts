// Shared by the Add Wine and Edit Wine forms — parses a comma-separated
// grapes input into a deduped list of grape names.
//
// Users often type a trailing conjunction before the last item, either with
// an Oxford comma ("Cabernet Sauvignon, Merlot, and Petit Verdot") or
// without one ("Cabernet Sauvignon, Merlot and Petit Verdot"). A bare
// `split(',')` treats "and"/"&" as part of the grape name in both cases:
// the Oxford-comma form ends up with "and Petit Verdot" as its own (wrong)
// grape, and the no-Oxford-comma form merges "Merlot and Petit Verdot" into
// one segment instead of two. Normalizing every standalone "and"/"&" to a
// comma before splitting handles both forms the same way — real grape
// variety names don't contain "and"/"&" as a standalone word, so this
// never misfires on a legitimate name (e.g. "Grand Noir" is untouched,
// since "and" there isn't a whole word).
//
// Examples:
//   "Cabernet Sauvignon, Merlot, and Petit Verdot" -> ["Cabernet Sauvignon", "Merlot", "Petit Verdot"]
//   "Cabernet Sauvignon, Merlot and Petit Verdot"   -> ["Cabernet Sauvignon", "Merlot", "Petit Verdot"]
//   "Riesling & Gewürztraminer"                      -> ["Riesling", "Gewürztraminer"]
const CONJUNCTION_PATTERN = /\s*(?:,\s*)?\b(?:and|&)\b\s*/gi

// Dedup case-insensitively (e.g. "Merlot, merlot") — the grape lookup in the
// server actions that consume this is itself case-insensitive, so
// exact-string dedup alone would still let through two entries that resolve
// to the same grape row, producing two identical wine_grapes inserts. Keep
// the first-seen casing for display.
export function parseGrapeNames(raw: string): string[] {
  const normalized = raw.replace(CONJUNCTION_PATTERN, ', ')

  return Array.from(
    normalized
      .split(',')
      .map((grape) => grape.trim())
      .filter((grape) => grape.length > 0)
      .reduce((seen, grape) => {
        const key = grape.toLowerCase()
        if (!seen.has(key)) seen.set(key, grape)
        return seen
      }, new Map<string, string>())
      .values()
  )
}
