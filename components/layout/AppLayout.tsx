'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { BreadcrumbLabelsProvider } from './BreadcrumbLabels'

interface AppLayoutProps {
  children: React.ReactNode
  userEmail: string | null
}

export function AppLayout({ children, userEmail }: AppLayoutProps) {
  const pathname = usePathname()

  return (
    <BreadcrumbLabelsProvider>
      {/* viewport-fit=cover (app/layout.tsx) lets the page run under a landscape notch */}
      <div className="flex h-dvh bg-background pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Sidebar */}
        <Sidebar currentPath={pathname} userEmail={userEmail} />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <TopBar currentPath={pathname} />

          {/* Scrollable content — bottom padding on mobile clears the fixed BottomNav */}
          <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>

        <BottomNav currentPath={pathname} userEmail={userEmail} />
      </div>
    </BreadcrumbLabelsProvider>
  )
}
