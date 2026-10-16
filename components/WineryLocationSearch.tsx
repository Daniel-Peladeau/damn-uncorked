'use client'

import { Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useLocationSearch } from '@/components/use-location-search'

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
  const {
    winery,
    setWinery,
    results,
    selected,
    isOpen,
    setIsOpen,
    isLoading,
    highlightedIndex,
    handleSelect,
    handleKeyDown,
    showNoMatches,
  } = useLocationSearch(region, country)

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
