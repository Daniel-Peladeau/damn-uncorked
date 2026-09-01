'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { WineType } from '@/lib/types/wine'

export type AddWineFormState = {
  error: string | null
}

const WINE_TYPES = [
  'white',
  'rosé',
  'sparkling',
  'red',
  'dessert',
  'fortified',
] as const satisfies readonly WineType[]

function isWineType(value: string): value is WineType {
  return (WINE_TYPES as readonly string[]).includes(value)
}

function getTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getRating(formData: FormData, key: string): number | null {
  const raw = getTrimmedString(formData, key)
  if (raw.length === 0) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

// ilike() treats "%" and "_" as wildcards — escape them so a winery/grape name
// containing those characters is matched literally rather than as a pattern.
function escapeIlikePattern(value: string): string {
  return value.replace(/[%_]/g, (match) => `\\${match}`)
}

export async function createWineEntry(
  _prevState: AddWineFormState,
  formData: FormData
): Promise<AddWineFormState> {
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

  const vintage = Number(vintageRaw)
  const currentYear = new Date().getFullYear()
  if (!Number.isInteger(vintage) || vintage < 1900 || vintage > currentYear + 1) {
    return { error: 'Please enter a valid vintage year.' }
  }

  const grapeNames = Array.from(
    new Set(
      grapesRaw
        .split(',')
        .map((grape) => grape.trim())
        .filter((grape) => grape.length > 0)
    )
  )

  if (grapeNames.length === 0) {
    return { error: 'Please list at least one grape.' }
  }

  const appearance = getRating(formData, 'appearance')
  const nose = getRating(formData, 'nose')
  const palate = getRating(formData, 'palate')
  const finish = getRating(formData, 'finish')
  const value = getRating(formData, 'value')
  const overall = getRating(formData, 'overall')

  if (
    appearance === null ||
    nose === null ||
    palate === null ||
    finish === null ||
    value === null ||
    overall === null
  ) {
    return { error: 'Please provide all ratings.' }
  }

  const tastingNotesRaw = getTrimmedString(formData, 'tastingNotes')
  const foodPairingRaw = getTrimmedString(formData, 'foodPairing')
  const tastingNotes = tastingNotesRaw.length > 0 ? tastingNotesRaw : null
  const foodPairing = foodPairingRaw.length > 0 ? foodPairingRaw : null
  const wouldBuyAgain = formData.get('wouldBuyAgain') === 'on'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to add a wine.' }
  }

  // --- Find-or-create winery (case-insensitive name match) -----------------
  const { data: existingWinery, error: wineryLookupError } = await supabase
    .from('wineries')
    .select('id')
    .ilike('name', escapeIlikePattern(wineryName))
    .maybeSingle()

  if (wineryLookupError) {
    return { error: `Failed to look up winery: ${wineryLookupError.message}` }
  }

  let wineryId: string
  if (existingWinery) {
    wineryId = existingWinery.id
  } else {
    const { data: newWinery, error: wineryInsertError } = await supabase
      .from('wineries')
      .insert({ name: wineryName, region, country })
      .select('id')
      .single()

    if (wineryInsertError || !newWinery) {
      return {
        error: `Failed to create winery: ${wineryInsertError?.message ?? 'unknown error'}`,
      }
    }
    wineryId = newWinery.id
  }

  // --- Create wine -----------------------------------------------------------
  const { data: newWine, error: wineInsertError } = await supabase
    .from('wines')
    .insert({ name, winery_id: wineryId, type })
    .select('id')
    .single()

  if (wineInsertError || !newWine) {
    return { error: `Failed to create wine: ${wineInsertError?.message ?? 'unknown error'}` }
  }
  const wineId = newWine.id

  // --- Find-or-create grapes, then link to the wine ---------------------------
  for (const grapeName of grapeNames) {
    const { data: existingGrape, error: grapeLookupError } = await supabase
      .from('grapes')
      .select('id')
      .ilike('name', escapeIlikePattern(grapeName))
      .maybeSingle()

    if (grapeLookupError) {
      return { error: `Failed to look up grape "${grapeName}": ${grapeLookupError.message}` }
    }

    let grapeId: string
    if (existingGrape) {
      grapeId = existingGrape.id
    } else {
      const { data: newGrape, error: grapeInsertError } = await supabase
        .from('grapes')
        .insert({ name: grapeName })
        .select('id')
        .single()

      if (grapeInsertError || !newGrape) {
        return {
          error: `Failed to create grape "${grapeName}": ${grapeInsertError?.message ?? 'unknown error'}`,
        }
      }
      grapeId = newGrape.id
    }

    // percentage is intentionally left unset — the form doesn't collect a
    // blend breakdown yet (see lib/types/database.ts for the nullability note).
    const { error: wineGrapeError } = await supabase
      .from('wine_grapes')
      .insert({ wine_id: wineId, grape_id: grapeId })

    if (wineGrapeError) {
      return { error: `Failed to link grape "${grapeName}": ${wineGrapeError.message}` }
    }
  }

  // --- Create the vintage ------------------------------------------------------
  const { data: newVintage, error: vintageInsertError } = await supabase
    .from('wine_vintages')
    .insert({ wine_id: wineId, vintage })
    .select('id')
    .single()

  if (vintageInsertError || !newVintage) {
    return {
      error: `Failed to create vintage: ${vintageInsertError?.message ?? 'unknown error'}`,
    }
  }
  const vintageId = newVintage.id

  // --- Create this user's review for the vintage -------------------------------
  const { error: reviewInsertError } = await supabase.from('reviews').insert({
    wine_vintage_id: vintageId,
    user_id: user.id,
    appearance,
    nose,
    palate,
    finish,
    value,
    overall,
    tasting_notes: tastingNotes,
    food_pairing: foodPairing,
    would_buy_again: wouldBuyAgain,
  })

  if (reviewInsertError) {
    return { error: `Failed to save review: ${reviewInsertError.message}` }
  }

  // The wine detail route (app/(app)/wines/[id]/page.tsx) is still backed by
  // mock data as of this change (that conversion is a separate backlog item),
  // but its flat "one row per wine" shape — name/winery/vintage/ratings all
  // together — corresponds to a single wine_vintage + its review, not the
  // abstract `wines` row. Redirecting by vintage id is the closer match once
  // that page is wired to Supabase.
  redirect(`/wines/${vintageId}`)
}
