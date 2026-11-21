'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ratingWord } from '@/components/rating-scale'

// One native radio per value, visually hidden: the form still submits
// `name=<n>` exactly like the old <Select>, `required` still blocks an empty
// submit, and arrow keys move between values for free. State is shown by the
// underline's thickness and the numeral's weight, not by hue alone.
export function RatingPips({
  name,
  label,
  max,
  defaultValue,
}: {
  name: string
  label: string
  max: 5 | 10
  defaultValue?: number | null
}) {
  const [value, setValue] = useState<number | null>(defaultValue ?? null)
  const values = Array.from({ length: max }, (_, i) => i + 1)

  // Phones: label and word share the first row, cells get the full width
  // below. sm+: one row of label | cells | word.
  return (
    <fieldset className="grid grid-cols-[1fr_auto] items-end gap-x-4 sm:grid-cols-[6.5rem_1fr_5.5rem]">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="pt-2 text-sm font-medium text-foreground sm:pt-0 sm:pb-2">
        {label}
      </span>

      <div className={cn('col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1', max === 10 ? 'grid grid-cols-5 gap-y-2 sm:flex' : 'flex')}>
        {values.map((n) => {
          const filled = value != null && n <= value
          return (
            <label
              key={n}
              className="relative flex min-h-10 min-w-8 flex-1 cursor-pointer items-end justify-center rounded-sm pb-2 outline-offset-2 has-[:focus-visible]:outline-2"
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => setValue(n)}
                required
                aria-label={max === 5 ? `${n} of 5, ${ratingWord(n, 5)}` : `${n} of ${max}`}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'text-sm tabular-nums',
                  value === n ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {n}
              </span>
              <span
                aria-hidden="true"
                className={cn('absolute inset-x-0.5 bottom-0', filled ? 'h-[3px] bg-gold' : 'h-px bg-input')}
              />
            </label>
          )
        })}
      </div>

      <span aria-hidden="true" className="col-start-2 row-start-1 pt-2 text-right text-xs text-muted-foreground sm:col-start-3 sm:pt-0 sm:pb-2 sm:text-left">
        {ratingWord(value, max)}
      </span>
    </fieldset>
  )
}
