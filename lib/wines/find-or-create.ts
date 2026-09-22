// Shared by the Add Wine and Edit Wine server actions — "find a row by
// name, else create it" for wineries/wines/grapes, plus the ILIKE-pattern
// escaping every one of those lookups needs.
import type { PostgrestError } from '@supabase/supabase-js'

// ilike() treats "%" and "_" as wildcards, and "\" as its escape character —
// escape backslashes first (so we don't double-escape the escapes we add),
// then the wildcard characters, so a name containing either is matched
// literally rather than as a pattern.
//
// KNOWN LIMITATION: PostgREST also does its own "*" -> "%" substitution on
// the raw pattern string, independently of (and before) Postgres's ILIKE
// backslash-escaping. So escaping "*" here doesn't help — escapeIlikePattern
// would turn "Cab*" into "Cab\*", PostgREST rewrites that to "Cab\%", and
// Postgres ILIKE then reads "\%" as an escaped literal "%", not the original
// "*". There's no way to preserve a literal "*" through `.ilike()` from the
// client side. Net effect: a name containing "*" will never match its own
// previously-inserted row on lookup, so it takes the "create" branch every
// time — a duplicate row, same low-severity failure mode as the accepted
// find-or-create race condition below, not a crash.
export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/[%_]/g, (match) => `\\${match}`)
}

export type FindOrCreateResult<Row extends { id: string }> =
  | { ok: true; row: Row; created: boolean }
  | { ok: false }

export type LookupResult<Row> = { data: Row | null; error: PostgrestError | null }

// The actual `.from(table)` calls stay at each call site (as callbacks)
// rather than being parameterized by table name here — postgrest-js's
// insert/select typing doesn't hold up well when the table name itself is a
// generic type parameter, so keeping the calls concrete keeps this fully
// typed without resorting to `any`/type overrides. `entityLabel`/`name` are
// only used for server-side log context.
//
// NOTE (accepted race condition): this is a select-then-insert, not an atomic
// upsert, so two near-simultaneous submissions for a brand-new name could
// both miss the lookup and insert duplicate rows. With only two users on this
// app that's unlikely enough to accept for now rather than adding an
// `.upsert()`/unique-constraint dependency we can't verify against the
// currently-paused database. Every lookup site uses `.limit(1)` so that, if
// a duplicate ever does exist, resolution degrades to "pick one" instead of
// `.maybeSingle()` hard-erroring on >1 rows and permanently breaking every
// future lookup for that name.
export async function findOrCreateByName<Row extends { id: string }>(
  entityLabel: string,
  name: string,
  lookup: () => PromiseLike<LookupResult<Row>>,
  create: () => PromiseLike<LookupResult<Row>>
): Promise<FindOrCreateResult<Row>> {
  const { data: existing, error: lookupError } = await lookup()

  if (lookupError) {
    console.error(`Failed to look up ${entityLabel} "${name}":`, lookupError)
    return { ok: false }
  }

  if (existing) {
    return { ok: true, row: existing, created: false }
  }

  const { data: created, error: insertError } = await create()

  if (insertError || !created) {
    console.error(`Failed to create ${entityLabel} "${name}":`, insertError)
    return { ok: false }
  }

  return { ok: true, row: created, created: true }
}
