'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { RatingFields } from '@/components/forms/RatingFields'
import { ReviewNotesFields } from '@/components/forms/ReviewNotesFields'
import { ArrowLeft } from 'lucide-react'
import { saveReview, type ReviewFormState } from './actions'
import type { Database } from '@/lib/types/database'

type ExistingReview = Pick<
  Database['public']['Tables']['reviews']['Row'],
  'appearance' | 'nose' | 'palate' | 'finish' | 'value' | 'overall' | 'tasting_notes' | 'food_pairing' | 'occasion' | 'would_buy_again'
>

const initialState: ReviewFormState = { error: null }

function SaveReviewButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button className="flex-1" type="submit" disabled={pending}>
      {pending ? 'Saving…' : isEditing ? 'Update Review' : 'Save Review'}
    </Button>
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
      {/* The TopBar breadcrumb covers this on desktop; on mobile it's the
          bigger tap target, so it stays there. */}
      <Link href={backHref} className="md:hidden">
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
            <RatingFields defaults={existingReview} />
          </div>

          <ReviewNotesFields defaults={existingReview} />

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
