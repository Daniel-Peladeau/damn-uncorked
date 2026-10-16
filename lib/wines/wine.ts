import type { ServerSupabaseClient } from '@/lib/supabase/server'
import type { WineType } from '@/lib/types/wine'
import { escapeIlikePattern, findOrCreateByName } from '@/lib/wines/find-or-create'

// Add Wine's find-or-create for the `wines` row: same winery + name = same
// wine across vintages. If the wine already existed with a different type,
// the submitted type is treated as a correction — same handling as
// resolveWinery's region/country. Returns the wine id, or null after logging
// on any database failure.
export async function resolveWine(
  supabase: ServerSupabaseClient,
  { name, wineryId, type }: { name: string; wineryId: string; type: WineType }
): Promise<string | null> {
  const wineResult = await findOrCreateByName<{ id: string; wine_type: WineType }>(
    'wine',
    name,
    () =>
      supabase
        .from('wines')
        .select('id, wine_type')
        .eq('winery_id', wineryId)
        .ilike('name', escapeIlikePattern(name))
        .limit(1)
        .maybeSingle(),
    () =>
      supabase.from('wines').insert({ name, winery_id: wineryId, wine_type: type }).select('id, wine_type').single()
  )

  if (!wineResult.ok) return null
  const wineId = wineResult.row.id

  if (!wineResult.created && wineResult.row.wine_type !== type) {
    const { error } = await supabase.from('wines').update({ wine_type: type }).eq('id', wineId)

    if (error) {
      console.error('Failed to update wine "%s" type:', name, error)
      return null
    }
  }

  return wineId
}
