import type { ServerSupabaseClient } from '@/lib/supabase/server'
import { findOrCreateByName, type FindOrCreateResult } from '@/lib/wines/find-or-create'
import { fetchWinePhotoPatch } from '@/lib/wine-photo'

// Add Wine's find-or-create for the vintage: same wine + year = one
// wine_vintages row, shared by both users' reviews.
export function findOrCreateVintage(
  supabase: ServerSupabaseClient,
  { wineId, vintageYear, wineryName, wineName }: { wineId: string; vintageYear: number; wineryName: string; wineName: string }
): Promise<FindOrCreateResult<{ id: string }>> {
  return findOrCreateByName<{ id: string }>(
    'vintage',
    String(vintageYear),
    () =>
      supabase
        .from('wine_vintages')
        .select('id')
        .eq('wine_id', wineId)
        .eq('vintage_year', vintageYear)
        .limit(1)
        .maybeSingle(),
    async () => {
      // Best-effort — a failed/empty fetch still lets the wine save, just
      // without a label photo yet. Reuse a sibling vintage's photo first,
      // since label art is usually identical across vintages of the same
      // wine — avoids a redundant external lookup for the common case of
      // logging another year of a wine already in the catalog.
      const { data: siblingVintage } = await supabase
        .from('wine_vintages')
        .select('label_image_url')
        .eq('wine_id', wineId)
        .not('label_image_url', 'is', null)
        .limit(1)
        .maybeSingle()

      const photoPatch = siblingVintage
        ? { label_image_url: siblingVintage.label_image_url }
        : await fetchWinePhotoPatch(wineryName, wineName)

      return supabase
        .from('wine_vintages')
        .insert({ wine_id: wineId, vintage_year: vintageYear, ...photoPatch })
        .select('id')
        .single()
    }
  )
}
