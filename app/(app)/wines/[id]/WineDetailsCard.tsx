import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WineTypeBadge } from '@/components/WineTypeBadge'
import { WINE_TYPES } from '@/lib/types/wine'

export function WineDetailsCard({
  vintageId,
  name,
  wineType,
  labelImageUrl,
  region,
  country,
  grapes,
}: {
  vintageId: string
  name: string
  wineType: string
  labelImageUrl: string | null
  region: string | null
  country: string | null
  grapes: string[]
}) {
  // wineType arrives as the raw column string; fall back to plain text if it
  // is ever outside the enum rather than crash the badge lookup.
  const knownType = WINE_TYPES.find((t) => t === wineType)
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Wine Details</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/wines/${vintageId}/edit`}>
            Edit
          </Link>
        </Button>
      </div>
      <div className="flex gap-6">
        {labelImageUrl && (
          <Image
            src={labelImageUrl}
            alt={`${name} label`}
            width={160}
            height={224}
            className="h-56 w-40 flex-shrink-0 rounded object-contain"
          />
        )}
        <div className="flex-1 space-y-4">
          {(region || country) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-medium text-foreground">{[region, country].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}
          {grapes.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Grapes</p>
              <div className="flex flex-wrap gap-2">
                {grapes.map((grape) => (
                  <span
                    key={grape}
                    className="inline-block rounded bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                  >
                    {grape}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Type</p>
            {knownType ? (
              <WineTypeBadge type={knownType} className="text-sm" />
            ) : (
              <p className="capitalize font-medium text-foreground">{wineType}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
