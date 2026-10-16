import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

type ReviewNotesDefaults = {
  tasting_notes?: string | null
  food_pairing?: string | null
  occasion?: string | null
  would_buy_again?: boolean | null
}

// The free-text review fields and the "would buy again" checkbox, shared by
// the Add Wine form and the review form. Field names match what
// lib/reviews/validation.ts's parseReviewFields reads. Only the review form
// shows Occasion today.
export function ReviewNotesFields({
  defaults,
  showOccasion = false,
}: {
  defaults?: ReviewNotesDefaults | null
  showOccasion?: boolean
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="tastingNotes">Tasting Notes</Label>
        <Textarea
          id="tastingNotes"
          name="tastingNotes"
          placeholder="Describe the wine's characteristics, flavors, aromas..."
          rows={4}
          defaultValue={defaults?.tasting_notes ?? ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="foodPairing">Food Pairing</Label>
        <Input
          id="foodPairing"
          name="foodPairing"
          placeholder="e.g., Seafood, light salads"
          defaultValue={defaults?.food_pairing ?? ''}
        />
      </div>

      {showOccasion && (
        <div className="space-y-2">
          <Label htmlFor="occasion">Occasion</Label>
          <Input
            id="occasion"
            name="occasion"
            placeholder="e.g., Anniversary dinner"
            defaultValue={defaults?.occasion ?? ''}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox id="wouldBuyAgain" name="wouldBuyAgain" defaultChecked={defaults?.would_buy_again ?? false} />
        <Label htmlFor="wouldBuyAgain" className="cursor-pointer font-normal">
          Would buy again
        </Label>
      </div>
    </>
  )
}
