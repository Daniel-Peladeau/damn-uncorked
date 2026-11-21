import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'
import { WINE_TYPE_STYLES } from '@/components/wine-type-styles'

// Shared by the Add Wine and Edit Wine forms.
export function WineTypeField({ defaultValue }: { defaultValue?: WineType }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Type *</Label>
      <Select name="type" required defaultValue={defaultValue}>
        <SelectTrigger id="type" className="w-full">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {WINE_TYPES.map((wineType) => {
            const { label, icon: Icon } = WINE_TYPE_STYLES[wineType]
            return (
              <SelectItem key={wineType} value={wineType}>
                <Icon aria-hidden="true" />
                {label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
