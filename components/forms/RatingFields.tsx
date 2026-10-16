import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const RATING_FIELDS = [
  { label: 'Appearance', name: 'appearance' },
  { label: 'Nose', name: 'nose' },
  { label: 'Palate', name: 'palate' },
  { label: 'Finish', name: 'finish' },
  { label: 'Value', name: 'value' },
] as const

type RatingName = (typeof RATING_FIELDS)[number]['name'] | 'overall'

function RatingSelect({
  name,
  max,
  id,
  defaultValue,
}: {
  name: string
  max: number
  id?: string
  defaultValue?: number | null
}) {
  return (
    <Select name={name} required defaultValue={defaultValue != null ? String(defaultValue) : undefined}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// The five 1–5 category selects plus the 1–10 overall select, shared by the
// Add Wine form and the review form. Field names match what
// lib/reviews/validation.ts's parseReviewFields reads. `defaults` pre-fills
// an existing review when editing.
export function RatingFields({ defaults }: { defaults?: Partial<Record<RatingName, number | null>> | null }) {
  return (
    <>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Ratings *</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {RATING_FIELDS.map(({ label, name }) => (
          <div key={name} className="space-y-2">
            <Label className="text-xs">{label}</Label>
            <RatingSelect name={name} max={5} defaultValue={defaults?.[name]} />
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="overall">Overall Rating (1–10) *</Label>
        <RatingSelect name="overall" max={10} id="overall" defaultValue={defaults?.overall} />
      </div>
    </>
  )
}
