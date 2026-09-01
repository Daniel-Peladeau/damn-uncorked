'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'
import type { PostgrestError } from '@supabase/supabase-js'

export type AddWineFormState = {
  error: string | null
}

function isWineType(value: string): value is WineType {
  return (WINE_TYPES as readonly string[]).includes(value)
}

function getTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

// Number("5e0") === 5 and Number.isInteger(5) === true, so a plain
// Number()+isInteger check accepts scientific notation and other
// non-canonical numeric strings. This action is a server entrypoint reachable
// directly (not just through the UI's constrained inputs), so parsing is
// restricted to a canonical integer string before converting.
function parseCanonicalInteger(raw: string): number | null {
  if (!/^-?\d+$/.test(raw)) return null
  return Number(raw)
}

// The <Select> options in the UI already constrain ratings to 1-5/1-10, but
// this action is a server entrypoint reachable directly (not just through
// that UI), so the range/integer check has to be enforced here too.
function getRating(formData: FormData, key: string, min: number, max: number): number | null {
  const raw = getTrimmedString(formData, key)
  if (raw.length === 0) return null
  const parsed = parseCanonicalInteger(raw)
  if (parsed === null || parsed < min || parsed > max) return null
  return parsed
}

// ilike() treats "%", "_", and "*" as wildcards ("*" is PostgREST's alias for
// "%"), and "\" as its escape character — escape backslashes first (so we
// don't double-escape the escapes we add), then the wildcard characters, so a
// name containing any of them is matched literally rather than as a pattern.
function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/[%_*]/g, (match) => `\\${match}`)
}

type FindOrCreateResult<Row extends { id: string }> =
  | { ok: true; row: Row; created: boolean }
  | { ok: false; errorMessage: string }

type LookupResult<Row> = { data: Row | null; error: PostgrestError | null }

