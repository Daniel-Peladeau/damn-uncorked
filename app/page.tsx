import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wine, Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2">
          <Wine className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-lg font-bold text-foreground">DamnUncorked</span>
        </div>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Rate it. Remember it. Drink better.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          A private wine journal for tracking, rating, and rediscovering the
          bottles you love — built for whites, rosés, and sparkling wine.
        </p>
        <Button asChild size="lg" className="mt-10">
          <Link href="/auth/signin">Sign In to Your Collection</Link>
        </Button>

        <div className="mt-20 grid w-full max-w-3xl gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-8 text-left">
            <Star className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold text-foreground">Rate every bottle</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Score appearance, nose, palate, finish, and value on your own terms.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8 text-left">
            <Wine className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold text-foreground">Build your log</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep tasting notes, food pairings, and photos for every wine you try.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8 text-left">
            <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold text-foreground">Explore wineries</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              See every winery you&apos;ve discovered plotted on a map.
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground sm:px-10">
        Private — Dan &amp; Madison only
      </footer>
    </div>
  )
}
