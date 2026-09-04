import { createClient } from '@/lib/supabase/server'

export type WineryPin = {
  id: string
  name: string
  region: string | null
  country: string | null
  lat: number
  lng: number
  wines: { vintageId: string; label: string }[]
}

type WineryRow = {
  id: string
  name: string
  region: string | null
  country: string | null
  wines: {
    name: string
    wine_vintages: { id: string; vintage_year: number | null }[]
  }[]
}

type LocationRow = { id: string; lat: number | null; lng: number | null }

// Wineries are a shared catalog (not scoped to one user — Dan and Madison log
// independent reviews of the same bottles from the same winery), so this
// returns every winery that has a geocoded location, regardless of who
// logged wines from it. `winery_locations` is a Postgres view that extracts
// lat/lng from the PostGIS `location` geography column (PostgREST can't
// return geography as usable JSON directly) — queried separately from
// `wineries` and merged by id, since embedding a view's computed columns
// through PostgREST relationships isn't reliable.
export async function getWineriesWithLocations(): Promise<WineryPin[]> {
  const supabase = await createClient()

  const [{ data: wineries, error: wineriesError }, { data: locations, error: locationsError }] = await Promise.all([
    supabase
      .from('wineries')
      .select('id, name, region, country, wines ( name, wine_vintages ( id, vintage_year ) )')
      .not('location', 'is', null)
      .returns<WineryRow[]>(),
    supabase.from('winery_locations').select('id, lat, lng').returns<LocationRow[]>(),
  ])

  if (wineriesError) throw wineriesError
  if (locationsError) throw locationsError

  const locationById = new Map((locations ?? []).map((location) => [location.id, location]))

  return (wineries ?? []).flatMap((winery) => {
    const location = locationById.get(winery.id)
    if (!location || location.lat === null || location.lng === null) return []

    return [
      {
        id: winery.id,
        name: winery.name,
        region: winery.region,
        country: winery.country,
        lat: location.lat,
        lng: location.lng,
        wines: winery.wines.flatMap((wine) =>
          wine.wine_vintages.map((vintage) => ({
            vintageId: vintage.id,
            label: vintage.vintage_year ? `${wine.name} ${vintage.vintage_year}` : wine.name,
          }))
        ),
      },
    ]
  })
}
