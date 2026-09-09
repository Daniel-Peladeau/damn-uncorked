import { PageHeaderSkeleton } from '@/components/PageHeaderSkeleton'

export default function MapLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="flex h-96 items-center justify-center rounded-lg bg-secondary/20">
        <p className="text-muted-foreground">Loading map…</p>
      </div>
    </div>
  )
}
