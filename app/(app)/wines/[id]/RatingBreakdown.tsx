import { Star } from 'lucide-react'
import { RATING_CATEGORIES, type RatingKey } from './rating'

// Shared by a single review's card and the combined card: the big /10
// score, its 5-star equivalent, and a bar per 1–5 category. A null value
// (a review missing that rating) shows as "—" with an empty bar.
export function RatingBreakdown({
  overall,
  categoryValue,
}: {
  overall: number | null
  categoryValue: (key: RatingKey) => number | null
}) {
  return (
    <>
      <div className="mb-6 flex items-end gap-2">
        <div className="text-4xl font-bold text-foreground">{overall ?? '—'}</div>
        <div className="mb-1 text-sm text-muted-foreground">/10 overall</div>
      </div>
      <div className="mb-6 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.round((overall ?? 0) / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>

      <div className="space-y-3">
        {RATING_CATEGORIES.map(({ label, key }) => {
          const value = categoryValue(key)
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value ?? '—'}/5</p>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${((value ?? 0) / 5) * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
