import { PageHeaderSkeleton } from '@/components/PageHeaderSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function WineDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-36" />

      <PageHeaderSkeleton />

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="flex gap-6">
            <Skeleton className="h-56 w-40 flex-shrink-0 rounded" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        </div>

        {/* Combined Rating card — shown whenever both users have reviewed,
            which is the common steady state for this app, so it's part of
            the default skeleton rather than an occasional extra. */}
        <RatingCardSkeleton />

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <RatingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Shared shape between CombinedRatingCard and each ReviewCard on the real
// page — both show a title, an overall score + star row, then 5 category
// rating bars.
function RatingCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton className="mb-6 h-6 w-28" />
      <Skeleton className="mb-6 h-10 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}
