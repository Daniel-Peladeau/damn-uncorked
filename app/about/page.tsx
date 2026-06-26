'use client'

import { PageHeader } from '@/components/PageHeader'

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="About DamnUncorked"
        description="Your personal wine logger"
      />

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            What is DamnUncorked?
          </h2>
          <p>
            DamnUncorked is a personal wine logging and rating platform
            designed for serious wine enthusiasts. Track your wine discoveries,
            rate your tasting experiences, and build a comprehensive collection
            of your favorite bottles.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Our Focus
          </h2>
          <p>
            We specialize in whites, rosés, and sparkling wines—though all
            varieties are welcome. Whether you're exploring a Sauvignon Blanc
            from New Zealand, a Prosecco from Italy, or a Champagne from
            France, log every bottle and remember what you loved.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            How to Use
          </h2>
          <ul className="list-inside space-y-2">
            <li>
              <strong>Dashboard:</strong> See your top-rated wines and quick
              stats at a glance
            </li>
            <li>
              <strong>Add Wine:</strong> Log a new wine with full details—winery,
              region, grapes, vintage, and your tasting notes
            </li>
            <li>
              <strong>Rate:</strong> Score each wine across appearance, nose,
              palate, finish, value, and an overall rating
            </li>
            <li>
              <strong>Explore:</strong> View your full collection and revisit
              wines you've logged
            </li>
            <li>
              <strong>Map:</strong> See all your wineries plotted
              geographically
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Rating Criteria
          </h2>
          <p className="mb-4">Each wine is rated across five dimensions:</p>
          <ul className="list-inside space-y-2">
            <li>
              <strong>Appearance (1–5):</strong> Color clarity and hue
            </li>
            <li>
              <strong>Nose (1–5):</strong> Aroma and bouquet
            </li>
            <li>
              <strong>Palate (1–5):</strong> Flavor and taste profile
            </li>
            <li>
              <strong>Finish (1–5):</strong> Aftertaste and length
            </li>
            <li>
              <strong>Value (1–5):</strong> Price-to-quality ratio
            </li>
            <li>
              <strong>Overall (1–10):</strong> Your final verdict
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Privacy</h2>
          <p>
            Your wine collection is private. All data is stored securely and
            only you can access your logged wines and ratings.
          </p>
        </div>
      </div>
    </div>
  )
}
