'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const errorMessages: Record<string, string> = {
  not_allowed: 'This email address is not authorized to access DamnUncorked.',
  auth_failed: 'Sign-in failed. Please try again.',
}

export default function SignInForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      setFormError(error.message)
    } else {
      setMagicLinkSent(true)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="rounded-lg bg-primary/10 p-4 text-center text-sm text-foreground">
        Check your email — a sign-in link is on its way.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {urlError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessages[urlError] ?? 'Something went wrong. Please try again.'}
        </div>
      )}

      <Button className="w-full gap-2" onClick={handleGoogleSignIn}>
        <GoogleIcon />
        Sign in with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or use email</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {formError && <p className="text-xs text-destructive">{formError}</p>}
        <Button type="submit" variant="outline" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send magic link'}
        </Button>
      </form>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.6 2.41v2h2.58c1.51-1.39 2.4-3.44 2.4-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.77 4.77 0 0 1-2.71.76c-2.08 0-3.85-1.4-4.48-3.3H.85v2.06A8 8 0 0 0 8 16z" fill="#34A853"/>
      <path d="M3.52 9.52A4.8 4.8 0 0 1 3.27 8c0-.53.09-1.04.25-1.52V4.42H.85A8 8 0 0 0 0 8c0 1.29.31 2.51.85 3.58l2.67-2.06z" fill="#FBBC05"/>
      <path d="M8 3.18c1.17 0 2.22.4 3.05 1.2l2.28-2.28A8 8 0 0 0 8 0 8 8 0 0 0 .85 4.42L3.52 6.48C4.15 4.58 5.92 3.18 8 3.18z" fill="#EA4335"/>
    </svg>
  )
}
