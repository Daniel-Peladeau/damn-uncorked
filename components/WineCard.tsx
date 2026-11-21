import Link from 'next/link'
import type { Wine } from '@/lib/types/wine'
import { WineLabelTile } from './WineLabelTile'
import { WineTypeBadge } from './WineTypeBadge'

export function WineCard({ wine }: { wine: Wine }) {
  const place = [wine.region, wine.country].filter(Boolean).join(', ')
  const overall = wine.ratings.overall

  return (
    <Link
      href={`/wines/${wine.id}`}
      className="group block h-full rounded-lg outline-offset-2 focus-visible:outline-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors group-hover:border-gold">
        <div className="h-0.5 bg-gold-fill" aria-hidden="true" />

        <div className="flex flex-1 gap-4 p-5">
          <WineLabelTile type={wine.type} vintage={wine.vintage} />

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-lg leading-snug font-semibold text-foreground">{wine.name}</h3>
              <p className="text-sm text-muted-foreground">
                {wine.winery}, {wine.vintage}
              </p>
              {place && <p className="text-xs text-muted-foreground">{place}</p>}
            </div>

            <WineTypeBadge type={wine.type} />

            {wine.grapes.length > 0 && (
              <p className="text-xs text-muted-foreground">{wine.grapes.join(', ')}</p>
            )}
          </div>

          {overall != null && (
            <p className="shrink-0 text-right leading-none">
              <span className="font-heading text-3xl text-gold tabular-nums">{overall}</span>
              <span className="text-xs text-muted-foreground">/10</span>
              <span className="sr-only"> overall</span>
            </p>
          )}
        </div>

        {wine.tastingNotes && (
          <p className="line-clamp-2 border-t border-border px-5 py-3 font-heading text-sm text-muted-foreground italic">
            &ldquo;{wine.tastingNotes}&rdquo;
          </p>
        )}
      </article>
    </Link>
  )
}
