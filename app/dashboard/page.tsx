import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { mockWines } from '@/lib/mock-data'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  // Get top 3 wines sorted by rating
  const topWines = [...mockWines]
    .sort((a, b) => (b.ratings.overall || 0) - (a.ratings.overall || 0))
    .slice(0, 3)

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
            Whether you're interested in whites, rosés, sparkling wines, or
            exploring other varieties, log every bottle and remember what you
            loved (or didn't).
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
            {mockWines.length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Average Rating</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {(
              mockWines.reduce((acc, w) => acc + (w.ratings.overall || 0), 0) /
              mockWines.filter((w) => w.ratings.overall).length
            ).toFixed(1)}
            /10
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Would Buy Again</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {mockWines.filter((w) => w.wouldBuyAgain).length}
          </div>
        </div>
      </div>
    </div>
  )
}
