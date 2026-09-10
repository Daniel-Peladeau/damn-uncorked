'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

// Shared by every route segment's error.tsx. Next.js requires error
// boundaries to be Client Components, and passes `error`/`reset` regardless
// of whether the throw came from a Server or Client Component in that
// segment. The thrown value isn't always a genuine Error instance (e.g. a
// raw Supabase PostgrestError, which only structurally resembles one), so
// its `message` is logged for debugging rather than shown to the user —
// matching this codebase's existing convention (see server actions'
// GENERIC_SAVE_ERROR) of never surfacing raw error text in the UI.
export function ErrorFallback({
  error,
  reset,
  message = "We couldn't load this page. Please try again.",
}: {
  error: Error & { digest?: string }
  reset: () => void
  message?: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/40 bg-destructive/10 p-12 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
