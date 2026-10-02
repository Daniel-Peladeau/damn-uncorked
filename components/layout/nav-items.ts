import { LayoutDashboard, Wine, Map, Info, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

// Shared by the desktop Sidebar and the mobile BottomNav so the two can't drift.
export const primaryNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wines', label: 'Wines', icon: Wine },
  { href: '/map', label: 'Map', icon: Map },
]

export const aboutNavItem: NavItem = { href: '/about', label: 'About', icon: Info }

export const addWineHref = '/wines/new'

export function isNavActive(currentPath: string, href: string): boolean {
  return currentPath === href || currentPath.startsWith(href + '/')
}
