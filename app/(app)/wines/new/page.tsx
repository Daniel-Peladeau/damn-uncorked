'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/PageHeader'
import { RatingFields } from '@/components/forms/RatingFields'
import { ReviewNotesFields } from '@/components/forms/ReviewNotesFields'
import { WineTypeField } from '@/components/forms/WineTypeField'
import { WineryLocationSearch } from '@/components/WineryLocationSearch'
import { ArrowLeft } from 'lucide-react'
import { createWineEntry, type AddWineFormState } from './actions'

const initialState: AddWineFormState = { error: null }

function SaveWineButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="flex-1" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save Wine'}
    </Button>
  )
}

export default function AddWinePage() {
  const [state, formAction] = useActionState(createWineEntry, initialState)
  // Plain strings mirroring the (still uncontrolled) Region/Country inputs
  // below, kept only so WineryLocationSearch can combine them into its
  // Nominatim query as the user types — not used for the inputs' own value.
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')

  return (
    <div className="space-y-8">
      {/* The TopBar breadcrumb covers this on desktop; on mobile it's the
          bigger tap target, so it stays there. */}
      <Link href="/wines" className="md:hidden">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wines
        </Button>
      </Link>

      <PageHeader
        title="Add a New Wine"
        description="Log a wine you've recently enjoyed"
      />

      <div className="max-w-2xl">
        <form action={formAction} className="space-y-6 rounded-lg border border-border bg-card p-8">
          {state.error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Wine Name *</Label>
            <Input id="name" name="name" placeholder="e.g., Sauvignon Blanc" required />
          </div>

          <WineryLocationSearch region={region} country={country} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage *</Label>
              <Input id="vintage" name="vintage" type="number" placeholder="2022" required />
            </div>

            <WineTypeField />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                name="region"
                placeholder="e.g., Marlborough"
                required
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                placeholder="e.g., New Zealand"
                required
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grapes">Grapes (comma-separated) *</Label>
            <Input id="grapes" name="grapes" placeholder="e.g., Sauvignon Blanc, Semillon" required />
          </div>

          <div className="border-t border-border pt-6">
            <RatingFields />
          </div>

          <ReviewNotesFields />

          <div className="flex gap-4 border-t border-border pt-6">
            <Link href="/wines" className="flex-1">
              <Button variant="outline" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
            <SaveWineButton />
          </div>
        </form>
      </div>
    </div>
  )
}
