import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { SortControl } from '@/components/SortControl'
import { getWinesForUser } from '@/lib/supabase/queries'
import { isSortOption } from '@/lib/types/sort'
import { Plus } from 'lucide-react'

interface WinesPageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function WinesPage({ searchParams }: WinesPageProps) {
  const { sort } = await searchParams
  const sortBy = isSortOption(sort) ? sort : 'recent'
  const wines = await getWinesForUser(sortBy)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Wine Collection"
        description={`${wines.length} wines logged`}
        action={
          <div className="flex items-center gap-3">
            <SortControl currentSort={sortBy} />
            <Link href="/wines/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Wine
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wines.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
      </div>
    </div>
  )
}
