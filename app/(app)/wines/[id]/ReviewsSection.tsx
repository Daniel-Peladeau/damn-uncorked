import { PromptReviewCard, ReviewCard, WaitingReviewCard } from './ReviewCards'
import { ReviewComparison } from './ReviewComparison'
import type { Review } from './rating'

// Side by side so both users' independent reviews of the same bottle are
// visible at once, rather than one replacing the other or requiring a tab
// switch.
export function ReviewsSection({
  reviews,
  userId,
  reviewerNames,
  vintageId,
}: {
  reviews: Review[]
  userId: string | null
  reviewerNames: Map<string, string>
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
  const nameOf = (review: Review) =>
    review.user_id === userId ? 'You' : (reviewerNames.get(review.user_id) ?? 'Them')
  const [first, second] = allReviews

  return (
    <>
      {first && second && (
        <ReviewComparison
          first={{ name: nameOf(first), review: first }}
          second={{ name: nameOf(second), review: second }}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {allReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwnReview={review.user_id === userId}
            reviewerName={reviewerNames.get(review.user_id) ?? null}
            vintageId={vintageId}
          />
        ))}
        {allReviews.length === 1 && hasOwnReview && <WaitingReviewCard />}
        {!hasOwnReview && (
          <PromptReviewCard vintageId={vintageId} className={allReviews.length === 0 ? 'md:col-span-2' : undefined} />
        )}
      </div>
    </>
  )
}
