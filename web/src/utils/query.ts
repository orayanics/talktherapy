export function normalizeSearchArray(
  value: string | Array<string> | unknown,
): Array<string> {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value]
  }
  return []
}
