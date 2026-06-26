'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
          {/* Wine Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Wine Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Sauvignon Blanc"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Winery */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Winery *
            </label>
            <input
              type="text"
              placeholder="e.g., Cloudy Bay"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Vintage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vintage *
              </label>
              <input
                type="number"
                placeholder="2022"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Wine Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type *
              </label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select type</option>
                <option value="white">White</option>
                <option value="rosé">Rosé</option>
                <option value="sparkling">Sparkling</option>
                <option value="red">Red</option>
                <option value="dessert">Dessert</option>
                <option value="fortified">Fortified</option>
              </select>
            </div>
          </div>

          {/* Region & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Region *
              </label>
              <input
                type="text"
                placeholder="e.g., Marlborough"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Country *
              </label>
              <input
                type="text"
                placeholder="e.g., New Zealand"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Grapes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Grapes (comma-separated) *
            </label>
            <input
              type="text"
              placeholder="e.g., Sauvignon Blanc, Semillon"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Ratings */}
          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Ratings
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { label: 'Appearance', name: 'appearance' },
                { label: 'Nose', name: 'nose' },
                { label: 'Palate', name: 'palate' },
                { label: 'Finish', name: 'finish' },
                { label: 'Value', name: 'value' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-foreground mb-2">
                    {label}
                  </label>
                  <select className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">—</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              ))}
            </div>

            {/* Overall Rating */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Overall Rating (1–10)
              </label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">—</option>
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasting Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tasting Notes
            </label>
            <textarea
              placeholder="Describe the wine's characteristics, flavors, aromas..."
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Food Pairing */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Food Pairing
            </label>
            <input
              type="text"
              placeholder="e.g., Seafood, light salads"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Would Buy Again */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="wouldBuyAgain"
              className="h-4 w-4 rounded border-border"
            />
            <label
              htmlFor="wouldBuyAgain"
              className="text-sm text-foreground cursor-pointer"
            >
              Would buy again
            </label>
          </div>

          {/* Actions */}
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
