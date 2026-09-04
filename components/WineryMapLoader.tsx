'use client'

import dynamic from 'next/dynamic'
import type { WineryPin } from '@/lib/supabase/wineries'

// Leaflet touches `window` at import time, so it can only ever run
// client-side — `ssr: false` is only valid from within a Client Component,
// which is why this thin wrapper exists separately from the map page itself.
const WineryMap = dynamic(() => import('@/components/WineryMap').then((mod) => mod.WineryMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-lg bg-secondary/20">
      <p className="text-muted-foreground">Loading map…</p>
    </div>
  ),
})

export function WineryMapLoader({ wineries }: { wineries: WineryPin[] }) {
  return <WineryMap wineries={wineries} />
}
