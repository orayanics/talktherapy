import { useEffect, useEffectEvent, useState } from 'react'
import type { ComponentProps } from 'react'

type SearchInputProps = Pick<
  ComponentProps<'input'>,
  'id' | 'className' | 'placeholder'
> & {
  value: string
  onSearch: (value: string) => void
}

export default function SearchInput({
  value,
  onSearch,
  ...props
}: SearchInputProps) {
  const [input, setInput] = useState({ value, draft: value, submitted: value })
  const { draft, submitted } = input

  if (input.value !== value) {
    setInput({
      value,
      // A route update for the last search can arrive during the next edit.
      draft: value === submitted ? draft : value,
      submitted: value,
    })
  }

  const submitSearch = useEffectEvent((next: string) => {
    setInput((current) => ({ ...current, submitted: next }))
    onSearch(next)
  })

  useEffect(() => {
    if (draft === submitted) return
    const timer = setTimeout(() => submitSearch(draft), 300)
    return () => clearTimeout(timer)
  }, [draft, submitted])

  return (
    <input
      {...props}
      type="search"
      value={draft}
      onChange={(event) => {
        const next = event.currentTarget.value
        setInput((current) => ({ ...current, draft: next }))
      }}
    />
  )
}
