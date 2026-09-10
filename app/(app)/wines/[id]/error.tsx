'use client'

import { ErrorFallback } from '@/components/ErrorFallback'

export default function WineDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback error={error} reset={reset} message="We couldn't load this wine. Please try again." />
}
