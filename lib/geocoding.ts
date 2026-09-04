// Best-effort winery geocoding via OpenStreetMap's Nominatim — free, no API
// key, and consistent with the OSM tiles already used on /map. Users type a
// winery name (not coordinates, which they wouldn't know); this fills in the
// map pin location in the background. A failed or empty lookup just means
// the winery won't have a pin yet — it never blocks saving the wine.
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

export type GeocodeResult = { lat: number; lng: number }

async function searchNominatim(query: string): Promise<GeocodeResult | null> {
  try {
    const url = new URL(NOMINATIM_SEARCH_URL)
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')

    const response = await fetch(url, {
      // Nominatim's usage policy requires an identifying User-Agent for every request.
      headers: { 'User-Agent': 'damn-uncorked (private wine log; github.com/Daniel-Peladeau/damn-uncorked)' },
      // A hanging request here would otherwise block the wine-save server
      // action indefinitely, not just delay it.
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error(`Nominatim geocoding request failed for "${query}": ${response.status}`)
      return null
    }

    const results = (await response.json()) as { lat: string; lon: string }[]
    const first = results[0]
    if (!first) return null

    const lat = Number.parseFloat(first.lat)
    const lng = Number.parseFloat(first.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    return { lat, lng }
  } catch (error) {
    console.error(`Failed to geocode "${query}":`, error)
    return null
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Many wineries — especially larger brands like "Kim Crawford" that are
// produced under contract rather than at a single visitable estate — aren't
// mapped as a specific place in OpenStreetMap, so the full "name, region,
// country" query often comes back empty. Degrading to "region, country" and
// then just "country" gives the pin progressively coarser but still
// meaningful precision instead of no pin at all. Deliberately does NOT fall
// back to the name alone without region/country context — a bare winery
// name is prone to matching an unrelated place entirely (e.g. "Kim Crawford"
// alone matches a department store in Hong Kong named "Lane Crawford").
export async function geocodeWinery(
  name: string,
  region: string,
  country: string
): Promise<GeocodeResult | null> {
  const queries = [[name, region, country], [region, country], [country]]
    .map((parts) => parts.filter(Boolean).join(', '))
    .filter((query, index, all) => query.length > 0 && all.indexOf(query) === index)

  for (const [index, query] of queries.entries()) {
    if (index > 0) await sleep(1000) // Nominatim's usage policy: max 1 request/second.

    const result = await searchNominatim(query)
    if (result) return result
  }

  return null
}

// geography columns accept EWKT text on insert/update through PostgREST —
// there's no binary/WKB support from the JS client, so this is the standard way.
export function toGeographyPoint({ lat, lng }: GeocodeResult): string {
  return `SRID=4326;POINT(${lng} ${lat})`
}

// Always returns a definite `location` value (never omits the key) so a
// caller updating an EXISTING winery correctly clears a now-stale pin when
// re-geocoding fails, rather than silently leaving old coordinates in place
// while the region/country text next to them changes.
export async function geocodeToLocationPatch(
  name: string,
  region: string,
  country: string
): Promise<{ location: string | null }> {
  const location = await geocodeWinery(name, region, country)
  return { location: location ? toGeographyPoint(location) : null }
}
