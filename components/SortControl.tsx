'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SORT_OPTIONS, type SortOption } from '@/lib/types/sort'

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Recently Added',
  rating: 'Highest Rated',
  vintage: 'Vintage (Newest)',
}

export function SortControl({ currentSort }: { currentSort: SortOption }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    // "recent" is the default, so omit it from the URL rather than writing
    // ?sort=recent for what's already the no-param behavior.
    if (value === 'recent') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]" aria-label="Sort wines">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
