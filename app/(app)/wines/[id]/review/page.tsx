import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReviewForm } from './ReviewForm'

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // proxy.ts already gates this route to signed-in users; this is defense
  // in depth (and keeps `user.id` below non-nullable without a cast).
  if (!user) {
    notFound()
  }

  const { data: vintage, error: vintageError } = await supabase
    .from('wine_vintages')
    .select('id, vintage_year, wines ( name )')
    .eq('id', id)
    .maybeSingle()

  if (vintageError) {
    console.error(`Failed to load wine vintage "${id}" for review form:`, vintageError)
    throw new Error('Failed to load wine details.')
  }

  if (!vintage || !vintage.wines) {
    notFound()
  }

  const { data: existingReview, error: reviewError } = await supabase
    .from('reviews')
    .select('appearance, nose, palate, finish, value, overall, tasting_notes, food_pairing, occasion, would_buy_again')
    .eq('wine_vintage_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (reviewError) {
    console.error(`Failed to load existing review for vintage "${id}":`, reviewError)
    throw new Error('Failed to load your review.')
  }

  return (
    <ReviewForm
      vintageId={id}
      wineName={vintage.wines.name}
      vintageYear={vintage.vintage_year}
      existingReview={existingReview}
    />
  )
}
