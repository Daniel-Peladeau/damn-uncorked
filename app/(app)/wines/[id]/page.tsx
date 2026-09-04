import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Star, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Database } from '@/lib/types/database'

interface WineDetailPageProps {
  params: Promise<{ id: string }>
}

type Review = Database['public']['Tables']['reviews']['Row']

const RATING_CATEGORIES = [
  { label: 'Appearance', key: 'appearance' as const },
  { label: 'Nose', key: 'nose' as const },
  { label: 'Palate', key: 'palate' as const },
  { label: 'Finish', key: 'finish' as const },
  { label: 'Value', key: 'value' as const },
]

// Rounded to 1 decimal place — these are averages of small integers (1-5 or
// 1-10), so more precision would just be noise.
function average(values: number[]): number {
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10
}

export default async function WineDetailPage({ params }: WineDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // wine_vintages is the row this route's `id` addresses (one wine can have
  // several vintages, each with its own reviews) — embed the parent `wines`
  // row and its `wineries`/`wine_grapes` relations rather than issuing
  // separate round-trips for each.
  const { data: vintage, error: vintageError } = await supabase
    .from('wine_vintages')
    .select(
      `
      id,
      vintage,
      wines (
        name,
        type,
        wineries ( region, country ),
        wine_grapes ( grapes ( name ) )
      )
    `
    )
    .eq('id', id)
    .maybeSingle()

  // A real query error (malformed uuid, RLS-unrelated failure, network) is
  // distinct from a clean "no such row" — RLS itself can't be distinguished
  // from a genuine no-match (Postgres filters denied rows the same way it
  // filters absent ones, by design), so that case still falls through to
  // notFound() below, but an actual error shouldn't silently render as a 404.
  if (vintageError) {
    console.error(`Failed to load wine vintage "${id}":`, vintageError)
    throw new Error('Failed to load wine details.')
  }

  if (!vintage || !vintage.wines) {
    notFound()
  }

  const wine = vintage.wines
  const winery = wine.wineries
  const grapes = wine.wine_grapes.map((wg) => wg.grapes.name)

  // Every allowed user can read every review for a vintage (that's the whole
  // point — Dan and Madison each log independent reviews of the same
  // bottle), so this is intentionally not filtered to the current user.
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(
      'id, wine_vintage_id, user_id, appearance, nose, palate, finish, value, overall, tasting_notes, food_pairing, would_buy_again, occasion, created_at'
    )
    .eq('wine_vintage_id', vintage.id)
    .order('created_at', { ascending: true })

  if (reviewsError) {
    console.error(`Failed to load reviews for vintage "${vintage.id}":`, reviewsError)
  }

  // The signed-in user's own review (if present) always renders first —
  // among only ever 0-2 rows (one review per user per vintage), there's no
  // other meaningful order to preserve.
  const allReviews = [...(reviews ?? [])].sort((a, b) => {
    const aOwn = a.user_id === user?.id
    const bOwn = b.user_id === user?.id
    return aOwn === bOwn ? 0 : aOwn ? -1 : 1
  })

  return (
    <div className="space-y-8">
      <Link href="/wines">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wines
        </Button>
      </Link>

      <PageHeader title={wine.name} description={`${winery?.region ?? 'Unknown region'} • ${vintage.vintage}`} />

      <div className="space-y-6">
        {/* Wine Details Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Wine Details</h2>
          <div className="space-y-4">
            {(winery?.region || winery?.country) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium text-foreground">
                    {[winery?.region, winery?.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}
            {grapes.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Grapes</p>
                <div className="flex flex-wrap gap-2">
                  {grapes.map((grape) => (
                    <span
                      key={grape}
                      className="inline-block rounded bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      {grape}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Type</p>
              <p className="capitalize font-medium text-foreground">{wine.type}</p>
            </div>
          </div>
        </div>

        {/* Reviews — side by side so both users' independent reviews of the
            same bottle are visible at once, rather than one replacing the
            other or requiring a tab switch. */}
        {reviewsError ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">Couldn&apos;t load reviews right now. Please try again.</p>
          </div>
        ) : allReviews.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">No reviews yet for this vintage.</p>
          </div>
        ) : (
          <>
            {/* Combined score is computed here for display only — per
                CLAUDE.md, it's never persisted, so it's recomputed from the
                two reviews on every render rather than read from a stored
                column. */}
            {allReviews.length === 2 && <CombinedRatingCard reviews={allReviews} />}

            <div className="grid gap-6 md:grid-cols-2">
              {allReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwnReview={review.user_id === user?.id}
                  className={allReviews.length === 1 ? 'md:col-span-2' : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ReviewCard({
  review,
  isOwnReview,
  className,
}: {
  review: Review
  isOwnReview: boolean
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className ?? ''}`}>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {isOwnReview ? 'Your Review' : 'Their Review'}
      </h2>

      <div className="mb-6 flex items-end gap-2">
        <div className="text-4xl font-bold text-foreground">{review.overall}</div>
        <div className="mb-1 text-sm text-muted-foreground">/10 overall</div>
      </div>
      <div className="mb-6 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.round(review.overall / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>

      <div className="space-y-3">
        {RATING_CATEGORIES.map(({ label, key }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground">{review[key]}/5</p>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(review[key] / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

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
function CombinedRatingCard({ reviews }: { reviews: Review[] }) {
  const combinedOverall = average(reviews.map((r) => r.overall))

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Combined Rating</h2>

      <div className="mb-6 flex items-end gap-2">
        <div className="text-4xl font-bold text-foreground">{combinedOverall}</div>
        <div className="mb-1 text-sm text-muted-foreground">/10 overall</div>
      </div>
      <div className="mb-6 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.round(combinedOverall / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>

      <div className="space-y-3">
        {RATING_CATEGORIES.map(({ label, key }) => {
          const combinedValue = average(reviews.map((r) => r[key]))
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{combinedValue}/5</p>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(combinedValue / 5) * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
