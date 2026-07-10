import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { getWinesForUser } from '@/lib/supabase/queries'
import { Plus } from 'lucide-react'

export default async function Dashboard() {
  const wines = await getWinesForUser()

  // Get top 3 wines sorted by rating
  const topWines = [...wines]
    .sort((a, b) => (b.ratings.overall || 0) - (a.ratings.overall || 0))
    .slice(0, 3)

  // A fresh sign-in (or one with no reviews yet) has no rated wines — guard
  // against dividing by zero instead of rendering "NaN/10".
  const ratedWines = wines.filter((w) => w.ratings.overall)
  const averageRating = ratedWines.length
    ? (
        ratedWines.reduce((acc, w) => acc + (w.ratings.overall ?? 0), 0) /
        ratedWines.length
      ).toFixed(1)
    : null

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <PageHeader
        title="Welcome back!"
        description="Here's a snapshot of your wine collection"
        action={
          <Link href="/wines/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Wine
            </Button>
          </Link>
        }
      />

      {/* Top 3 Wines Section */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">
          Your Top Wines
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topWines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          About DamnUncorked
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Welcome to DamnUncorked, your personal wine logging and rating
            platform. Track your wine discoveries, rate your tasting
            experiences, and build your collection.
          </p>
          <p>
            Whether you&apos;re interested in whites, rosés, sparkling wines, or
            exploring other varieties, log every bottle and remember what you
            loved (or didn&apos;t).
          </p>
          <div className="pt-4">
            <Link href="/about">
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Total Wines</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {wines.length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Average Rating</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {averageRating ? `${averageRating}/10` : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Would Buy Again</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {wines.filter((w) => w.wouldBuyAgain).length}
          </div>
        </div>
      </div>
    </div>
  )
}
