import { cn } from '@/lib/utils'
import type { WineType } from '@/lib/types/wine'
import { WINE_TYPE_STYLES } from './wine-type-styles'

// Stand-in for the label photo until uploads land (#41): same 3:4 frame, so a
// real <img className="object-cover"> can replace the contents without the
// card shifting. Decorative — the card states the vintage and type in text.
export function WineLabelTile({ type, vintage, className }: { type: WineType; vintage: number; className?: string }) {
  const { icon: Icon, className: colorClass } = WINE_TYPE_STYLES[type]
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex aspect-[3/4] w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md',
        colorClass,
        className
      )}
    >
      <Icon className="size-4 opacity-80" />
      <span className="font-heading text-2xl leading-none tabular-nums">{vintage}</span>
    </div>
  )
}
