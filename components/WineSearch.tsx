'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Debounced so navigating (and the server re-fetch that comes with it)
// fires once typing pauses, not on every keystroke.
const DEBOUNCE_MS = 300

export function WineSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = value.trim()

      // Next.js treats a router.replace() to the exact current URL as a
      // soft-refresh, not a no-op — it re-runs the page's dynamic data
      // fetch and hands back a new searchParams object reference, which
      // (since searchParams is a dependency below) re-fires this effect.
      // Without this guard that becomes a self-sustaining loop: every fire
      // schedules an identical replace() 300ms later, forever, refetching
      // from Supabase the whole time the page is mounted. Bailing out once
      // the URL already reflects the current value breaks that cycle.
      if (trimmed === (searchParams.get('q') ?? '')) return

      const params = new URLSearchParams(searchParams.toString())
      if (trimmed.length === 0) {
        params.delete('q')
      } else {
        params.set('q', trimmed)
      }
      const query = params.toString()
      // replace, not push (unlike SortControl's single discrete choice) —
      // typing shouldn't add a back-button stop per debounced update.
      router.replace(query ? `${pathname}?${query}` : pathname)
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [value, searchParams, pathname, router])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, winery, region, grape, or type…"
        aria-label="Search wines"
        className="pl-8"
      />
    </div>
  )
}
