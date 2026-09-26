import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { SortControl } from '@/components/SortControl'
import { WineSearch } from '@/components/WineSearch'
import { getWinesForUser } from '@/lib/supabase/queries'
import { isSortOption } from '@/lib/types/sort'
import { Plus } from 'lucide-react'

interface WinesPageProps {
  searchParams: Promise<{ sort?: string; q?: string }>
}

export default async function WinesPage({ searchParams }: WinesPageProps) {
  const params = await searchParams
  const sort = params.sort
  // Next.js actually delivers a repeated URL param (e.g. a hand-crafted
  // ?q=a&q=b) as string[] at runtime, regardless of this type's `?string`
  // declaration — narrow defensively rather than let a non-string reach
  // matchesSearch's .trim() call.
  const q = typeof params.q === 'string' ? params.q : undefined
  const sortBy = isSortOption(sort) ? sort : 'recent'
  const wines = await getWinesForUser(sortBy, q)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Wine Collection"
        description={q ? `${wines.length} matching wines` : `${wines.length} wines logged`}
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

      <WineSearch initialQuery={q ?? ''} />

      {wines.length === 0 && q ? (
        <p className="text-muted-foreground">No wines match &quot;{q}&quot;.</p>
      ) : wines.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="mb-4 text-xl font-semibold text-foreground">No wines logged yet</h2>
          <p className="mb-6 text-muted-foreground">
            Start building your collection by logging the first bottle.
          </p>
          <Link href="/wines/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Wine
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}
    </div>
  )
}
