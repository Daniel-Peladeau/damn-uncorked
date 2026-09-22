import { Skeleton } from '@/components/ui/skeleton'
import { PageHeaderSkeleton } from '@/components/PageHeaderSkeleton'

export default function EditWineLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-32" />

      <PageHeaderSkeleton />

      <div className="max-w-2xl">
        <div className="space-y-6 rounded-lg border border-border bg-card p-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex gap-4 border-t border-border pt-6">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
