import { RATING_CATEGORIES, average, type Review } from './rating'

interface Reviewer {
  name: string
  review: Review
}

const ROWS = [
  ...RATING_CATEGORIES.map(({ label, key }) => ({ label, key, max: 5 })),
  { label: 'Overall', key: 'overall' as const, max: 10 },
]

const position = (value: number, max: number) => `${((value - 1) / (max - 1)) * 100}%`

// Combined score is computed, not stored (per CLAUDE.md). The two reviewers
// are told apart by marker shape (filled dot vs ring) and a legend, never by
// colour, and each row has a text equivalent for screen readers.
export function ReviewComparison({ first, second }: { first: Reviewer; second: Reviewer }) {
  const overalls = [first.review.overall, second.review.overall].filter((v): v is number => v != null)
  const combinedOverall = overalls.length > 0 ? average(overalls) : null

  return (
    <section className="rounded-lg border border-border bg-card p-6" aria-labelledby="side-by-side">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="side-by-side" className="text-lg font-semibold text-foreground">
            Side by side
          </h2>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-heading text-4xl leading-none text-gold tabular-nums">
              {combinedOverall ?? '—'}
            </span>
            <span className="text-sm text-muted-foreground">/10 combined</span>
          </p>
        </div>
        <ul aria-hidden="true" className="flex gap-4 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-gold" />
            {first.name}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-full border-2 border-gold" />
            {second.name}
          </li>
        </ul>
      </div>

      <ul className="space-y-4">
        {ROWS.map(({ label, key, max }) => {
          const a = first.review[key]
          const b = second.review[key]
          const present = [a, b].filter((v): v is number => v != null)
          const avg = present.length > 0 ? average(present) : null
          const spoken = `${label}: ${first.name} ${a ?? 'not rated'}, ${second.name} ${b ?? 'not rated'}${
            avg != null ? `, average ${avg} of ${max}` : ''
          }`

          return (
            <li key={key} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3">
              <span className="sr-only">{spoken}</span>
              <span aria-hidden="true" className="text-sm text-muted-foreground">
                {label}
              </span>
              <div aria-hidden="true" className="relative mx-2 h-5">
                <span className="absolute inset-x-0 top-1/2 h-px bg-input" />
                {a != null && b != null && (
                  <span
                    className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gold"
                    style={{ left: position(Math.min(a, b), max), right: `calc(100% - ${position(Math.max(a, b), max)})` }}
                  />
                )}
                {avg != null && (
                  <span
                    className="absolute top-0 h-5 w-px -translate-x-1/2 bg-foreground"
                    style={{ left: position(avg, max) }}
                  />
                )}
                {b != null && (
                  <span
                    className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-card"
                    style={{ left: position(b, max) }}
                  />
                )}
                {a != null && (
                  <span
                    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
                    style={{ left: position(a, max) }}
                  />
                )}
              </div>
              <span aria-hidden="true" className="text-right text-sm text-foreground tabular-nums">
                {avg ?? '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
