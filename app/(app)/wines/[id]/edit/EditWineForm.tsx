'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { ArrowLeft } from 'lucide-react'
import { updateWineEntry, type EditWineFormState } from './actions'
import { WINE_TYPES, type WineType } from '@/lib/types/wine'

const initialState: EditWineFormState = { error: null }

type EditWineInitialValues = {
  name: string
  winery: string
  type: WineType
  region: string
  country: string
  vintage: number | null
  grapes: string
}

function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="flex-1" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save Changes'}
    </Button>
  )
}

export function EditWineForm({
  vintageId,
  initialValues,
}: {
  vintageId: string
  initialValues: EditWineInitialValues
}) {
  const updateWineForVintage = updateWineEntry.bind(null, vintageId)
  const [state, formAction] = useActionState(updateWineForVintage, initialState)
  const backHref = `/wines/${vintageId}`

  return (
    <div className="space-y-8">
      <Link href={backHref}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wine
        </Button>
      </Link>

      <PageHeader title="Edit Wine Details" description={initialValues.name} />

      <div className="max-w-2xl">
        <form action={formAction} className="space-y-6 rounded-lg border border-border bg-card p-8">
          {state.error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Wine Name *</Label>
            <Input id="name" name="name" defaultValue={initialValues.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="winery">Winery *</Label>
            <Input id="winery" name="winery" defaultValue={initialValues.winery} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage *</Label>
              <Input
                id="vintage"
                name="vintage"
                type="number"
                defaultValue={initialValues.vintage ?? undefined}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select name="type" required defaultValue={initialValues.type}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input id="region" name="region" defaultValue={initialValues.region} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" name="country" defaultValue={initialValues.country} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grapes">Grapes (comma-separated) *</Label>
            <Input id="grapes" name="grapes" defaultValue={initialValues.grapes} required />
          </div>

          <div className="flex gap-4 border-t border-border pt-6">
            <Link href={backHref} className="flex-1">
              <Button variant="outline" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
            <SaveButton />
          </div>
        </form>
      </div>
    </div>
  )
}
