import { cn } from '@/lib/utils'
import type { WineType } from '@/lib/types/wine'
import { WINE_TYPE_STYLES } from './wine-type-styles'

export function WineTypeBadge({ type, className }: { type: WineType; className?: string }) {
  const { label, icon: Icon, className: colorClass } = WINE_TYPE_STYLES[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
