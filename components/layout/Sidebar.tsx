'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Wine,
  Map,
  Info,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  currentPath: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/wines', label: 'Wines', icon: Wine },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/about', label: 'About', icon: Info },
  ]

  const isActive = (href: string) => currentPath === href || currentPath.startsWith(href + '/')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth/signin')
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">DamnUncorked</h1>
          <p className="text-xs text-muted-foreground mt-1">Wine Logger</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setIsOpen(false)}>
              <Button
                variant={isActive(href) ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Footer — sign out */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
          <p className="mt-2 px-2 text-xs text-muted-foreground">v0.1.0</p>
        </div>
      </aside>
    </>
  )
}
