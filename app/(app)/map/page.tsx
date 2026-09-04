import { PageHeader } from '@/components/PageHeader'

export default function MapPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Winery Map"
        description="Explore your wineries geographically"
      />

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Map Coming Soon
        </h2>
        <p className="text-muted-foreground mb-6">
          This is a placeholder for the winery map feature. Soon you&apos;ll be able
          to see all your logged wineries plotted on an interactive map.
        </p>
        <div className="h-96 rounded-lg bg-secondary/20 flex items-center justify-center">
          <p className="text-muted-foreground">
            Map will be displayed here using Leaflet + OpenStreetMap
          </p>
        </div>
      </div>
    </div>
  )
}
