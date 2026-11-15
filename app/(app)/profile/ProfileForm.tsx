'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DISPLAY_NAME_MAX_LENGTH } from '@/lib/profiles/display-name'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'
import { NO_FAVORITE_WINE_TYPE } from '@/lib/profiles/favorite-wine-type'
import { updateProfile, type ProfileFormState } from './actions'

const initialState: ProfileFormState = { error: null, saved: false }

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save Profile'}
    </Button>
  )
}

export function ProfileForm({
  displayName,
  favoriteWineType,
}: {
  displayName: string
  favoriteWineType: WineType | null
}) {
  const [state, formAction] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      {state.saved && (
        <p role="status" className="text-sm text-muted-foreground">
          Profile saved.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name *</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          required
          autoComplete="nickname"
        />
        <p className="text-xs text-muted-foreground">Shown on your reviews and in the account menu.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="favorite_wine_type">Favorite Wine Type</Label>
        <Select name="favorite_wine_type" defaultValue={favoriteWineType ?? NO_FAVORITE_WINE_TYPE}>
          <SelectTrigger id="favorite_wine_type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_FAVORITE_WINE_TYPE}>No preference</SelectItem>
            {WINE_TYPES.map((wineType) => (
              <SelectItem key={wineType} value={wineType}>
                {wineType.charAt(0).toUpperCase() + wineType.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SaveButton />
    </form>
  )
}
