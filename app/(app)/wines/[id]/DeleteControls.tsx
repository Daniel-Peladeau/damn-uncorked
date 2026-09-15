'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Trash2 } from 'lucide-react'
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
import { deleteReview, deleteWine, type DeleteActionState } from './actions'

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

export function DeleteWineButton({ vintageId, wineName }: { vintageId: string; wineName: string }) {
  const [state, formAction] = useActionState(deleteWine.bind(null, vintageId), initialState)

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete Wine
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {wineName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes this wine and both your and the other reviewer&apos;s reviews of it. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={formAction}>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <DeleteSubmitButton label="Delete Wine" />
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
    </div>
  )
}
