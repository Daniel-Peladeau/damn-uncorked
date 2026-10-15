import type { ServerSupabaseClient } from '@/lib/supabase/server'
import { escapeIlikePattern, findOrCreateByName } from '@/lib/wines/find-or-create'

// Finds or creates the grape by name, then links it to the wine unless that
// pairing already exists (e.g. from a prior vintage's submission) — skipping
// rather than tripping the wine_grapes (wine_id, grape_id) unique constraint.
// Returns false after logging on any database failure.
async function linkGrapeToWine(supabase: ServerSupabaseClient, wineId: string, grapeName: string): Promise<boolean> {
  const grapeResult = await findOrCreateByName<{ id: string }>(
    'grape',
    grapeName,
    () => supabase.from('grapes').select('id').ilike('name', escapeIlikePattern(grapeName)).limit(1).maybeSingle(),
    // The form doesn't collect a color for newly-typed-in grapes yet, so
    // they're saved as 'other' until someone sets it.
    () => supabase.from('grapes').insert({ name: grapeName, color: 'other' }).select('id').single()
  )

  if (!grapeResult.ok) return false
  const grapeId = grapeResult.row.id

  const { data: existingLink, error: lookupError } = await supabase
    .from('wine_grapes')
    .select('wine_id')
    .eq('wine_id', wineId)
    .eq('grape_id', grapeId)
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    console.error(`Failed to look up existing grape link for "${grapeName}":`, lookupError)
    return false
  }

  if (existingLink) return true

  // percentage is intentionally left unset — the form doesn't collect a
  // blend breakdown yet (see lib/types/database.ts for the nullability note).
  const { error: linkError } = await supabase.from('wine_grapes').insert({ wine_id: wineId, grape_id: grapeId })

  if (linkError) {
    console.error(`Failed to link grape "${grapeName}" to wine "${wineId}":`, linkError)
    return false
  }

  return true
}

// Each grape's find-or-create + link is independent of the others, so they
// run concurrently. Returns false if any of them failed.
export async function linkGrapesToWine(
  supabase: ServerSupabaseClient,
  wineId: string,
  grapeNames: string[]
): Promise<boolean> {
  const results = await Promise.all(grapeNames.map((grapeName) => linkGrapeToWine(supabase, wineId, grapeName)))
  return results.every(Boolean)
}

// Edit Wine: makes the wine's grape links match `grapeNames` exactly —
// links any new names and unlinks any that were removed, comparing
// case-insensitively like the grape lookup itself. Returns false if any
// step failed.
export async function reconcileWineGrapes(
  supabase: ServerSupabaseClient,
  wineId: string,
  grapeNames: string[]
): Promise<boolean> {
  const { data: currentLinks, error: currentLinksError } = await supabase
    .from('wine_grapes')
    .select('grape_id, grapes ( name )')
    .eq('wine_id', wineId)

  if (currentLinksError) {
    console.error(`Failed to look up current grapes for wine "${wineId}":`, currentLinksError)
    return false
  }

  const desiredKeys = new Set(grapeNames.map((grapeName) => grapeName.toLowerCase()))
  const currentByKey = new Map((currentLinks ?? []).map((link) => [link.grapes.name.toLowerCase(), link.grape_id]))

  const namesToAdd = grapeNames.filter((grapeName) => !currentByKey.has(grapeName.toLowerCase()))
  const grapeIdsToRemove = [...currentByKey.entries()]
    .filter(([key]) => !desiredKeys.has(key))
    .map(([, grapeId]) => grapeId)

  const [added, removed] = await Promise.all([
    linkGrapesToWine(supabase, wineId, namesToAdd),
    grapeIdsToRemove.length === 0
      ? Promise.resolve(true)
      : supabase
          .from('wine_grapes')
          .delete()
          .eq('wine_id', wineId)
          .in('grape_id', grapeIdsToRemove)
          .then(({ error }) => {
            if (error) {
              console.error(`Failed to unlink removed grapes from wine "${wineId}":`, error)
              return false
            }
            return true
          }),
  ])

  return added && removed
}
