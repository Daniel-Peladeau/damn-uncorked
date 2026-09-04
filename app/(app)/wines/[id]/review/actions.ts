'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTrimmedString, getRating } from '@/lib/reviews/validation'

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
  const appearance = getRating(formData, 'appearance', 1, 5)
  const nose = getRating(formData, 'nose', 1, 5)
  const palate = getRating(formData, 'palate', 1, 5)
  const finish = getRating(formData, 'finish', 1, 5)
  const value = getRating(formData, 'value', 1, 5)
  const overall = getRating(formData, 'overall', 1, 10)

  if (
    appearance === null ||
    nose === null ||
    palate === null ||
    finish === null ||
    value === null ||
    overall === null
  ) {
    return { error: 'Please provide valid ratings (1–5 for each category, 1–10 for overall).' }
  }

  const tastingNotesRaw = getTrimmedString(formData, 'tastingNotes')
  const foodPairingRaw = getTrimmedString(formData, 'foodPairing')
  const occasionRaw = getTrimmedString(formData, 'occasion')
  const tastingNotes = tastingNotesRaw.length > 0 ? tastingNotesRaw : null
  const foodPairing = foodPairingRaw.length > 0 ? foodPairingRaw : null
  const occasion = occasionRaw.length > 0 ? occasionRaw : null
  const wouldBuyAgain = formData.get('wouldBuyAgain') === 'on'

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
    console.error(`Failed to look up vintage "${vintageId}" for review save:`, vintageError)
    return { error: GENERIC_SAVE_ERROR }
  }

  if (!vintage) {
    return { error: 'This wine no longer exists.' }
  }

  // upsert rather than a separate select-then-insert-or-update: the
  // (wine_vintage_id, user_id) pair is unique per the "one review per user
  // per vintage" constraint referenced elsewhere in this codebase (see
  // app/(app)/wines/new/actions.ts), so this atomically creates a first
  // review or overwrites the signed-in user's existing one for this vintage
  // — never touches the other user's row, since user_id is always the
  // authenticated caller's own id, not client-supplied.
  const { error: upsertError } = await supabase.from('reviews').upsert(
    {
      wine_vintage_id: vintageId,
      user_id: user.id,
      appearance,
      nose,
      palate,
      finish,
      value,
      overall,
      tasting_notes: tastingNotes,
      food_pairing: foodPairing,
      occasion,
      would_buy_again: wouldBuyAgain,
    },
    { onConflict: 'wine_vintage_id,user_id' }
  )

  if (upsertError) {
    console.error(`Failed to save review for vintage "${vintageId}":`, upsertError)
    return { error: GENERIC_SAVE_ERROR }
  }

  redirect(`/wines/${vintageId}`)
}
