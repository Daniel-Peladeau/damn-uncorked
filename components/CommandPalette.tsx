'use client'

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Wine as WineIcon } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { aboutNavItem, addWineHref, primaryNavItems } from '@/components/layout/nav-items'
import { useSignOut } from '@/components/layout/use-sign-out'
import { loadWineIndex } from '@/app/(app)/actions'
import type { WineIndexEntry } from '@/lib/supabase/wine-index'
import { foldDiacritics } from '@/lib/utils'
import { useRestoreFocus } from '@/components/use-restore-focus'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const pages = [...primaryNavItems, aboutNavItem]

function normalize(value: string) {
  return foldDiacritics(value.toLowerCase())
}

// Every typed word must appear somewhere in the item's keywords, ignoring case
// and accents, so "kim 2022" and "rose" (→ rosé) behave like the wine list
// search. cmdk's default scorer matches scattered letters, which is noisy
// against wine names. `value` is ignored because wine items use their id.
function filterItems(_value: string, search: string, keywords?: string[]) {
  const haystack = normalize((keywords ?? []).join(' '))
  const words = normalize(search).split(/\s+/).filter(Boolean)
  return words.every((word) => haystack.includes(word)) ? 1 : 0
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const signOut = useSignOut()
  const [wines, setWines] = useState<WineIndexEntry[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  useRestoreFocus(open)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange((isOpen) => !isOpen)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange])

  // Refetch on every open (the previous list stays visible meanwhile) so a
  // bottle logged since the last open shows up without a page reload.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    loadWineIndex()
      .then((list) => {
        if (cancelled) return
        setWines(list)
        setLoadFailed(false)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  function run(action: () => void) {
    onOpenChange(false)
    action()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Jump to a page or a wine"
    >
      <Command filter={filterItems}>
        <CommandInput placeholder="Search pages and wines…" />
        <CommandList className="max-h-[min(24rem,60dvh)]">
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pages.map(({ href, label, icon: Icon }) => (
              <CommandItem key={href} value={href} keywords={[label]} onSelect={() => run(() => router.push(href))}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Wines">
            {wines?.map((wine) => {
              const detail = [wine.winery, wine.vintage].filter(Boolean).join(' · ')
              return (
                <CommandItem
                  key={wine.id}
                  value={wine.id}
                  keywords={[wine.name, wine.winery, String(wine.vintage ?? ''), wine.type]}
                  onSelect={() => run(() => router.push(`/wines/${wine.id}`))}
                >
                  <WineIcon />
                  <span className="min-w-0 flex-1 truncate">
                    {wine.name}
                    {detail && <span className="text-muted-foreground"> — {detail}</span>}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">{wine.type}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
          {wines === null && !loadFailed && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Loading wines…</p>
          )}
          {loadFailed && <p className="px-3 py-2 text-sm text-destructive">Couldn&apos;t load wines.</p>}

          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="add-wine" keywords={['Add wine', 'new', 'log']} onSelect={() => run(() => router.push(addWineHref))}>
              <Plus />
              Add wine
            </CommandItem>
            <CommandItem value="sign-out" keywords={['Sign out', 'log out']} onSelect={() => run(() => void signOut())}>
              <LogOut />
              Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
