'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { validateDisplayName } from '@/lib/profiles/display-name'
import { parseFavoriteWineType } from '@/lib/profiles/favorite-wine-type'
import { logError } from '@/lib/log'

export type ProfileFormState = {
  error: string | null
  saved: boolean
}

// Shown for any database failure — the real error is logged server-side.
const GENERIC_SAVE_ERROR = 'Something went wrong. Please try again.'

export async function updateProfile(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to update your profile.', saved: false }
  }

  const displayName = validateDisplayName(formData.get('display_name'))
  if ('error' in displayName) return { error: displayName.error, saved: false }

  const favorite = parseFavoriteWineType(formData.get('favorite_wine_type'))
  if ('error' in favorite) return { error: favorite.error, saved: false }

  const fields = { display_name: displayName.value, favorite_wine_type: favorite.value }

  // Scoped to the caller's own id — RLS also enforces id = auth.uid(), and
  // `id` itself isn't an updatable column. `.select('id')` tells a real
  // update apart from a zero-row no-op (no profile row yet).
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', user.id)
    .select('id')

  if (updateError) {
    logError('Failed to update profile', updateError)
    return { error: GENERIC_SAVE_ERROR, saved: false }
  }

  // The callback normally creates the row on sign-in; this covers the case
  // where that insert failed.
  if (updated.length === 0) {
    const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, ...fields })
    if (insertError) {
      logError('Failed to create profile', insertError)
      return { error: GENERIC_SAVE_ERROR, saved: false }
    }
  }

  // The display name appears in the app layout (account menu) and on any
  // wine detail page's review cards, so refresh everything under the layout.
  revalidatePath('/', 'layout')
  return { error: null, saved: true }
}
