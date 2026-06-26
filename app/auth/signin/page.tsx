import { Suspense } from 'react'
import SignInForm from './SignInForm'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 rounded-xl border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">DamnUncorked</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your wine collection</p>
        </div>
        <Suspense>
          <SignInForm />
        </Suspense>
        <p className="text-center text-xs text-muted-foreground">Private — Dan & Madison only</p>
      </div>
    </div>
  )
}
