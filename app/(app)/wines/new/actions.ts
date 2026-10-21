'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTrimmedString, INVALID_RATINGS_ERROR, parseReviewFields } from '@/lib/reviews/validation'
import { parseWineFields } from '@/lib/wines/form'
import { resolveWinery } from '@/lib/wines/winery'
import { resolveWine } from '@/lib/wines/wine'
import { findOrCreateVintage } from '@/lib/wines/vintage'
import { linkGrapesToWine } from '@/lib/wines/wine-grapes'
import { geocodeToLocationPatch, parseSelectedLocation, toGeographyPoint } from '@/lib/geocoding'

export type AddWineFormState = {
  error: string | null
  // Set only for the "already reviewed this vintage" error, so the form can
  // link straight to the existing review's edit page.
  existingReviewHref?: string
}

// Shown to the user for any database failure — the real error (with table/
// column/constraint detail from Postgrest) is logged server-side via
// console.error instead of being sent to the client, since raw DB error text
// isn't something a user-facing form should expose.
const GENERIC_SAVE_ERROR = 'Something went wrong saving this wine. Please try again.'

export async function createWineEntry(
  _prevState: AddWineFormState,
  formData: FormData
): Promise<AddWineFormState> {
  const parsed = parseWineFields(formData)
  if (!parsed.ok) {
    return { error: parsed.error }
  }
  const { name, wineryName, region, country, type, vintageYear, grapeNames } = parsed.fields

  // Set when the user picked a result from the Add Wine form's live
  // location search (components/WineryLocationSearch.tsx, GitHub issue #68)
  // instead of leaving it to the existing post-save Nominatim guess.
  const selectedLocation = parseSelectedLocation(
    getTrimmedString(formData, 'wineryLat'),
    getTrimmedString(formData, 'wineryLng')
  )

  const review = parseReviewFields(formData)
  if (!review) {
    return { error: INVALID_RATINGS_ERROR }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to add a wine.' }
  }

  // NOTE (no cross-row atomicity): the winery/wine/grape/vintage/review writes
  // below are five-plus sequential requests, not one transaction — a failure
  // partway through (e.g. the review insert) leaves the earlier rows
  // committed. A Postgres function wrapping all of it in one transaction
  // would fix this properly. Known follow-up.

  // Prefers the user's confirmed search selection over a fresh Nominatim
  // call — same definite-`location`-value convention as
  // geocodeToLocationPatch, so either path is safe to spread directly into
  // an insert/update.
  async function resolveLocationPatch(): Promise<{ location: string | null }> {
    if (selectedLocation) {
      return { location: toGeographyPoint(selectedLocation) }
    }
    return geocodeToLocationPatch(wineryName, region, country)
  }

  const wineryId = await resolveWinery(
    supabase,
    { name: wineryName, region, country },
    resolveLocationPatch,
    selectedLocation !== null
  )
  if (!wineryId) {
    return { error: GENERIC_SAVE_ERROR }
  }

  const wineId = await resolveWine(supabase, { name, wineryId, type })
  if (!wineId) {
    return { error: GENERIC_SAVE_ERROR }
  }

  // Neither depends on the other (grapes need only wineId; the vintage needs
  // wineId and the already-validated vintage year), so run them concurrently.
  const [grapesLinked, vintageResult] = await Promise.all([
    linkGrapesToWine(supabase, wineId, grapeNames),
    findOrCreateVintage(supabase, { wineId, vintageYear, wineryName, wineName: name }),
  ])

  if (!grapesLinked || !vintageResult.ok) {
    return { error: GENERIC_SAVE_ERROR }
  }
  const vintageId = vintageResult.row.id

  // If this vintage already existed and this user already reviewed it, the
  // insert below hits reviews_user_id_wine_vintage_id_key (the only unique
  // constraint on reviews besides its generated id). This form is for
  // logging a wine for the first time, so point the user at the existing
  // review's edit page instead of a generic failure they can't retry past.
  const { error: reviewInsertError } = await supabase
    .from('reviews')
    .insert({ wine_vintage_id: vintageId, user_id: user.id, ...review })

  if (reviewInsertError) {
    if (reviewInsertError.code === '23505') {
      return {
        error: "You've already reviewed this vintage.",
        existingReviewHref: `/wines/${vintageId}/review`,
      }
    }
    console.error('Failed to save review:', reviewInsertError)
    return { error: GENERIC_SAVE_ERROR }
  }

  redirect(`/wines/${vintageId}`)
}
