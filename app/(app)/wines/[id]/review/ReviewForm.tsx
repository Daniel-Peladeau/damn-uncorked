'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { ArrowLeft } from 'lucide-react'
import { saveReview, type ReviewFormState } from './actions'
import type { Database } from '@/lib/types/database'

type ExistingReview = Pick<
  Database['public']['Tables']['reviews']['Row'],
  'appearance' | 'nose' | 'palate' | 'finish' | 'value' | 'overall' | 'tasting_notes' | 'food_pairing' | 'occasion' | 'would_buy_again'
>

const initialState: ReviewFormState = { error: null }

const RATING_FIELDS = [
  { label: 'Appearance', name: 'appearance' as const },
  { label: 'Nose', name: 'nose' as const },
  { label: 'Palate', name: 'palate' as const },
  { label: 'Finish', name: 'finish' as const },
  { label: 'Value', name: 'value' as const },
]

function SaveReviewButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button className="flex-1" type="submit" disabled={pending}>
      {pending ? 'Saving…' : isEditing ? 'Update Review' : 'Save Review'}
    </Button>
  )
}

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

export function ReviewForm({
  vintageId,
  wineName,
  vintageYear,
  existingReview,
}: {
  vintageId: string
  wineName: string
  vintageYear: number | null
  existingReview: ExistingReview | null
}) {
  const saveReviewForVintage = saveReview.bind(null, vintageId)
  const [state, formAction] = useActionState(saveReviewForVintage, initialState)
  const isEditing = existingReview !== null
  const backHref = `/wines/${vintageId}`

  return (
    <div className="space-y-8">
      <Link href={backHref}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wine
        </Button>
      </Link>

      <PageHeader
        title={isEditing ? 'Edit Your Review' : 'Add Your Review'}
        description={`${wineName} • ${vintageYear ?? 'Unknown vintage'}`}
      />

      <div className="max-w-2xl">
        <form action={formAction} className="space-y-6 rounded-lg border border-border bg-card p-8">
          {state.error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Ratings *</h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {RATING_FIELDS.map(({ label, name }) => (
                <div key={name} className="space-y-2">
                  <Label className="text-xs">{label}</Label>
                  <RatingSelect name={name} max={5} defaultValue={existingReview?.[name]} />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="overall">Overall Rating (1–10) *</Label>
              <RatingSelect name="overall" max={10} id="overall" defaultValue={existingReview?.overall} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tastingNotes">Tasting Notes</Label>
            <Textarea
              id="tastingNotes"
              name="tastingNotes"
              placeholder="Describe the wine's characteristics, flavors, aromas..."
              rows={4}
              defaultValue={existingReview?.tasting_notes ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodPairing">Food Pairing</Label>
            <Input
              id="foodPairing"
              name="foodPairing"
              placeholder="e.g., Seafood, light salads"
              defaultValue={existingReview?.food_pairing ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Input
              id="occasion"
              name="occasion"
              placeholder="e.g., Anniversary dinner"
              defaultValue={existingReview?.occasion ?? ''}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="wouldBuyAgain" name="wouldBuyAgain" defaultChecked={existingReview?.would_buy_again ?? false} />
            <Label htmlFor="wouldBuyAgain" className="cursor-pointer font-normal">
              Would buy again
            </Label>
          </div>

          <div className="flex gap-4 border-t border-border pt-6">
            <Link href={backHref} className="flex-1">
              <Button variant="outline" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
            <SaveReviewButton isEditing={isEditing} />
          </div>
        </form>
      </div>
    </div>
  )
}
