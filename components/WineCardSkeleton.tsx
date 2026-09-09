import { Skeleton } from '@/components/ui/skeleton'

// Mirrors WineCard's layout so the loading -> loaded transition doesn't jump.
export function WineCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-14 rounded" />
      </div>

      <div className="mb-4 space-y-2">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </div>

      <Skeleton className="mb-4 h-4 w-20" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}
