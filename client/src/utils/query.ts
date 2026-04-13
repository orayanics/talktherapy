import qs from 'qs'

export const toArray = (value: unknown): Array<string> => {
  const parsed = qs.parse(
    qs.stringify({ value }, { arrayFormat: 'repeat' }),
  ).value

  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item)).filter(Boolean)
  }

  if (parsed === undefined) {
    return []
  }

  return [String(parsed)].filter(Boolean)
}
