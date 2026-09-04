import { PageHeader } from '@/components/PageHeader'
import { WineryMapLoader } from '@/components/WineryMapLoader'
import { getWineriesWithLocations } from '@/lib/supabase/wineries'

export default async function MapPage() {
  const wineries = await getWineriesWithLocations()

  return (
    <div className="space-y-8">
      <PageHeader title="Winery Map" description="Explore your wineries geographically" />

      {wineries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="mb-4 text-xl font-semibold text-foreground">No wineries plotted yet</h2>
          <p className="text-muted-foreground">
            Once you log a wine, its winery is geocoded automatically and will show up here.
          </p>
        </div>
      ) : (
        <WineryMapLoader wineries={wineries} />
      )}
    </div>
  )
}
