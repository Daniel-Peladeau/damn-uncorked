import { RatingSegments } from '@/components/RatingSegments'
import { ratingWord } from '@/components/rating-scale'
import { RATING_CATEGORIES, type RatingKey } from './rating'

// One review's scores: the big /10 numeral, then a gold segment strip per
// 1–5 category. A null value (a review missing that rating) shows as "—"
// with an empty strip.
export function RatingBreakdown({
  overall,
  categoryValue,
}: {
  overall: number | null
  categoryValue: (key: RatingKey) => number | null
}) {
  return (
    <>
      <p className="mb-6 flex items-baseline gap-1.5">
        <span className="font-heading text-5xl leading-none text-gold tabular-nums">{overall ?? '—'}</span>
        <span className="text-sm text-muted-foreground">/10 overall</span>
      </p>

      {/* The segment strip's aria-label carries label, value and word, so the
          visible text either side is hidden from screen readers. */}
      <div className="space-y-3">
        {RATING_CATEGORIES.map(({ label, key }) => {
          const value = categoryValue(key)
          return (
            <div key={key} className="grid grid-cols-[5.5rem_1fr_5rem] items-end gap-3">
              <span aria-hidden="true" className="text-sm text-muted-foreground">
                {label}
              </span>
              <RatingSegments label={label} value={value} />
              <span aria-hidden="true" className="text-right text-sm text-foreground">
                {value == null ? '—' : ratingWord(value, 5)}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}
