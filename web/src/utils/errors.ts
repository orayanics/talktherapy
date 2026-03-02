import type { ParsedError } from '~/models/system'

/**
 * Normalizes API error responses into a consistent ParsedError shape.
 * Handles:
 *   - { message: string }
 *   - { message: string, errors: Record<string, string[]> }
 *   - Eden/Elysia wrapped responses: { message: { response: string } }
 */
export function parseError(raw: unknown): ParsedError | null {
  if (!raw || typeof raw !== 'object') return null

  const err = raw as Record<string, unknown>

  const message =
    typeof err.message === 'string'
      ? err.message
      : typeof err.message === 'object' &&
          err.message !== null &&
          'response' in err.message
        ? String((err.message as Record<string, unknown>).response)
        : null

  if (!message) return null

  const errors =
    err.errors && typeof err.errors === 'object' && !Array.isArray(err.errors)
      ? (err.errors as Record<string, Array<string>>)
      : undefined

  return { message, errors }
}

/** Returns the first error string for a given field, or undefined. */
export function fieldError(
  parsed: ParsedError | null,
  field: string,
): string | undefined {
  return parsed?.errors?.[field]?.[0]
}

/** True when there is a top-level message but no per-field errors. */
export function hasOnlyMessage(parsed: ParsedError | null): boolean {
  return !!parsed?.message && !parsed.errors
}
