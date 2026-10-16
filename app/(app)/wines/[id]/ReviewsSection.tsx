import { CombinedRatingCard, PromptReviewCard, ReviewCard } from './ReviewCards'
import type { Review } from './rating'

// Side by side so both users' independent reviews of the same bottle are
// visible at once, rather than one replacing the other or requiring a tab
// switch.
export function ReviewsSection({
  reviews,
  userId,
  vintageId,
}: {
  reviews: Review[]
  userId: string | null
  vintageId: string
}) {
  // The signed-in user's own review (if present) always renders first —
  // among only ever 0-2 rows (one review per user per vintage), there's no
  // other meaningful order to preserve.
  const allReviews = [...reviews].sort((a, b) => {
    const aOwn = a.user_id === userId
    const bOwn = b.user_id === userId
    return aOwn === bOwn ? 0 : aOwn ? -1 : 1
  })

  const hasOwnReview = allReviews.some((review) => review.user_id === userId)
  // A lone real review card only spans the full grid width when it's the
  // only card rendered at all — once the "add your review" prompt joins it
  // as a second grid item, both should sit at normal half-width.
  const isLoneCard = allReviews.length === 1 && hasOwnReview

  return (
    <>
      {/* Combined score is computed here for display only — per CLAUDE.md,
          it's never persisted, so it's recomputed from the two reviews on
          every render rather than read from a stored column. */}
      {allReviews.length === 2 && <CombinedRatingCard reviews={allReviews} />}

      <div className="grid gap-6 md:grid-cols-2">
        {allReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwnReview={review.user_id === userId}
            vintageId={vintageId}
            className={isLoneCard ? 'md:col-span-2' : undefined}
          />
        ))}
        {!hasOwnReview && (
          <PromptReviewCard vintageId={vintageId} className={allReviews.length === 0 ? 'md:col-span-2' : undefined} />
        )}
      </div>
    </>
  )
}
