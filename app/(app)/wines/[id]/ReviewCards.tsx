import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteReviewButton } from './DeleteControls'
import { RatingBreakdown } from './RatingBreakdown'
import { RATING_CATEGORIES, average, type Review } from './rating'

export function PromptReviewCard({ vintageId, className }: { vintageId: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-6 text-center ${className ?? ''}`}
    >
      <p className="text-muted-foreground">You haven&apos;t reviewed this wine yet.</p>
      <Link href={`/wines/${vintageId}/review`}>
        <Button size="sm">Add Your Review</Button>
      </Link>
    </div>
  )
}

export function ReviewCard({
  review,
  isOwnReview,
  vintageId,
  className,
}: {
  review: Review
  isOwnReview: boolean
  vintageId: string
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className ?? ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{isOwnReview ? 'Your Review' : 'Their Review'}</h2>
        {isOwnReview && (
          <div className="flex items-center gap-1">
            <Link href={`/wines/${vintageId}/review`}>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </Link>
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

// Combined score is computed, not stored (per CLAUDE.md) — this only ever
// renders once both reviews exist, so `reviews` is always exactly the two
// rows in practice, but the averaging itself works for any count.
export function CombinedRatingCard({ reviews }: { reviews: Review[] }) {
  const combinedByKey = new Map(
    RATING_CATEGORIES.map(({ key }) => [key, average(reviews.map((r) => r[key] ?? 0))])
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Combined Rating</h2>
      <RatingBreakdown
        overall={average(reviews.map((r) => r.overall ?? 0))}
        categoryValue={(key) => combinedByKey.get(key) ?? null}
      />
    </div>
  )
}
