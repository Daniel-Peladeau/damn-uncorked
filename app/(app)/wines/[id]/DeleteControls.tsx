'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteReview, type DeleteActionState } from './actions'

const initialState: DeleteActionState = { error: null }

function DeleteSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <AlertDialogAction type="submit" disabled={pending} className={buttonVariants({ variant: 'destructive' })}>
      {pending ? 'Deleting…' : label}
    </AlertDialogAction>
  )
}

export function DeleteReviewButton({ vintageId, reviewId }: { vintageId: string; reviewId: string }) {
  const [state, formAction] = useActionState(deleteReview.bind(null, vintageId, reviewId), initialState)

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your rating and tasting notes for this wine. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={formAction}>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <DeleteSubmitButton label="Delete Review" />
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
    </div>
  )
}
