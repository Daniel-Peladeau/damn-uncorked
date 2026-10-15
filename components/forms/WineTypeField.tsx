import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'

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
          {WINE_TYPES.map((wineType) => (
            <SelectItem key={wineType} value={wineType}>
              {wineType.charAt(0).toUpperCase() + wineType.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
