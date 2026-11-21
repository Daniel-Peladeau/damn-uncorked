// Shared by the rating input and the read-only displays so a "4" always reads
// the same way. The 1–10 overall score has no words; it's stated as "n of 10".
const FIVE_POINT_WORDS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'] as const

export function ratingWord(value: number | null, max: number): string {
  if (value == null) return 'Not rated'
  if (max === 5) return FIVE_POINT_WORDS[Math.round(value) - 1] ?? `${value} of ${max}`
  return `${value} of ${max}`
}

export function ratingSpoken(label: string, value: number | null, max: number): string {
  if (value == null) return `${label}: not rated`
  return max === 5 ? `${label}: ${value} of 5, ${ratingWord(value, max)}` : `${label}: ${value} of ${max}`
}
