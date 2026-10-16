import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { DeleteWineButton } from './DeleteControls'
import { WineBreadcrumbLabel } from '@/components/layout/BreadcrumbLabels'
import { WineDetailsCard } from './WineDetailsCard'
import { ReviewsSection } from './ReviewsSection'

interface WineDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function WineDetailPage({ params }: WineDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // wine_vintages is the row this route's `id` addresses (one wine can have
  // several vintages, each with its own reviews) — embed the parent `wines`
  // row and its `wineries`/`wine_grapes` relations rather than issuing
  // separate round-trips for each.
  const { data: vintage, error: vintageError } = await supabase
    .from('wine_vintages')
    .select(
      `
      id,
      vintage_year,
      label_image_url,
      created_by,
      wines (
        name,
        wine_type,
        wineries ( region, country ),
        wine_grapes ( grapes ( name ) )
      )
    `
    )
    .eq('id', id)
    .maybeSingle()

  // A real query error (malformed uuid, RLS-unrelated failure, network) is
  // distinct from a clean "no such row" — RLS itself can't be distinguished
  // from a genuine no-match (Postgres filters denied rows the same way it
  // filters absent ones, by design), so that case still falls through to
  // notFound() below, but an actual error shouldn't silently render as a 404.
  if (vintageError) {
    console.error(`Failed to load wine vintage "${id}":`, vintageError)
    throw new Error('Failed to load wine details.')
  }

  if (!vintage || !vintage.wines) {
    notFound()
  }

  const wine = vintage.wines
  const winery = wine.wineries
  const grapes = wine.wine_grapes.map((wg) => wg.grapes.name)

  // Every allowed user can read every review for a vintage (that's the whole
  // point — Dan and Madison each log independent reviews of the same
  // bottle), so this is intentionally not filtered to the current user.
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(
      'id, wine_vintage_id, user_id, appearance, nose, palate, finish, value, overall, tasting_notes, food_pairing, would_buy_again, occasion, created_at'
    )
    .eq('wine_vintage_id', vintage.id)
    .order('created_at', { ascending: true })

  if (reviewsError) {
    console.error(`Failed to load reviews for vintage "${vintage.id}":`, reviewsError)
  }

  // Mirrors the wine_vintages DELETE policy (only whoever logged it) so the
  // button isn't offered to someone RLS would refuse anyway.
  const canDeleteWine = user !== null && vintage.created_by === user.id

  return (
    <div className="space-y-8">
      <WineBreadcrumbLabel vintageId={vintage.id} name={wine.name} vintageYear={vintage.vintage_year} />

      {/* The TopBar breadcrumb covers this on desktop; on mobile it's the
          bigger tap target, so it stays there. */}
      <Link href="/wines" className="md:hidden">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wines
        </Button>
      </Link>

      <PageHeader
        title={wine.name}
        description={`${winery?.region ?? 'Unknown region'} • ${vintage.vintage_year ?? 'Unknown vintage'}`}
        action={canDeleteWine ? <DeleteWineButton vintageId={vintage.id} wineName={wine.name} /> : undefined}
      />

      <div className="space-y-6">
        <WineDetailsCard
          vintageId={vintage.id}
          name={wine.name}
          wineType={wine.wine_type}
          labelImageUrl={vintage.label_image_url}
          region={winery?.region ?? null}
          country={winery?.country ?? null}
          grapes={grapes}
        />

        {reviewsError ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">Couldn&apos;t load reviews right now. Please try again.</p>
          </div>
        ) : (
          <ReviewsSection reviews={reviews ?? []} userId={user?.id ?? null} vintageId={vintage.id} />
        )}
      </div>
    </div>
  )
}
