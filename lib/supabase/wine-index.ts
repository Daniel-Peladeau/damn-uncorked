import { createClient } from '@/lib/supabase/server'
import type { WineType } from '@/lib/types/wine'

export type WineIndexEntry = {
  id: string
  name: string
  winery: string
  vintage: number | null
  type: WineType
}

type WineIndexRow = {
  id: string
  vintage_year: number | null
  wines: {
    name: string
    wine_type: WineType
    winery: { name: string } | null
  }
}

// Just enough to find and open a bottle from the command palette — no
// reviews or grapes, so it stays cheap to fetch every time the palette opens.
export async function getWineIndex(): Promise<WineIndexEntry[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('wine_vintages')
    .select('id, vintage_year, wines ( name, wine_type, winery:wineries ( name ) )')
    .order('created_at', { ascending: false })
    .returns<WineIndexRow[]>()

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.wines.name,
    winery: row.wines.winery?.name ?? '',
    vintage: row.vintage_year,
    type: row.wines.wine_type,
  }))
}
