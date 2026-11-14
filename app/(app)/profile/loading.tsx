import { PageHeaderSkeleton } from '@/components/PageHeaderSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />

      <div className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}
