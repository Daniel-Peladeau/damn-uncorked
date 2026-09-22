'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'
import { getTrimmedString, parseCanonicalInteger } from '@/lib/reviews/validation'
import { parseGrapeNames } from '@/lib/wines/grapes'
import { escapeIlikePattern, findOrCreateByName } from '@/lib/wines/find-or-create'
import { geocodeToLocationPatch } from '@/lib/geocoding'

export type EditWineFormState = {
  error: string | null
}

function isWineType(value: string): value is WineType {
  return (WINE_TYPES as readonly string[]).includes(value)
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
  const name = getTrimmedString(formData, 'name')
  const wineryName = getTrimmedString(formData, 'winery')
  const region = getTrimmedString(formData, 'region')
  const country = getTrimmedString(formData, 'country')
  const type = getTrimmedString(formData, 'type')
  const vintageRaw = getTrimmedString(formData, 'vintage')
  const grapesRaw = getTrimmedString(formData, 'grapes')

  if (!name || !wineryName || !region || !country || !type || !vintageRaw || !grapesRaw) {
    return { error: 'Please fill in all required fields.' }
  }

  if (!isWineType(type)) {
    return { error: 'Please select a valid wine type.' }
  }

  const currentYear = new Date().getFullYear()
  const vintageYear = parseCanonicalInteger(vintageRaw)
  if (vintageYear === null || vintageYear < 1900 || vintageYear > currentYear + 1) {
    return { error: 'Please enter a valid vintage year.' }
  }

  const grapeNames = parseGrapeNames(grapesRaw)

  if (grapeNames.length === 0) {
    return { error: 'Please list at least one grape.' }
  }

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

  // --- Find-or-create winery (case-insensitive name match) -----------------
  // Identical to the Add Wine flow's winery block: the winery name field
  // always resolves via find-or-create, whether that lands on the wine's
  // current winery (the common case — user only touched region/country/etc.)
  // or a different one entirely (the user is correcting which winery this
  // wine belongs to, per GitHub issue #66). Either way, `wineryResult.created`
  // tells us whether this is a brand-new row (already geocoded on insert) or
  // an existing one whose region/country may now be a stale "correction".
  const wineryResult = await findOrCreateByName<{
    id: string
    region: string | null
    country: string | null
  }>(
    'winery',
    wineryName,
    () =>
      supabase
        .from('wineries')
        .select('id, region, country')
        .ilike('name', escapeIlikePattern(wineryName))
        .limit(1)
        .maybeSingle(),
    async () => {
      const locationPatch = await geocodeToLocationPatch(wineryName, region, country)
      return supabase
        .from('wineries')
        .insert({ name: wineryName, region, country, ...locationPatch })
        .select('id, region, country')
        .single()
    }
  )

  if (!wineryResult.ok) {
    return { error: GENERIC_SAVE_ERROR }
  }
  const wineryId = wineryResult.row.id

  if (!wineryResult.created) {
    const current = wineryResult.row
    if (current.region !== region || current.country !== country) {
      const locationPatch = await geocodeToLocationPatch(wineryName, region, country)
      const { error: wineryUpdateError } = await supabase
        .from('wineries')
        .update({ region, country, ...locationPatch })
        .eq('id', wineryId)

      if (wineryUpdateError) {
        console.error(`Failed to update winery "${wineryName}" details:`, wineryUpdateError)
        return { error: GENERIC_SAVE_ERROR }
      }
    }
  }

  // --- Update the wine's own record (name/type/winery) ---------------------
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

  // --- Update this vintage's year -------------------------------------------
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

  // --- Reconcile the grape list ---------------------------------------------
  const { data: currentLinks, error: currentLinksError } = await supabase
    .from('wine_grapes')
    .select('grape_id, grapes ( name )')
    .eq('wine_id', wine.id)

  if (currentLinksError) {
    console.error(`Failed to look up current grapes for wine "${wine.id}":`, currentLinksError)
    return { error: GENERIC_SAVE_ERROR }
  }

  const desiredKeys = new Set(grapeNames.map((grapeName) => grapeName.toLowerCase()))
  const currentByKey = new Map((currentLinks ?? []).map((link) => [link.grapes.name.toLowerCase(), link.grape_id]))

  const namesToAdd = grapeNames.filter((grapeName) => !currentByKey.has(grapeName.toLowerCase()))
  const grapeIdsToRemove = [...currentByKey.entries()]
    .filter(([key]) => !desiredKeys.has(key))
    .map(([, grapeId]) => grapeId)

  const [addHadError, removeHadError] = await Promise.all([
    Promise.all(
      namesToAdd.map(async (grapeName): Promise<boolean> => {
        const grapeResult = await findOrCreateByName<{ id: string }>(
          'grape',
          grapeName,
          () =>
            supabase
              .from('grapes')
              .select('id')
              .ilike('name', escapeIlikePattern(grapeName))
              .limit(1)
              .maybeSingle(),
          () => supabase.from('grapes').insert({ name: grapeName, color: 'other' }).select('id').single()
        )

        if (!grapeResult.ok) {
          return true
        }

        const { error: linkError } = await supabase
          .from('wine_grapes')
          .insert({ wine_id: wine.id, grape_id: grapeResult.row.id })

        if (linkError) {
          console.error(`Failed to link grape "${grapeName}" to wine "${wine.id}":`, linkError)
          return true
        }

        return false
      })
    ).then((results) => results.some(Boolean)),

    grapeIdsToRemove.length === 0
      ? Promise.resolve(false)
      : supabase
          .from('wine_grapes')
          .delete()
          .eq('wine_id', wine.id)
          .in('grape_id', grapeIdsToRemove)
          .then(({ error }) => {
            if (error) {
              console.error(`Failed to unlink removed grapes from wine "${wine.id}":`, error)
              return true
            }
            return false
          }),
  ])

  if (addHadError || removeHadError) {
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
