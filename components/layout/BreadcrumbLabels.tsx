'use client'

import { createContext, useContext, useLayoutEffect, useState } from 'react'

// href → human label for path segments the TopBar can't name on its own
// (e.g. `/wines/<uuid>` → "Sauvignon Blanc 2023"). Pages already have this
// data loaded, so they register it here rather than the TopBar re-fetching it.
type Labels = Record<string, string>

const LabelsContext = createContext<Labels>({})
const SetLabelsContext = createContext<React.Dispatch<React.SetStateAction<Labels>>>(() => {})

export function BreadcrumbLabelsProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = useState<Labels>({})

  return (
    <LabelsContext.Provider value={labels}>
      <SetLabelsContext.Provider value={setLabels}>{children}</SetLabelsContext.Provider>
    </LabelsContext.Provider>
  )
}

export function useBreadcrumbLabels() {
  return useContext(LabelsContext)
}

// Labels are intentionally kept after unmount: they're only read for a
// matching href, and keeping them means the trail doesn't flash back to the
// generic fallback while the next route's loading.tsx is showing. Growth is
// bounded by the wines visited in one session.
export function BreadcrumbLabel({ href, label }: { href: string; label: string }) {
  const setLabels = useContext(SetLabelsContext)

  // Layout effect so client-side navigations paint with the label already
  // in place, rather than one frame of the fallback first.
  useLayoutEffect(() => {
    setLabels((prev) => (prev[href] === label ? prev : { ...prev, [href]: label }))
  }, [href, label, setLabels])

  return null
}

// Shared by the wine detail, review and edit pages so the `/wines/[id]`
// crumb reads the same on all three.
export function WineBreadcrumbLabel({
  vintageId,
  name,
  vintageYear,
}: {
  vintageId: string
  name: string
  vintageYear: number | null
}) {
  return <BreadcrumbLabel href={`/wines/${vintageId}`} label={vintageYear ? `${name} ${vintageYear}` : name} />
}
