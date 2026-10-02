'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

// Radix only restores focus to a <DialogTrigger>. For dialogs opened some other
// way (a keyboard shortcut, a button elsewhere), remember what had focus when
// `open` turned true and put it back when it turns false.
export function useRestoreFocus(open: boolean): void {
  const returnFocusRef = useRef<HTMLElement | null>(null)

  // Layout effect: capture before Radix's (passive) effect moves focus into the dialog.
  useLayoutEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    }
  }, [open])

  // Passive effect: restore only after Radix's child effect has released the
  // focus trap — restoring earlier gets pulled straight back into the dialog.
  useEffect(() => {
    if (!open && returnFocusRef.current) {
      returnFocusRef.current.focus()
      returnFocusRef.current = null
    }
  }, [open])
}
