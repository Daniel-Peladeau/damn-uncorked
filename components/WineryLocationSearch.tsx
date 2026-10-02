'use client'

import { useEffect, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { GeocodeCandidate } from '@/lib/geocoding'

// Debounced + rate-limit-friendly: Nominatim's usage policy caps requests at
// roughly 1/second, so this waits for a pause in typing rather than firing
// per keystroke.
const DEBOUNCE_MS = 400
const MIN_QUERY_LENGTH = 2

// Live search-as-you-type winery location lookup for the Add Wine form
// (GitHub issue #68) — replaces the opaque "guess after save" geocode with
// real Nominatim results the user can see and confirm before saving. Owns
// the Winery text input itself (so it can combine it with the Region/
// Country text as the user types) while `region`/`country` are passed in as
// plain strings the parent form keeps in sync via onChange, without lifting
// those inputs into fully-controlled fields.
//
// Selecting a result sets hidden `wineryLat`/`wineryLng` fields the server
// action reads instead of re-geocoding (lib/geocoding.ts's
// parseSelectedLocation). If nothing is selected — or nothing matches — no
// hidden fields are submitted, and the existing best-effort post-save
// geocode takes over exactly as before; saving is never blocked on this.
export function WineryLocationSearch({ region, country }: { region: string; country: string }) {
  const [winery, setWinery] = useState('')
  const [results, setResults] = useState<GeocodeCandidate[]>([])
  const [selected, setSelected] = useState<GeocodeCandidate | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Resets everything tied to the previous search the moment the query text
  // changes — the winery name, or region/country typed alongside it — so a
  // stale confirmation/dropdown never lingers over edited text. This runs
  // during render rather than in an effect (React's documented "adjusting
  // state when a prop changes" pattern: comparing against a mirrored
  // previous value and updating state immediately, which still only costs
  // one extra render since `prevQueryKey` is restored to equal `queryKey`
  // in that same pass) because the actual debounced fetch effect below must
  // stay free of synchronous setState calls in its own body.
  const queryKey = `${winery}\n${region}\n${country}`
  const [prevQueryKey, setPrevQueryKey] = useState(queryKey)
  if (queryKey !== prevQueryKey) {
    setPrevQueryKey(queryKey)
    setSelected(null)
    setHighlightedIndex(-1)
    setHasSearched(false)
    setResults([])
    setIsOpen(false)
  }

  useEffect(() => {
    const trimmedWinery = winery.trim()
    if (trimmedWinery.length < MIN_QUERY_LENGTH) {
      return
    }

    const query = [trimmedWinery, region.trim(), country.trim()].filter(Boolean).join(', ')
    const controller = new AbortController()

    // All state updates below happen inside this timer callback, not
    // synchronously in the effect body — deferred to an actual async
    // boundary rather than fired on every dependency change.
    const handle = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          setResults([])
          return
        }

        const data = (await response.json()) as { results?: GeocodeCandidate[] }
        const candidates = data.results ?? []
        setResults(candidates)
        setIsOpen(candidates.length > 0)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setResults([])
      } finally {
        // `finally` still runs on the AbortError early-return above — guard
        // it, or a stale in-flight request (superseded by a newer keystroke
        // mid-fetch) flips `hasSearched`/`isLoading` back on for the old
        // query right after the newer query's render-phase reset already
        // cleared them, briefly showing a false "no match" state.
        if (!controller.signal.aborted) {
          setIsLoading(false)
          setHasSearched(true)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(handle)
      controller.abort()
    }
  }, [winery, region, country])

  function handleSelect(candidate: GeocodeCandidate) {
    setSelected(candidate)
    setIsOpen(false)
    setResults([])
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => (index <= 0 ? results.length - 1 : index - 1))
    } else if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault()
      handleSelect(results[highlightedIndex])
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const showNoMatches = hasSearched && !isLoading && results.length === 0 && winery.trim().length >= MIN_QUERY_LENGTH

  return (
    <div className="space-y-2">
      <Label htmlFor="winery">Winery *</Label>
      <div className="relative">
        <Input
          id="winery"
          name="winery"
          placeholder="e.g., Cloudy Bay"
          required
          autoComplete="off"
          value={winery}
          onChange={(e) => setWinery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="winery-location-results"
          aria-autocomplete="list"
        />
        {isLoading && (
          <Loader2 className="absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {isOpen && results.length > 0 && (
          <ul
            id="winery-location-results"
            role="listbox"
            className="absolute top-full left-0 z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
          >
            {results.map((result, index) => (
              <li key={`${result.lat}-${result.lng}`} role="option" aria-selected={index === highlightedIndex}>
                <button
                  type="button"
                  // Prevents the input's blur (and the dropdown-closing it
                  // would trigger) from firing before this click is handled.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(result)}
                  title={result.displayName}
                  className={cn(
                    'w-full truncate px-2.5 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    index === highlightedIndex && 'bg-accent text-accent-foreground'
                  )}
                >
                  {result.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Location confirmed: {selected.displayName}</span>
        </p>
      )}
      {showNoMatches && (
        <p className="text-xs text-muted-foreground">
          No location match found — we&apos;ll try to place a pin automatically after saving.
        </p>
      )}

      {/* Read by createWineEntry (app/(app)/wines/new/actions.ts) via
          lib/geocoding.ts's parseSelectedLocation — present only once a
          result has been picked, so an unconfirmed search falls back to the
          existing best-effort post-save geocode untouched. */}
      {selected && (
        <>
          <input type="hidden" name="wineryLat" value={selected.lat} />
          <input type="hidden" name="wineryLng" value={selected.lng} />
        </>
      )}
    </div>
  )
}
