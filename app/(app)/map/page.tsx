import Link from 'next/link'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { WineryMapLoader } from '@/components/WineryMapLoader'
import { getWineriesWithLocations } from '@/lib/supabase/wineries'

export default async function MapPage() {
  const wineries = await getWineriesWithLocations()

  return (
    <div className="space-y-8">
      <PageHeader title="Winery Map" description="Explore your wineries geographically" />

      {wineries.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No wineries on the map yet"
          action={
            <Button className="gap-2" asChild>
              <Link href="/wines/new">
                <Plus className="h-4 w-4" />
                Add Wine
              </Link>
            </Button>
          }
        >
          Each winery is placed automatically when you log a wine from it.
        </EmptyState>
      ) : (
        <WineryMapLoader wineries={wineries} />
      )}
    </div>
  )
}
