'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { AccountInitial, AccountMenuContent } from './AccountMenuContent'
import { aboutNavItem, addWineHref, isNavActive, primaryNavItems, type NavItem } from './nav-items'

interface BottomNavProps {
  currentPath: string
  userEmail: string | null
}

// Every icon sits in the same fixed-height slot so labels share a baseline
// even though Add's circle and the account initial are taller than icons.
const iconSlotClass = 'flex h-9 items-center justify-center'

const tabClass =
  'flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring'

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(tabClass, active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
    >
      <span className={iconSlotClass}>
        <Icon className="h-5 w-5" />
      </span>
      {item.label}
    </Link>
  )
}

// Mobile only (below md). Fixed to the bottom so logging a bottle is one thumb tap away.
export function BottomNav({ currentPath, userEmail }: BottomNavProps) {
  const [dashboard, wines, map] = primaryNavItems
  const addActive = isNavActive(currentPath, addWineHref)
  const AboutIcon = aboutNavItem.icon

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] md:hidden"
    >
      <div className="flex h-16 items-stretch px-1">
        <NavTab item={dashboard} active={isNavActive(currentPath, dashboard.href)} />
        {/* /wines/new also starts with /wines — highlight Add, not Wines, there. */}
        <NavTab item={wines} active={!addActive && isNavActive(currentPath, wines.href)} />

        <Link
          href={addWineHref}
          aria-current={addActive ? 'page' : undefined}
          className={cn(tabClass, addActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Plus className="h-5 w-5" />
          </span>
          Add
        </Link>

        <NavTab item={map} active={isNavActive(currentPath, map.href)} />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              tabClass,
              isNavActive(currentPath, aboutNavItem.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className={iconSlotClass}>
              <AccountInitial userEmail={userEmail} />
            </span>
            Account
          </DropdownMenuTrigger>
          <AccountMenuContent userEmail={userEmail} side="top" align="end">
            <DropdownMenuItem asChild>
              <Link href={aboutNavItem.href}>
                <AboutIcon className="mr-2 h-4 w-4" />
                {aboutNavItem.label}
              </Link>
            </DropdownMenuItem>
          </AccountMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
