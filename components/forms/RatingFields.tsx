import { RatingPips } from './RatingPips'

const RATING_FIELDS = [
  { label: 'Appearance', name: 'appearance' },
  { label: 'Nose', name: 'nose' },
  { label: 'Palate', name: 'palate' },
  { label: 'Finish', name: 'finish' },
  { label: 'Value', name: 'value' },
] as const

type RatingName = (typeof RATING_FIELDS)[number]['name'] | 'overall'

// The five 1–5 categories plus the 1–10 overall score, shared by the Add Wine
// form and the review form. Field names match what
// lib/reviews/validation.ts's parseReviewFields reads. `defaults` pre-fills
// an existing review when editing.
export function RatingFields({ defaults }: { defaults?: Partial<Record<RatingName, number | null>> | null }) {
  return (
    <>
      <h3 className="mb-1 text-lg font-semibold text-foreground">Ratings *</h3>
      <p className="mb-4 text-sm text-muted-foreground">Tap a number, or use the arrow keys.</p>

      <div className="max-w-xl space-y-1">
        {RATING_FIELDS.map(({ label, name }) => (
          <RatingPips key={name} name={name} label={label} max={5} defaultValue={defaults?.[name]} />
        ))}
      </div>

      <div className="mt-6 max-w-xl border-t border-border pt-4">
        <RatingPips name="overall" label="Overall" max={10} defaultValue={defaults?.overall} />
      </div>
    </>
  )
}
