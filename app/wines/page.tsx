'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { mockWines } from '@/lib/mock-data'
import { Plus } from 'lucide-react'

export default function WinesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Wine Collection"
        description={`${mockWines.length} wines logged`}
        action={
          <Link href="/wines/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Wine
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockWines.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
      </div>
    </div>
  )
}
