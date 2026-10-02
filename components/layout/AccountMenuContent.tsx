'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { ThemeMenu } from '@/components/layout/ThemeMenu'

interface AccountMenuContentProps {
  userEmail: string | null
  side?: 'top' | 'bottom'
  align?: 'start' | 'end'
  // Extra items rendered between the email label and the theme picker.
  children?: React.ReactNode
}

export function AccountInitial({ userEmail }: { userEmail: string | null }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {userEmail ? userEmail[0].toUpperCase() : '?'}
    </span>
  )
}

export function AccountMenuContent({ userEmail, side, align = 'start', children }: AccountMenuContentProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth/signin')
  }

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
      <DropdownMenuItem onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
