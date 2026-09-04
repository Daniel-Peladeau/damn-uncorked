// Best-effort wine label photo lookup via Open Food Facts — free, open
// (ODbL-licensed), crowd-sourced product database with images, no API key.
// Same "free open crowd-sourced API" pattern as lib/geocoding.ts's use of
// OpenStreetMap Nominatim. Coverage is hit-or-miss (skewed toward
// mass-market wines, weak for boutique producers) — a failed or empty
// lookup just means the wine won't have a photo yet; it never blocks
// saving the wine. The image URL is hotlinked directly (not re-hosted) —
// simplest option for now, revisit if hotlink reliability ever becomes a
// real problem in practice.
const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

async function searchOpenFoodFacts(query: string): Promise<string | null> {
  try {
    const url = new URL(OFF_SEARCH_URL)
    url.searchParams.set('search_terms', query)
    url.searchParams.set('search_simple', '1')
    url.searchParams.set('action', 'process')
    url.searchParams.set('json', '1')
    url.searchParams.set('page_size', '1')

    const response = await fetch(url, {
      headers: { 'User-Agent': 'damn-uncorked (private wine log; github.com/Daniel-Peladeau/damn-uncorked)' },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error(`Open Food Facts search failed for "${query}": ${response.status}`)
      return null
    }

    const data = (await response.json()) as {
      products?: { image_front_url?: string; image_url?: string }[]
    }
    const first = data.products?.[0]
    if (!first) return null

    return first.image_front_url ?? first.image_url ?? null
  } catch (error) {
    console.error(`Failed to fetch wine photo for "${query}":`, error)
    return null
  }
}

// Always returns a definite `label_image_url` value (never omits the key) —
// same convention as geocodeToLocationPatch, so a failed/empty lookup is
// unambiguous to the caller rather than leaving it to infer "no change" vs
// "explicitly not found".
export async function fetchWinePhotoPatch(
  wineryName: string,
  wineName: string
): Promise<{ label_image_url: string | null }> {
  // Deliberately no vintage year in the query — Open Food Facts entries
  // aren't vintage-specific, and adding the year would only narrow matches
  // further for the wines with the weakest coverage already.
  const label_image_url = await searchOpenFoodFacts([wineryName, wineName].filter(Boolean).join(' '))
  return { label_image_url }
}
