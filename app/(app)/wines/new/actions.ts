'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { WineType } from '@/lib/types/wine'
import type { PostgrestError } from '@supabase/supabase-js'

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

// The <Select> options in the UI already constrain ratings to 1-5/1-10, but
// this action is a server entrypoint reachable directly (not just through
// that UI), so the range/integer check has to be enforced here too.
function getRating(formData: FormData, key: string, min: number, max: number): number | null {
  const raw = getTrimmedString(formData, key)
  if (raw.length === 0) return null
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null
  return parsed
}

// ilike() treats "%" and "_" as wildcards, and "\" as its escape character —
// escape backslashes first (so we don't double-escape the escapes we add),
// then the wildcard characters, so a name containing any of them is matched
// literally rather than as a pattern.
function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/[%_]/g, (match) => `\\${match}`)
}

type FindOrCreateResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; errorMessage: string }

type IdLookupResult = { data: { id: string } | null; error: PostgrestError | null }

// Shared by the winery and grape flows below, which both resolve a row by a
// case-insensitive name match, creating it if it doesn't exist yet. The
// actual `.from(table)` calls stay at each call site (as callbacks) rather
// than being parameterized by table name here — postgrest-js's insert/select
// typing doesn't hold up well when the table name itself is a generic type
// parameter, so keeping the calls concrete keeps this fully typed without
// resorting to `any`/type overrides.
//
// NOTE (accepted race condition): this is a select-then-insert, not an atomic
// upsert, so two near-simultaneous submissions for a brand-new name could
// both miss the lookup and insert duplicate rows. With only two users on this
// app that's unlikely enough to accept for now rather than adding an
// `.upsert()`/unique-constraint dependency we can't verify against the
// currently-paused database.
async function findOrCreateByName(
  entityLabel: string,
  name: string,
  lookup: () => PromiseLike<IdLookupResult>,
  create: () => PromiseLike<IdLookupResult>
): Promise<FindOrCreateResult> {
  const { data: existing, error: lookupError } = await lookup()

  if (lookupError) {
    return { ok: false, errorMessage: `Failed to look up ${entityLabel} "${name}": ${lookupError.message}` }
  }

  if (existing) {
    return { ok: true, id: existing.id, created: false }
  }

  const { data: created, error: insertError } = await create()

  if (insertError || !created) {
    return {
      ok: false,
      errorMessage: `Failed to create ${entityLabel} "${name}": ${insertError?.message ?? 'unknown error'}`,
    }
  }

  return { ok: true, id: created.id, created: true }
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

  // Dedup case-insensitively (e.g. "Merlot, merlot") — the grape lookup below
  // is itself case-insensitive, so exact-string dedup alone would still let
  // through two entries that resolve to the same grape row, producing two
  // identical wine_grapes inserts. Keep the first-seen casing for display.
  const grapeNames = Array.from(
    grapesRaw
      .split(',')
      .map((grape) => grape.trim())
      .filter((grape) => grape.length > 0)
      .reduce((seen, grape) => {
        const key = grape.toLowerCase()
        if (!seen.has(key)) seen.set(key, grape)
        return seen
      }, new Map<string, string>())
      .values()
  )

  if (grapeNames.length === 0) {
    return { error: 'Please list at least one grape.' }
  }

  const appearance = getRating(formData, 'appearance', 1, 5)
  const nose = getRating(formData, 'nose', 1, 5)
  const palate = getRating(formData, 'palate', 1, 5)
  const finish = getRating(formData, 'finish', 1, 5)
  const value = getRating(formData, 'value', 1, 5)
  const overall = getRating(formData, 'overall', 1, 10)

  if (
    appearance === null ||
    nose === null ||
    palate === null ||
    finish === null ||
    value === null ||
    overall === null
  ) {
    return { error: 'Please provide valid ratings (1–5 for each category, 1–10 for overall).' }
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

  // NOTE (no cross-row atomicity): the winery/wine/grape/vintage/review writes
  // below are five-plus sequential requests, not one transaction — a failure
  // partway through (e.g. the review insert) leaves the earlier rows
  // committed. A Postgres RPC wrapping all of it in one transaction would fix
  // this properly, but that's a bigger change than this pass warrants and
  // can't be verified against the currently-paused database. Known follow-up.

  // --- Find-or-create winery (case-insensitive name match) -----------------
  const wineryResult = await findOrCreateByName(
    'winery',
    wineryName,
    () =>
      supabase
        .from('wineries')
        .select('id')
        .ilike('name', escapeIlikePattern(wineryName))
        .maybeSingle(),
    () =>
      supabase
        .from('wineries')
        .insert({ name: wineryName, region, country })
        .select('id')
        .single()
  )

  if (!wineryResult.ok) {
    return { error: wineryResult.errorMessage }
  }
  const wineryId = wineryResult.id

  // The winery already existed — if the submitted region/country differ from
  // what's stored, treat the form as a correction rather than silently
  // discarding it.
  if (!wineryResult.created) {
    const { data: currentWinery, error: wineryFetchError } = await supabase
      .from('wineries')
      .select('region, country')
      .eq('id', wineryId)
      .single()

    if (wineryFetchError) {
      return { error: `Failed to read existing winery details: ${wineryFetchError.message}` }
    }

    if (currentWinery.region !== region || currentWinery.country !== country) {
      const { error: wineryUpdateError } = await supabase
        .from('wineries')
        .update({ region, country })
        .eq('id', wineryId)

      if (wineryUpdateError) {
        return { error: `Failed to update winery details: ${wineryUpdateError.message}` }
      }
    }
  }

  // --- Find-or-create wine (same winery + name = same wine across vintages) ---
  const { data: existingWine, error: wineLookupError } = await supabase
    .from('wines')
    .select('id')
    .eq('winery_id', wineryId)
    .ilike('name', escapeIlikePattern(name))
    .maybeSingle()

  if (wineLookupError) {
    return { error: `Failed to look up wine: ${wineLookupError.message}` }
  }

  let wineId: string
  if (existingWine) {
    wineId = existingWine.id
  } else {
    const { data: newWine, error: wineInsertError } = await supabase
      .from('wines')
      .insert({ name, winery_id: wineryId, type })
      .select('id')
      .single()

    if (wineInsertError || !newWine) {
      return { error: `Failed to create wine: ${wineInsertError?.message ?? 'unknown error'}` }
    }
    wineId = newWine.id
  }

  // --- Find-or-create grapes, then link to the wine ---------------------------
  for (const grapeName of grapeNames) {
    const grapeResult = await findOrCreateByName(
      'grape',
      grapeName,
      () =>
        supabase
          .from('grapes')
          .select('id')
          .ilike('name', escapeIlikePattern(grapeName))
          .maybeSingle(),
      () => supabase.from('grapes').insert({ name: grapeName }).select('id').single()
    )

    if (!grapeResult.ok) {
      return { error: grapeResult.errorMessage }
    }
    const grapeId = grapeResult.id

    // Reusing an existing wine also means this wine_grapes pairing may
    // already exist from a prior vintage's submission — skip the insert if
    // so, rather than erroring on the (presumed) unique (wine_id, grape_id)
    // constraint or creating a duplicate row if none exists.
    const { data: existingWineGrape, error: wineGrapeLookupError } = await supabase
      .from('wine_grapes')
      .select('wine_id')
      .eq('wine_id', wineId)
      .eq('grape_id', grapeId)
      .maybeSingle()

    if (wineGrapeLookupError) {
      return {
        error: `Failed to look up existing grape link for "${grapeName}": ${wineGrapeLookupError.message}`,
      }
    }

    if (existingWineGrape) {
      continue
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

  // --- Find-or-create the vintage (same wine + year = shared by both users) ---
  const { data: existingVintage, error: vintageLookupError } = await supabase
    .from('wine_vintages')
    .select('id')
    .eq('wine_id', wineId)
    .eq('vintage', vintage)
    .maybeSingle()

  if (vintageLookupError) {
    return { error: `Failed to look up vintage: ${vintageLookupError.message}` }
  }

  let vintageId: string
  if (existingVintage) {
    vintageId = existingVintage.id
  } else {
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
    vintageId = newVintage.id
  }

  // --- Create this user's review for the vintage -------------------------------
  // If this vintage already existed and this user already reviewed it, the
  // insert below will hit the "one row per user per wine_vintage" constraint
  // and surface as a raw error message — editing an existing review is a
  // separate, not-yet-built backlog item (Phase 3), so that's expected for now.
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
