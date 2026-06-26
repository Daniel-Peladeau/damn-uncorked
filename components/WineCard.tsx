import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wine as WineType } from '@/lib/mock-data'
import { Wine, Star } from 'lucide-react'

interface WineCardProps {
  wine: WineType
  isClickable?: boolean
}

export function WineCard({ wine, isClickable = true }: WineCardProps) {
  const Card = (
    <div className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{wine.name}</h3>
          <p className="text-sm text-muted-foreground">
            {wine.winery} • {wine.vintage}
          </p>
        </div>
        <div className="rounded bg-primary/10 px-2 py-1">
          <span className="text-xs font-medium text-primary capitalize">
            {wine.type}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground">
          {wine.region}, {wine.country}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {wine.grapes.map((grape) => (
            <span
              key={grape}
              className="inline-block rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
            >
              {grape}
            </span>
          ))}
        </div>
      </div>

      {wine.ratings.overall && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(wine.ratings.overall! / 2)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">
            {wine.ratings.overall}/10
          </span>
        </div>
      )}

      {wine.tastingNotes && (
        <p className="text-sm text-muted-foreground italic">
          "{wine.tastingNotes}"
        </p>
      )}
    </div>
  )

  if (!isClickable) return Card

  return (
    <Link href={`/wines/${wine.id}`}>
      <div className="cursor-pointer">{Card}</div>
    </Link>
  )
}
