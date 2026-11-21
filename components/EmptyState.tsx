import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

// Empty screens say what's missing, why, and what to do next (NN/g), in the
// same dashed "label frame" as the waiting-for-a-review card.
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  headingLevel: Heading = 'h2',
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
  action?: ReactNode
  headingLevel?: 'h2' | 'h3'
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full border border-gold text-gold">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <Heading className="mb-2 text-xl font-medium text-foreground">{title}</Heading>
      <p className="max-w-sm text-muted-foreground">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
