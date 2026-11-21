import { Amphora, Candy, Cherry, Flower2, Sparkles, Wine, type LucideIcon } from 'lucide-react'
import type { WineType } from '@/lib/types/wine'

interface WineTypeStyle {
  label: string
  icon: LucideIcon
  // Full class strings (not built from the key) so Tailwind's scanner finds them.
  className: string
}

// Several fills sit close together (white/sparkling/dessert, rosé/red), so
// every use pairs the colour with the icon and the label.
export const WINE_TYPE_STYLES: Record<WineType, WineTypeStyle> = {
  white: { label: 'White', icon: Wine, className: 'bg-wine-white text-wine-white-foreground' },
  rosé: { label: 'Rosé', icon: Flower2, className: 'bg-wine-rose text-wine-rose-foreground' },
  sparkling: { label: 'Sparkling', icon: Sparkles, className: 'bg-wine-sparkling text-wine-sparkling-foreground' },
  red: { label: 'Red', icon: Cherry, className: 'bg-wine-red text-wine-red-foreground' },
  dessert: { label: 'Dessert', icon: Candy, className: 'bg-wine-dessert text-wine-dessert-foreground' },
  fortified: { label: 'Fortified', icon: Amphora, className: 'bg-wine-fortified text-wine-fortified-foreground' },
}
