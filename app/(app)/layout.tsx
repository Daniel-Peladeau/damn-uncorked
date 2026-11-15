import { AppLayout } from '@/components/layout/AppLayout'
import { getCurrentUser } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profiles'
import { fallbackDisplayName } from '@/lib/profiles/display-name'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getMyProfile()])
  const userEmail = user?.email ?? null
  const displayName = profile?.display_name ?? fallbackDisplayName(userEmail)

  return (
    <AppLayout userEmail={userEmail} displayName={displayName}>
      {children}
    </AppLayout>
  )
}
