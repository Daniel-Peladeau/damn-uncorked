'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseWineFields } from '@/lib/wines/form'
import { resolveWinery } from '@/lib/wines/winery'
import { reconcileWineGrapes } from '@/lib/wines/wine-grapes'
import { geocodeToLocationPatch } from '@/lib/geocoding'

export type EditWineFormState = {
  error: string | null
}

// Shown to the user for any database failure — the real error is logged
// server-side via console.error instead of being sent to the client, same
// convention as app/(app)/wines/new/actions.ts.
const GENERIC_SAVE_ERROR = 'Something went wrong saving these changes. Please try again.'

// Bound with the vintage id (via .bind()) before being passed to
// useActionState, so the form itself never needs to submit it as a hidden
// field the client could tamper with.
export async function updateWineEntry(
  vintageId: string,
  _prevState: EditWineFormState,
  formData: FormData
): Promise<EditWineFormState> {
  const parsed = parseWineFields(formData)
  if (!parsed.ok) {
    return { error: parsed.error }
  }
  const { name, wineryName, region, country, type, vintageYear, grapeNames } = parsed.fields

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to edit a wine.' }
  }

  // Re-fetch the current state server-side rather than trusting hidden form
  // fields for it — same reasoning as the vintage-existence check in
  // app/(app)/wines/[id]/review/actions.ts, applied to the whole record this
  // form edits, not just its id.
  const { data: vintage, error: vintageLookupError } = await supabase
    .from('wine_vintages')
    .select('id, vintage_year, wines ( id, name, wine_type, winery_id )')
    .eq('id', vintageId)
    .maybeSingle()

  if (vintageLookupError) {
    console.error('Failed to look up vintage for edit:', vintageId, vintageLookupError)
    return { error: GENERIC_SAVE_ERROR }
  }

  if (!vintage || !vintage.wines) {
    return { error: 'This wine no longer exists.' }
  }

  const wine = vintage.wines

  const wineryId = await resolveWinery(supabase, { name: wineryName, region, country }, () =>
    geocodeToLocationPatch(wineryName, region, country)
  )
  if (!wineryId) {
    return { error: GENERIC_SAVE_ERROR }
  }

  // A plain UPDATE, not find-or-create — this route edits this specific
  // `wines` row (see #66), rather than merging it into a different one.
  // Renaming into a name/winery/type combination that collides with a
  // *different* existing wine hits the wines_name_normalized_winery_id_wine_type_key
  // unique constraint below, surfaced as a clear error instead of the
  // generic one.
  if (wine.name !== name || wine.wine_type !== type || wine.winery_id !== wineryId) {
    const { error: wineUpdateError } = await supabase
      .from('wines')
      .update({ name, wine_type: type, winery_id: wineryId })
      .eq('id', wine.id)

    if (wineUpdateError) {
      if (wineUpdateError.code === '23505') {
        return { error: 'A wine with this name already exists for this winery and type.' }
      }
      console.error(`Failed to update wine "${wine.id}":`, wineUpdateError)
      return { error: GENERIC_SAVE_ERROR }
    }
  }

  if (vintage.vintage_year !== vintageYear) {
    const { error: vintageUpdateError } = await supabase
      .from('wine_vintages')
      .update({ vintage_year: vintageYear })
      .eq('id', vintageId)

    if (vintageUpdateError) {
      if (vintageUpdateError.code === '23505') {
        return { error: 'This wine already has a logged vintage for that year.' }
      }
      console.error('Failed to update vintage year:', vintageId, vintageUpdateError)
      return { error: GENERIC_SAVE_ERROR }
    }
  }

  if (!(await reconcileWineGrapes(supabase, wine.id, grapeNames))) {
    return { error: GENERIC_SAVE_ERROR }
  }

  // Winery details, wine details, and grapes all surface on the wine detail
  // page, the wine list, the dashboard, and (region/country changes) the map
  // pin — revalidate all four rather than just the page this form redirects
  // back to.
  revalidatePath(`/wines/${vintageId}`)
  revalidatePath('/wines')
  revalidatePath('/dashboard')
  revalidatePath('/map')

  redirect(`/wines/${vintageId}`)
}
