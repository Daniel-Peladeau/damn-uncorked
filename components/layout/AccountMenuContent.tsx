'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ThemeMenu } from '@/components/layout/ThemeMenu'
import { useSignOut } from './use-sign-out'
import { profileNavItem } from './nav-items'
import { initialOf } from '@/lib/profiles/display-name'

interface AccountMenuContentProps {
  userEmail: string | null
  side?: 'top' | 'bottom'
  align?: 'start' | 'end'
  // Extra items rendered between the email label and the theme picker.
  children?: React.ReactNode
}

export function AccountInitial({ name }: { name: string | null }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {initialOf(name)}
    </span>
  )
}

export function AccountMenuContent({ userEmail, side, align = 'start', children }: AccountMenuContentProps) {
  const signOut = useSignOut()
  const ProfileIcon = profileNavItem.icon

  return (
    <DropdownMenuContent side={side} align={align} className="w-56">
      {userEmail && (
        <>
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
            {userEmail}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
        </>
      )}
      {children && (
        <>
          {children}
          <DropdownMenuSeparator />
        </>
      )}
      <ThemeMenu />
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href={profileNavItem.href}>
          <ProfileIcon className="mr-2 h-4 w-4" />
          {profileNavItem.label}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
