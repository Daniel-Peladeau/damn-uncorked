import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditWineForm } from './EditWineForm'

interface EditWinePageProps {
  params: Promise<{ id: string }>
}

export default async function EditWinePage({ params }: EditWinePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // This edits the shared `wines`/`wineries`/`wine_grapes` rows behind this
  // vintage, not a personal review — proxy.ts already gates the route to
  // signed-in users, and per CLAUDE.md/#63 either allowed user can edit any
  // wine's details, so no per-user ownership check is needed here.
  const { data: vintage, error: vintageError } = await supabase
    .from('wine_vintages')
    .select(
      `
      id,
      vintage_year,
      wines (
        name,
        wine_type,
        wineries ( name, region, country ),
        wine_grapes ( grapes ( name ) )
      )
    `
    )
    .eq('id', id)
    .maybeSingle()

  if (vintageError) {
    console.error(`Failed to load wine vintage "${id}" for edit form:`, vintageError)
    throw new Error('Failed to load wine details.')
  }

  if (!vintage || !vintage.wines) {
    notFound()
  }

  const wine = vintage.wines
  const winery = wine.wineries
  const grapeNames = wine.wine_grapes.map((wg) => wg.grapes.name)

  return (
    <EditWineForm
      vintageId={vintage.id}
      initialValues={{
        name: wine.name,
        winery: winery?.name ?? '',
        type: wine.wine_type,
        region: winery?.region ?? '',
        country: winery?.country ?? '',
        vintage: vintage.vintage_year,
        grapes: grapeNames.join(', '),
      }}
    />
  )
}