// Shared by every "find a row by some filter, else create it" flow below
// (winery, wine, grape, vintage). The actual `.from(table)` calls stay at
// each call site (as callbacks) rather than being parameterized by table name
// here — postgrest-js's insert/select typing doesn't hold up well when the
// table name itself is a generic type parameter, so keeping the calls
// concrete keeps this fully typed without resorting to `any`/type overrides.
// `entityLabel`/`name` are only used to build error messages.
//
// NOTE (accepted race condition): this is a select-then-insert, not an atomic
// upsert, so two near-simultaneous submissions for a brand-new name could
// both miss the lookup and insert duplicate rows. With only two users on this
// app that's unlikely enough to accept for now rather than adding an
// `.upsert()`/unique-constraint dependency we can't verify against the
// currently-paused database. Every lookup below uses `.limit(1)` so that, if
// a duplicate ever does exist, resolution degrades to "pick one" instead of
// `.maybeSingle()` hard-erroring on >1 rows and permanently breaking every
// future lookup for that name.
async function findOrCreateByName<Row extends { id: string }>(
  entityLabel: string,
  name: string,
  lookup: () => PromiseLike<LookupResult<Row>>,
  create: () => PromiseLike<LookupResult<Row>>
): Promise<FindOrCreateResult<Row>> {
  const { data: existing, error: lookupError } = await lookup()

  if (lookupError) {
    return { ok: false, errorMessage: `Failed to look up ${entityLabel} "${name}": ${lookupError.message}` }
  }

  if (existing) {
    return { ok: true, row: existing, created: false }
  }

  const { data: created, error: insertError } = await create()

  if (insertError || !created) {
    return {
      ok: false,
      errorMessage: `Failed to create ${entityLabel} "${name}": ${insertError?.message ?? 'unknown error'}`,
    }
  }

  return { ok: true, row: created, created: true }
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

  const currentYear = new Date().getFullYear()
  const vintage = parseCanonicalInteger(vintageRaw)
  if (vintage === null || vintage < 1900 || vintage > currentYear + 1) {
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
  // Explicit type argument: TS can't reliably unify the row shape from two
  // separate callback arguments via inference alone (it can silently fall
  // back to the `{ id: string }` constraint instead), so pin it here rather
  // than at every other call site.
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
    () =>
      supabase
        .from('wineries')
        .insert({ name: wineryName, region, country })
        .select('id, region, country')
        .single()
  )

  if (!wineryResult.ok) {
    return { error: wineryResult.errorMessage }
  }
  const wineryId = wineryResult.row.id

  // The winery already existed — if the submitted region/country differ from
  // what's stored, treat the form as a correction rather than silently
  // discarding it.
  if (!wineryResult.created) {
    const current = wineryResult.row
    if (current.region !== region || current.country !== country) {
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
  const wineResult = await findOrCreateByName<{ id: string; type: WineType }>(
    'wine',
    name,
    () =>
      supabase
        .from('wines')
        .select('id, type')
        .eq('winery_id', wineryId)
        .ilike('name', escapeIlikePattern(name))
        .limit(1)
        .maybeSingle(),
    () => supabase.from('wines').insert({ name, winery_id: wineryId, type }).select('id, type').single()
  )

  if (!wineResult.ok) {
    return { error: wineResult.errorMessage }
  }
  const wineId = wineResult.row.id

  // The wine already existed — same "treat the form as a correction" handling
  // as the winery block above, applied to the type this time.
  if (!wineResult.created && wineResult.row.type !== type) {
    const { error: wineUpdateError } = await supabase.from('wines').update({ type }).eq('id', wineId)

    if (wineUpdateError) {
      return { error: `Failed to update wine type: ${wineUpdateError.message}` }
    }
  }

  // --- Find-or-create grapes, then link to the wine ---------------------------
  // Each grape's find-or-create + link is independent of the others, so run
  // them concurrently instead of one at a time.
  const grapeLinkErrors = await Promise.all(
    grapeNames.map(async (grapeName): Promise<string | null> => {
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
        () =>
          // `color` is a real, documented schema field (CLAUDE.md) and not
          // confirmed nullable — the form doesn't collect a color for
          // newly-typed-in grapes yet, so default to 'other' rather than
          // risk a NOT NULL failure on every auto-created grape.
          supabase.from('grapes').insert({ name: grapeName, color: 'other' }).select('id').single()
      )

      if (!grapeResult.ok) {
        return grapeResult.errorMessage
      }
      const grapeId = grapeResult.row.id

      // Reusing an existing wine also means this wine_grapes pairing may
      // already exist from a prior vintage's submission — skip the insert if
      // so, rather than erroring on the (presumed) unique (wine_id, grape_id)
      // constraint or creating a duplicate row if none exists.
      const { data: existingWineGrape, error: wineGrapeLookupError } = await supabase
        .from('wine_grapes')
        .select('wine_id')
        .eq('wine_id', wineId)
        .eq('grape_id', grapeId)
        .limit(1)
        .maybeSingle()

      if (wineGrapeLookupError) {
        return `Failed to look up existing grape link for "${grapeName}": ${wineGrapeLookupError.message}`
      }

      if (existingWineGrape) {
        return null
      }

      // percentage is intentionally left unset — the form doesn't collect a
      // blend breakdown yet (see lib/types/database.ts for the nullability note).
      const { error: wineGrapeError } = await supabase
        .from('wine_grapes')
        .insert({ wine_id: wineId, grape_id: grapeId })

      if (wineGrapeError) {
        return `Failed to link grape "${grapeName}": ${wineGrapeError.message}`
      }

      return null
    })
  )

  const grapeError = grapeLinkErrors.find((error) => error !== null)
  if (grapeError) {
    return { error: grapeError }
  }

  // --- Find-or-create the vintage (same wine + year = shared by both users) ---
  const vintageResult = await findOrCreateByName<{ id: string }>(
    'vintage',
    String(vintage),
    () =>
      supabase
        .from('wine_vintages')
        .select('id')
        .eq('wine_id', wineId)
        .eq('vintage', vintage)
        .limit(1)
        .maybeSingle(),
    () => supabase.from('wine_vintages').insert({ wine_id: wineId, vintage }).select('id').single()
  )

  if (!vintageResult.ok) {
    return { error: vintageResult.errorMessage }
  }
  const vintageId = vintageResult.row.id

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
