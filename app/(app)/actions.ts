'use server'

import { getWineIndex, type WineIndexEntry } from '@/lib/supabase/wine-index'
import { logError } from '@/lib/log'

// Called from the client-side CommandPalette when it opens. Runs with the
// signed-in user's session through the server Supabase client, so RLS applies.
export async function loadWineIndex(): Promise<WineIndexEntry[]> {
  try {
    return await getWineIndex()
  } catch (error) {
    logError('loadWineIndex failed', error)
    throw new Error('Could not load wines')
  }
}
