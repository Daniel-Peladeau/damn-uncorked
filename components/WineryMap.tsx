'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import type { WineryPin } from '@/lib/supabase/wineries'

// Leaflet's default marker icon references image paths that don't survive
// bundling — point it at the same CDN the package itself ships images from.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export function WineryMap({ wineries }: { wineries: WineryPin[] }) {
  const bounds = wineries.map((winery): [number, number] => [winery.lat, winery.lng])

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40], maxZoom: 14 }}
      scrollWheelZoom={false}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {wineries.map((winery) => (
        <Marker key={winery.id} position={[winery.lat, winery.lng]} icon={markerIcon}>
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
                      <Link href={`/wines/${wine.vintageId}`} className="text-primary underline">
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
