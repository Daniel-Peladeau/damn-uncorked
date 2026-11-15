import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient, getCurrentUser, type ServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'
import { DISPLAY_NAME_MAX_LENGTH, fallbackDisplayName } from '@/lib/profiles/display-name'
import { logError } from '@/lib/log'

export type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'display_name' | 'avatar_url' | 'favorite_wine_type'
>

const PROFILE_COLUMNS = 'id, display_name, avatar_url, favorite_wine_type'

// cache() shares one lookup between the (app) layout and the /profile page
// within a single server render.
export const getMyProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle()

  if (error) {
    logError('Failed to load own profile', error)
    return null
  }
  return data
})

// Display names keyed by user id, e.g. for labelling the other reviewer's card.
export async function getDisplayNamesByIds(
  supabase: ServerSupabaseClient,
  ids: string[]
): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  if (ids.length === 0) return names

  const { data, error } = await supabase.from('profiles').select('id, display_name').in('id', ids)

  if (error) {
    logError('Failed to load profiles', error, { count: ids.length })
    return names
  }
  for (const { id, display_name } of data) names.set(id, display_name)
  return names
}

// Called from /auth/callback only after the allowlist check passes, under
// the user's own session (RLS: id = auth.uid()). ignoreDuplicates makes it
// ON CONFLICT DO NOTHING so a name the user has since edited is never reset.
// Failure is logged but never blocks sign-in — the UI falls back to the
// email local-part, and the next sign-in retries.
export async function ensureProfile(
  supabase: ServerSupabaseClient,
  user: User,
  allowlistName: string | null
): Promise<void> {
  const displayName = (allowlistName?.trim() || fallbackDisplayName(user.email) || 'Wine lover').slice(
    0,
    DISPLAY_NAME_MAX_LENGTH
  )

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName }, { onConflict: 'id', ignoreDuplicates: true })

  if (error) logError('Failed to create profile on sign-in', error)
}
