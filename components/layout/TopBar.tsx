'use client'

interface TopBarProps {
  currentPath: string
}

export function TopBar({ currentPath }: TopBarProps) {
  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'

    const titleMap: Record<string, string> = {
      dashboard: 'Dashboard',
      wines: 'Wines',
      map: 'Winery Map',
      about: 'About',
      new: 'Add Wine',
    }

    const lastSegment = segments[segments.length - 1]
    return titleMap[lastSegment] || 'Page'
  }

  return (
    <header className="hidden md:flex h-16 items-center border-b border-border bg-card px-6 gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        {getPageTitle(currentPath)}
      </h2>
    </header>
  )
}
