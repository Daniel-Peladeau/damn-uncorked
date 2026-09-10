'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function WinesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback error={error} reset={reset} message="We couldn't load your wine collection. Please try again." />
}
