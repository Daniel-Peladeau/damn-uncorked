import { PageHeaderSkeleton } from '@/components/PageHeaderSkeleton'
import { WineCardSkeleton } from '@/components/WineCardSkeleton'

export default function WinesLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton withAction />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <WineCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
