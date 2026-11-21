import { Skeleton } from '@/components/ui/skeleton'

// Mirrors WineCard's layout so the loading -> loaded transition doesn't jump.
export function WineCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-0.5 bg-gold-fill" />

      <div className="flex flex-1 gap-4 p-5">
        <Skeleton className="aspect-[3/4] w-20 shrink-0" />

        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <Skeleton className="h-8 w-10 shrink-0" />
      </div>

      <div className="border-t border-border px-5 py-3">
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}
