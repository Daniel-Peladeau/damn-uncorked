'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronsUpDown } from 'lucide-react'
import { AccountInitial, AccountMenuContent } from './AccountMenuContent'
import { aboutNavItem, isNavActive, primaryNavItems } from './nav-items'

interface SidebarProps {
  currentPath: string
  userEmail: string | null
}

const navItems = [...primaryNavItems, aboutNavItem]

// Desktop only — on mobile, BottomNav covers every destination.
export function Sidebar({ currentPath, userEmail }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">DamnUncorked</h1>
        <p className="text-xs text-muted-foreground mt-1">Wine Logger</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={isNavActive(currentPath, href) ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer — account menu */}
      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 px-2"
            >
              <AccountInitial userEmail={userEmail} />
              <span className="flex-1 truncate text-left text-sm">
                {userEmail ?? 'Account'}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <AccountMenuContent userEmail={userEmail} />
        </DropdownMenu>
        <p className="mt-2 px-2 text-xs text-muted-foreground">v0.1.0</p>
      </div>
    </aside>
  )
}
