import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteReviewButton } from './DeleteControls'
import { RatingBreakdown } from './RatingBreakdown'
import type { Review } from './rating'

export function PromptReviewCard({ vintageId, className }: { vintageId: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-6 text-center ${className ?? ''}`}
    >
      <p className="text-muted-foreground">You haven&apos;t reviewed this wine yet.</p>
      <Button size="sm" asChild>
        <Link href={`/wines/${vintageId}/review`}>Add Your Review</Link>
      </Button>
    </div>
  )
}

export function ReviewCard({
  review,
  isOwnReview,
  reviewerName,
  vintageId,
  className,
}: {
  review: Review
  isOwnReview: boolean
  // The other reviewer's profile display name; null falls back to "Their".
  reviewerName: string | null
  vintageId: string
  className?: string
}) {
  const title = isOwnReview ? 'Your Review' : reviewerName ? `${reviewerName}'s Review` : 'Their Review'

  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className ?? ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {isOwnReview && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/wines/${vintageId}/review`}>
                Edit
              </Link>
            </Button>
            <DeleteReviewButton vintageId={vintageId} reviewId={review.id} />
          </div>
        )}
      </div>

      <RatingBreakdown overall={review.overall} categoryValue={(key) => review[key]} />

      {review.tasting_notes && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Tasting Notes</p>
          <p className="text-muted-foreground italic">&quot;{review.tasting_notes}&quot;</p>
        </div>
      )}

      {review.food_pairing && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Food Pairing</p>
          <p className="text-muted-foreground">{review.food_pairing}</p>
        </div>
      )}

      {review.occasion && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Occasion</p>
          <p className="text-muted-foreground">{review.occasion}</p>
        </div>
      )}

      {review.would_buy_again !== null && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Would Buy Again</p>
          <p className="mt-1 font-semibold text-foreground">{review.would_buy_again ? '✓ Yes' : '✗ No'}</p>
        </div>
      )}
    </div>
  )
}

// Shown beside your own review until the other person logs theirs; the
// side-by-side comparison takes over once both exist.
export function WaitingReviewCard({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center ${className ?? ''}`}
    >
      <p className="font-heading text-lg text-foreground">No second review yet</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Once you&apos;ve both rated this bottle, your scores appear side by side here.
      </p>
    </div>
  )
}
