import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Strips diacritics (é → e, ü → u, etc.) so a plain-ASCII search like "rose"
// or "gewurztraminer" matches "rosé"/"Gewürztraminer" — the far more common
// way people actually type, especially on a phone keyboard.
export function foldDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
