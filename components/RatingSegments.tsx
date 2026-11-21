import { cn } from '@/lib/utils'
import { ratingSpoken } from './rating-scale'

// Read-only twin of the RatingPips input: same hairline and gold underline,
// no numerals. Averages (e.g. 3.5) fill up to the rounded value.
export function RatingSegments({ label, value, max = 5 }: { label: string; value: number | null; max?: number }) {
  const filledUpTo = value == null ? 0 : Math.round(value)
  return (
    <div role="img" aria-label={ratingSpoken(label, value, max)} className="flex h-3 items-end gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn('flex-1', i < filledUpTo ? 'h-[3px] bg-gold' : 'h-px bg-input')} />
      ))}
    </div>
  )
}
