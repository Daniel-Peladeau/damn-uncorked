'use client'

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

export default function AddWinePage() {
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
        <form className="space-y-6 rounded-lg border border-border bg-card p-8">
          <div className="space-y-2">
            <Label htmlFor="name">Wine Name *</Label>
            <Input id="name" placeholder="e.g., Sauvignon Blanc" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="winery">Winery *</Label>
            <Input id="winery" placeholder="e.g., Cloudy Bay" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage *</Label>
              <Input id="vintage" type="number" placeholder="2022" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select>
                <SelectTrigger id="type">
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
              <Input id="region" placeholder="e.g., Marlborough" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" placeholder="e.g., New Zealand" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grapes">Grapes (comma-separated) *</Label>
            <Input id="grapes" placeholder="e.g., Sauvignon Blanc, Semillon" />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Ratings</h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {(
                ['Appearance', 'Nose', 'Palate', 'Finish', 'Value'] as const
              ).map((label) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs">{label}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="overall">Overall Rating (1–10)</Label>
              <Select>
                <SelectTrigger id="overall">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tastingNotes">Tasting Notes</Label>
            <Textarea
              id="tastingNotes"
              placeholder="Describe the wine's characteristics, flavors, aromas..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodPairing">Food Pairing</Label>
            <Input id="foodPairing" placeholder="e.g., Seafood, light salads" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="wouldBuyAgain" />
            <Label htmlFor="wouldBuyAgain" className="cursor-pointer font-normal">
              Would buy again
            </Label>
          </div>

          <div className="flex gap-4 border-t border-border pt-6">
            <Link href="/wines" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button className="flex-1">Save Wine</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
