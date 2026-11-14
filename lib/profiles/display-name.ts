// Mirrors the profiles.display_name check constraint (trimmed, 1–50 chars)
// so the form can reject a bad name before it reaches the database.
export const DISPLAY_NAME_MAX_LENGTH = 50

export function validateDisplayName(raw: unknown): { value: string } | { error: string } {
  if (typeof raw !== 'string') return { error: 'Display name is required.' }
  const value = raw.trim()
  if (value.length === 0) return { error: 'Display name is required.' }
  if (value.length > DISPLAY_NAME_MAX_LENGTH) {
    return { error: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.` }
  }
  return { value }
}

// Used when a user has no profile row yet (e.g. the callback's insert failed):
// the email's local-part is better than showing the full address.
export function fallbackDisplayName(email: string | null | undefined): string | null {
  if (!email) return null
  return email.split('@')[0].slice(0, DISPLAY_NAME_MAX_LENGTH) || null
}

export function initialOf(name: string | null | undefined): string {
  const first = name?.trim().charAt(0)
  return first ? first.toUpperCase() : '?'
}
