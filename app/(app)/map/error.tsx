'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback error={error} reset={reset} message="We couldn't load the winery map. Please try again." />
}
