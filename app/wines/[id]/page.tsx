import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { mockWines } from '@/lib/mock-data'
import { ArrowLeft, Wine as WineIcon, Star, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'

interface WineDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function WineDetailPage({ params }: WineDetailPageProps) {
  const { id } = await params
  const wine = mockWines.find((w) => w.id === id)

  if (!wine) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <Link href="/wines">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wines
        </Button>
      </Link>

      <PageHeader
        title={wine.name}
        description={`${wine.winery} • ${wine.vintage}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Wine Details Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Wine Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium text-foreground">
                    {wine.region}, {wine.country}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Grapes</p>
                <div className="flex flex-wrap gap-2">
                  {wine.grapes.map((grape) => (
                    <span
                      key={grape}
                      className="inline-block rounded bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      {grape}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Type</p>
                <p className="capitalize font-medium text-foreground">
                  {wine.type}
                </p>
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          {wine.tastingNotes && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Tasting Notes
              </h2>
              <p className="text-muted-foreground italic">"{wine.tastingNotes}"</p>
            </div>
          )}

          {/* Food Pairing */}
          {wine.foodPairing && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Food Pairing
              </h2>
              <p className="text-muted-foreground">{wine.foodPairing}</p>
            </div>
          )}
        </div>

        {/* Ratings Sidebar */}
        <div className="space-y-6">
          {/* Overall Rating */}
          {wine.ratings.overall && (
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-4 text-sm text-muted-foreground">Overall Rating</p>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold text-foreground">
                  {wine.ratings.overall}
                </div>
                <div className="mb-1 text-sm text-muted-foreground">/10</div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(wine.ratings.overall! / 2)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category Ratings */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Ratings</h3>
            <div className="space-y-3">
              {[
                { label: 'Appearance', key: 'appearance' as const },
                { label: 'Nose', key: 'nose' as const },
                { label: 'Palate', key: 'palate' as const },
                { label: 'Finish', key: 'finish' as const },
                { label: 'Value', key: 'value' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">
                      {wine.ratings[key] || '—'}/5
                    </p>
                  </div>
                  {wine.ratings[key] && (
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(wine.ratings[key]! / 5) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Would Buy Again */}
          {wine.wouldBuyAgain !== undefined && (
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Would Buy Again</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {wine.wouldBuyAgain ? '✓ Yes' : '✗ No'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
