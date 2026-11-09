// Server-side error logging that keeps user content out of the Vercel
// runtime logs. Call sites pass record ids, entity labels, or HTTP statuses as
// context, never user-typed text (wine/winery/grape names, search queries,
// tasting notes) or user ids.
//
// Database errors are the main reason this exists: Postgres puts the failing
// row's values in `details` (a check-constraint violation on `reviews` logs
// "Failing row contains (...)", which includes the user's id and tasting
// notes) and a unique violation echoes the conflicting key there too. Only the
// error code and message are kept, which name the constraint or column but
// not the row's contents.

type LogContext = Record<string, string | number | boolean | null | undefined>

type CauseSummary = { name: string; message: string; code?: string }

type ErrorSummary =
  | { code: string; message: string }
  | { name: string; message: string; stack?: string; cause?: CauseSummary }
  | { type: string }

function isDatabaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  )
}

// Node's fetch() throws a bare "fetch failed" TypeError and puts the real
// reason (ENOTFOUND, ECONNRESET, a connect timeout) only in `cause`. Those
// messages name the host and errno, not the request's query string.
function summarizeCause(cause: unknown): CauseSummary | undefined {
  if (!(cause instanceof Error)) return undefined
  const code = 'code' in cause && typeof cause.code === 'string' ? cause.code : undefined
  return { name: cause.name, message: cause.message, code }
}

function summarizeError(error: unknown): ErrorSummary {
  // Checked before `instanceof Error`: postgrest-js 2.x's PostgrestError
  // extends Error, and logging it whole would print its `details` property.
  if (isDatabaseError(error)) {
    return { code: error.code, message: error.message }
  }
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack, cause: summarizeCause(error.cause) }
  }
  return { type: typeof error }
}

// Context goes in as an object rather than interpolated into the message, so
// a URL-supplied id containing a newline can't forge an extra log line.
export function logError(message: string, error?: unknown, context: LogContext = {}): void {
  if (error === undefined) {
    console.error(message, context)
    return
  }
  console.error(message, { ...context, error: summarizeError(error) })
}
