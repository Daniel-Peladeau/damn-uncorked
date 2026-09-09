import { PageHeaderSkeleton } from '@/components/PageHeaderSkeleton'
import { WineCardSkeleton } from '@/components/WineCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton withAction />

      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <WineCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
