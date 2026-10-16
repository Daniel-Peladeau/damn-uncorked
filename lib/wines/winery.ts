import type { ServerSupabaseClient } from '@/lib/supabase/server'
import { escapeIlikePattern, findOrCreateByName } from '@/lib/wines/find-or-create'

type LocationPatch = { location: string | null }

// Shared by the Add Wine and Edit Wine server actions. The winery name always
// resolves via find-or-create (case-insensitive name match) — whether that
// lands on the wine's current winery or a different one entirely (the user is
// correcting which winery this wine belongs to, per GitHub issue #66).
//
// For a winery that already existed, submitted region/country that differ
// from what's stored are treated as a correction rather than silently
// discarded, and the location is re-resolved since the stored pin is now
// stale. `forceLocationUpdate` re-resolves it even when region/country match
// (Add Wine passes this when the user explicitly confirmed a location via the
// live search). `resolveLocation` always returns a definite `location`, so a
// failed re-geocode clears the stale pin instead of keeping coordinates for
// the old region next to the corrected text.
//
// Returns the winery id, or null after logging on any database failure.
export async function resolveWinery(
  supabase: ServerSupabaseClient,
  { name, region, country }: { name: string; region: string; country: string },
  resolveLocation: () => Promise<LocationPatch>,
  forceLocationUpdate = false
): Promise<string | null> {
  // Explicit type argument: TS can't reliably unify the row shape from two
  // separate callback arguments via inference alone (it can silently fall
  // back to the `{ id: string }` constraint instead).
  const wineryResult = await findOrCreateByName<{
    id: string
    region: string | null
    country: string | null
  }>(
    'winery',
    name,
    () =>
      supabase
        .from('wineries')
        .select('id, region, country')
        .ilike('name', escapeIlikePattern(name))
        .limit(1)
        .maybeSingle(),
    async () => {
      // Best-effort — a failed/empty geocode still lets the wine save, just
      // without a map pin for this winery yet.
      const locationPatch = await resolveLocation()
      return supabase
        .from('wineries')
        .insert({ name, region, country, ...locationPatch })
        .select('id, region, country')
        .single()
    }
  )

  if (!wineryResult.ok) return null
  const wineryId = wineryResult.row.id

  if (!wineryResult.created) {
    const current = wineryResult.row
    if (forceLocationUpdate || current.region !== region || current.country !== country) {
      const locationPatch = await resolveLocation()
      const { error } = await supabase
        .from('wineries')
        .update({ region, country, ...locationPatch })
        .eq('id', wineryId)

      if (error) {
        console.error('Failed to update winery "%s" details:', name, error)
        return null
      }
    }
  }

  return wineryId
}
