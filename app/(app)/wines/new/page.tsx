'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
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

function RatingSelect({ name, max, id }: { name: string; max: number; id?: string }) {
  return (
    <Select name={name} required>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function AddWinePage() {
  const [state, formAction] = useActionState(createWineEntry, initialState)

  return (
    <div className="space-y-8">
      <Link href="/wines">
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

          <div className="space-y-2">
            <Label htmlFor="winery">Winery *</Label>
            <Input id="winery" name="winery" placeholder="e.g., Cloudy Bay" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage *</Label>
              <Input id="vintage" name="vintage" type="number" placeholder="2022" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select name="type" required>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="rosé">Rosé</SelectItem>
                  <SelectItem value="sparkling">Sparkling</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="fortified">Fortified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input id="region" name="region" placeholder="e.g., Marlborough" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" name="country" placeholder="e.g., New Zealand" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grapes">Grapes (comma-separated) *</Label>
            <Input id="grapes" name="grapes" placeholder="e.g., Sauvignon Blanc, Semillon" required />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Ratings *</h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {(
                [
                  { label: 'Appearance', name: 'appearance' },
                  { label: 'Nose', name: 'nose' },
                  { label: 'Palate', name: 'palate' },
                  { label: 'Finish', name: 'finish' },
                  { label: 'Value', name: 'value' },
                ] as const
              ).map(({ label, name }) => (
                <div key={name} className="space-y-2">
                  <Label className="text-xs">{label}</Label>
                  <RatingSelect name={name} max={5} />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="overall">Overall Rating (1–10) *</Label>
              <RatingSelect name="overall" max={10} id="overall" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tastingNotes">Tasting Notes</Label>
            <Textarea
              id="tastingNotes"
              name="tastingNotes"
              placeholder="Describe the wine's characteristics, flavors, aromas..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodPairing">Food Pairing</Label>
            <Input id="foodPairing" name="foodPairing" placeholder="e.g., Seafood, light salads" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="wouldBuyAgain" name="wouldBuyAgain" />
            <Label htmlFor="wouldBuyAgain" className="cursor-pointer font-normal">
              Would buy again
            </Label>
          </div>

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
