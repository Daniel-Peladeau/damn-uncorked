import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { WineCard } from '@/components/WineCard'
import { getWinesForUser } from '@/lib/supabase/queries'
import { Plus } from 'lucide-react'

export default async function WinesPage() {
  const wines = await getWinesForUser()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Wine Collection"
        description={`${wines.length} wines logged`}
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
        {wines.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
      </div>
    </div>
  )
}
