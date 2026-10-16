'use client'

import { useEffect, useState } from 'react'
import type { GeocodeCandidate } from '@/lib/geocoding'

// Debounced + rate-limit-friendly: Nominatim's usage policy caps requests at
// roughly 1/second, so this waits for a pause in typing rather than firing
// per keystroke.
const DEBOUNCE_MS = 400
const MIN_QUERY_LENGTH = 2

// State and behavior behind WineryLocationSearch: the debounced
// /api/geocode lookup for the winery name combined with region/country, the
// result dropdown's open/highlight state, and keyboard navigation.
export function useLocationSearch(region: string, country: string) {
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

  return {
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
  }
}
