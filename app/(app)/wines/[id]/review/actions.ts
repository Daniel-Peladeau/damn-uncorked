'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { INVALID_RATINGS_ERROR, parseReviewFields } from '@/lib/reviews/validation'

export type ReviewFormState = {
  error: string | null
}

// Shown to the user for any database failure — the real error is logged
// server-side via console.error instead of being sent to the client.
const GENERIC_SAVE_ERROR = 'Something went wrong saving your review. Please try again.'

// Bound with the vintage id (via .bind()) before being passed to
// useActionState, so the form itself never needs to submit it as a hidden
// field the client could tamper with.
export async function saveReview(
  vintageId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const review = parseReviewFields(formData)
  if (!review) {
    return { error: INVALID_RATINGS_ERROR }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to save a review.' }
  }

  // Confirm the vintage exists before writing a review against it — an
  // invalid/deleted id should fail clearly rather than insert an orphaned
  // review row (the FK constraint would also catch this, but this gives a
  // cleaner user-facing error than a raw constraint-violation message).
  const { data: vintage, error: vintageError } = await supabase
    .from('wine_vintages')
    .select('id')
    .eq('id', vintageId)
    .maybeSingle()

  if (vintageError) {
    console.error('Failed to look up vintage for review save:', vintageId, vintageError)
    return { error: GENERIC_SAVE_ERROR }
  }

  if (!vintage) {
    return { error: 'This wine no longer exists.' }
  }

  // upsert rather than a separate select-then-insert-or-update: the
  // (user_id, wine_vintage_id) pair is unique (reviews_user_id_wine_vintage_id_key,
  // "one review per user per vintage"), so this atomically creates a first
  // review or overwrites the signed-in user's existing one for this vintage
  // — never touches the other user's row, since user_id is always the
  // authenticated caller's own id, not client-supplied.
  const { error: upsertError } = await supabase.from('reviews').upsert(
    { wine_vintage_id: vintageId, user_id: user.id, ...review },
    { onConflict: 'wine_vintage_id,user_id' }
  )

  if (upsertError) {
    console.error('Failed to save review for vintage:', vintageId, upsertError)
    return { error: GENERIC_SAVE_ERROR }
  }

  redirect(`/wines/${vintageId}`)
}
