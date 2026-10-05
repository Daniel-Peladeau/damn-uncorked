'use client'

import { startTransition, useOptimistic, type ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'
import { REVIEW_STATUSES, hasActiveFilters, type ReviewStatus, type WineFilters } from '@/lib/types/filters'

const STATUS_LABELS: Record<ReviewStatus, string> = {
  unreviewed: 'Not reviewed by me',
  both: 'Reviewed by both',
}

interface FilterChipsProps {
  filters: WineFilters
  loggedTypes: WineType[]
}

interface ChipProps {
  pressed: boolean
  onClick: () => void
  className?: string
  children: ReactNode
}

function Chip({ pressed, onClick, className, children }: ChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'default' : 'outline'}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn('rounded-full', className)}
    >
      {children}
    </Button>
  )
}

export function FilterChips({ filters: serverFilters, loggedTypes }: FilterChipsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Toggles are computed from the optimistic state, not the server prop:
  // otherwise a second tap before the first navigation lands would start
  // from stale filters and silently undo the first. It also flips the chip
  // the instant it's tapped instead of after the server round-trip.
  const [filters, setOptimisticFilters] = useOptimistic(serverFilters)

  // `filters` derives from the server's parsed view of the URL, so garbage
  // params are already dropped — rewriting from it (rather than patching
  // the raw params) also cleans them out of the URL on the next toggle.
  // q and sort are carried over untouched.
  function navigate(next: WineFilters) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('type')
    params.delete('buy')
    params.delete('status')
    if (next.types.length > 0) params.set('type', next.types.join(','))
    if (next.buyAgain) params.set('buy', '1')
    if (next.status) params.set('status', next.status)
    const query = params.toString()
    // push, like SortControl — each toggle is a discrete choice worth a
    // back-button stop.
    startTransition(() => {
      setOptimisticFilters(next)
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  function toggleType(type: WineType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : WINE_TYPES.filter((t) => t === type || filters.types.includes(t))
    navigate({ ...filters, types })
  }

  function toggleStatus(status: ReviewStatus) {
    navigate({ ...filters, status: filters.status === status ? null : status })
  }

  // A selected type stays visible even if no wine of that type is logged
  // (e.g. from an old link) so it can still be switched off.
  const visibleTypes = WINE_TYPES.filter((t) => loggedTypes.includes(t) || filters.types.includes(t))

  return (
    <div role="group" aria-label="Filter wines" className="flex flex-wrap items-center gap-2">
      {visibleTypes.map((type) => (
        <Chip
          key={type}
          pressed={filters.types.includes(type)}
          onClick={() => toggleType(type)}
          className="capitalize"
        >
          {type}
        </Chip>
      ))}
      <Chip pressed={filters.buyAgain} onClick={() => navigate({ ...filters, buyAgain: !filters.buyAgain })}>
        Would buy again
      </Chip>
      {REVIEW_STATUSES.map((status) => (
        <Chip key={status} pressed={filters.status === status} onClick={() => toggleStatus(status)}>
          {STATUS_LABELS[status]}
        </Chip>
      ))}
      {hasActiveFilters(filters) && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => navigate({ types: [], buyAgain: false, status: null })}
          className="rounded-full"
        >
          <X aria-hidden="true" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
