'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DeleteActionState = {
  error: string | null
}

// Shown to the user for any database failure — the real error is logged
// server-side via console.error instead of being sent to the client.
const GENERIC_DELETE_ERROR = 'Something went wrong. Please try again.'

// Bound with the vintage id and review id (via .bind()) before being passed
// to useActionState, so the confirm dialog's form never needs to submit
// either as a client-suppliable field. The trailing two params exist only to
// satisfy useActionState's required action signature — deletion needs no
// form data.
export async function deleteReview(
  vintageId: string,
  reviewId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: DeleteActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<DeleteActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to delete a review.' }
  }

  // Scoped to both the review id and the caller's own user_id — RLS already
  // prevents deleting another user's review, but scoping the query the same
  // way makes that intent explicit here rather than relying solely on the
  // policy to catch a mistake. `.select('id')` on the delete lets us tell a
  // genuine deletion apart from a silent zero-row no-op (a row an RLS policy
  // filtered out returns success with no error, not a thrown error).
  const { data: deleted, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .select('id')

  if (error) {
    console.error(`Failed to delete review "${reviewId}":`, error)
    return { error: GENERIC_DELETE_ERROR }
  }

  if (!deleted || deleted.length === 0) {
    console.error(`Delete review "${reviewId}" matched no rows (already deleted, or not owned by "${user.id}").`)
    return { error: GENERIC_DELETE_ERROR }
  }

  // Stays on the wine detail page — revalidate it so the deleted review
  // disappears and the "add your review" prompt reappears without a full
  // reload. Also revalidate /wines and /dashboard: both derive this user's
  // rating badge/average from the same review row (see getWinesForUser in
  // lib/supabase/queries.ts), so either page could otherwise show a stale
  // rating for a review that no longer exists.
  revalidatePath(`/wines/${vintageId}`)
  revalidatePath('/wines')
  revalidatePath('/dashboard')
  return { error: null }
}
