// Best-effort winery geocoding via OpenStreetMap's Nominatim — free, no API
// key, and consistent with the OSM tiles already used on /map. Users type a
// winery name (not coordinates, which they wouldn't know); this fills in the
// map pin location in the background. A failed or empty lookup just means
// the winery won't have a pin yet — it never blocks saving the wine.
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

export type GeocodeResult = { lat: number; lng: number }

// Shared by searchNominatim (single best-effort result) and
// searchNominatimCandidates (several labeled results for the live-search
// dropdown) — same request shape, timeout, and User-Agent requirement for
// both, kept in one place so the two can't drift apart. Each caller does its
// own response-shape parsing, since one maps a single `{lat,lng}` and the
// other maps several `{lat,lng,displayName}` entries.
async function fetchNominatimSearch(query: string, limit: number): Promise<Response | null> {
  try {
    const url = new URL(NOMINATIM_SEARCH_URL)
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', String(limit))

    const response = await fetch(url, {
      // Nominatim's usage policy requires an identifying User-Agent for every request.
      headers: { 'User-Agent': 'damn-uncorked (private wine log; github.com/Daniel-Peladeau/damn-uncorked)' },
      // A hanging request here would otherwise block the wine-save server
      // action (or the live-search API route) indefinitely, not just delay it.
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error(`Nominatim search failed for "${query}": ${response.status}`)
      return null
    }

    return response
  } catch (error) {
    console.error(`Nominatim search request failed for "${query}":`, error)
    return null
  }
}

async function searchNominatim(query: string): Promise<GeocodeResult | null> {
  const response = await fetchNominatimSearch(query, 1)
  if (!response) return null

  try {
    const results = (await response.json()) as { lat: string; lon: string }[]
    const first = results[0]
    if (!first) return null

    const lat = Number.parseFloat(first.lat)
    const lng = Number.parseFloat(first.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    return { lat, lng }
  } catch (error) {
    console.error(`Failed to parse Nominatim response for "${query}":`, error)
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

export type GeocodeCandidate = GeocodeResult & { displayName: string }

// Separate from `geocodeWinery` above (server-only, single-result,
// best-effort post-save geocoding): this returns several ranked, labeled
// candidates for the Add Wine form's live search-as-you-type dropdown
// (GitHub issue #68), called from app/api/geocode/route.ts. The browser
// can't call Nominatim directly for this — fetch() can't set a custom
// User-Agent, which Nominatim's usage policy requires — so this always runs
// server-side, proxied through that route.
export async function searchNominatimCandidates(query: string, limit = 5): Promise<GeocodeCandidate[]> {
  const response = await fetchNominatimSearch(query, limit)
  if (!response) return []

  try {
    const results = (await response.json()) as { lat: string; lon: string; display_name: string }[]

    return results
      .map((result) => ({
        lat: Number.parseFloat(result.lat),
        lng: Number.parseFloat(result.lon),
        displayName: result.display_name,
      }))
      .filter((candidate) => Number.isFinite(candidate.lat) && Number.isFinite(candidate.lng))
  } catch (error) {
    console.error(`Failed to parse Nominatim response for "${query}":`, error)
    return []
  }
}

// Parses the hidden `wineryLat`/`wineryLng` fields the Add Wine form submits
// when the user picked a result from the live location search. Never
// trusted blindly — a hidden field is exactly as client-editable as a
// visible one, and this server action is reachable directly, not just
// through that UI. Anything missing, malformed, or out of the valid
// lat/lng range returns null, which falls through to the existing
// best-effort post-save geocoding rather than saving garbage coordinates.
export function parseSelectedLocation(latRaw: string, lngRaw: string): GeocodeResult | null {
  if (latRaw.length === 0 || lngRaw.length === 0) return null

  const lat = Number.parseFloat(latRaw)
  const lng = Number.parseFloat(lngRaw)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  return { lat, lng }
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
