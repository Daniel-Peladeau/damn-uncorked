import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { SortControl } from '@/components/SortControl'
import { WineSearch } from '@/components/WineSearch'
import { FilterChips } from '@/components/FilterChips'
import { getWinesForUser } from '@/lib/supabase/queries'
import { isSortOption } from '@/lib/types/sort'
import { hasActiveFilters, parseWineFilters, type WineFilterParams } from '@/lib/types/filters'
import { Plus } from 'lucide-react'

interface WinesPageProps {
  searchParams: Promise<{ sort?: string; q?: string } & WineFilterParams>
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
  const filters = parseWineFilters(params)
  const filtered = hasActiveFilters(filters)
  const { wines, totalCount, loggedTypes } = await getWinesForUser(sortBy, q, filters)
  const noun = (count: number) => (count === 1 ? 'wine' : 'wines')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Wine Collection"
        description={
          q || filtered
            ? `${wines.length} matching ${noun(wines.length)}`
            : `${totalCount} ${noun(totalCount)} logged`
        }
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

      <div className="space-y-4">
        <WineSearch initialQuery={q ?? ''} />
        {totalCount > 0 && (
          <Suspense>
            <FilterChips filters={filters} loggedTypes={loggedTypes} />
          </Suspense>
        )}
      </div>

      {totalCount === 0 ? (
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
      ) : wines.length === 0 ? (
        <p className="text-muted-foreground">
          {q ? <>No wines match &quot;{q}&quot;</> : 'No wines match'}
          {filtered ? (q ? ' with these filters.' : ' these filters.') : '.'}
        </p>
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
