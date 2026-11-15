import { PageHeader } from '@/components/PageHeader'
import { getCurrentUser } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profiles'
import { fallbackDisplayName, initialOf } from '@/lib/profiles/display-name'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getMyProfile()])
  const email = user?.email ?? null
  const displayName = profile?.display_name ?? fallbackDisplayName(email) ?? ''

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="How you appear to each other across DamnUncorked." />

      <div className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          {/* Initials only for now — photo upload can reuse the Supabase
              Storage pattern from label photo upload (#41) once that lands,
              saving the URL to profiles.avatar_url. */}
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {initialOf(displayName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{displayName || 'Your profile'}</p>
            {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
          </div>
        </div>

        <ProfileForm displayName={displayName} favoriteWineType={profile?.favorite_wine_type ?? null} />
      </div>
    </div>
  )
}
