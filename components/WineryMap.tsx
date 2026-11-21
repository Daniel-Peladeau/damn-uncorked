'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import type { WineryPin } from '@/lib/supabase/wineries'

// Lucide's `Wine` icon (ISC, lucide-react 1.21.0) as a plain SVG string:
// Leaflet's divIcon takes HTML, and rendering the React component to a string
// would pull react-dom/server into the map chunk for one static icon.
const WINE_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/>' +
  '<path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>'

// A gold "wax seal" built from theme tokens (styled in globals.css) instead of
// Leaflet's blue PNG pin, so markers follow light/dark mode and no marker
// images load from a CDN.
const markerIcon = L.divIcon({
  className: 'winery-marker',
  html: WINE_ICON_SVG,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
})

export function WineryMap({ wineries }: { wineries: WineryPin[] }) {
  const bounds = wineries.map((winery): [number, number] => [winery.lat, winery.lng])

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40], maxZoom: 14 }}
      scrollWheelZoom={false}
      // isolate contains Leaflet's internal z-indexes (400–1000) so map panes
      // and controls can't paint over the fixed BottomNav or dropdown menus.
      className="isolate h-96 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {wineries.map((winery) => (
        <Marker key={winery.id} position={[winery.lat, winery.lng]} icon={markerIcon} title={winery.name}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{winery.name}</p>
              {(winery.region || winery.country) && (
                <p className="text-sm text-muted-foreground">
                  {[winery.region, winery.country].filter(Boolean).join(', ')}
                </p>
              )}
              {winery.wines.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {winery.wines.map((wine) => (
                    <li key={wine.vintageId}>
                      <Link href={`/wines/${wine.vintageId}`} className="text-gold-text underline">
                        {wine.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
