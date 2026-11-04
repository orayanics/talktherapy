import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface DropdownProps {
  label?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
  btnClassName?: string
  position?: string
}

export default function Dropdown(props: DropdownProps) {
  const { label, onClick, children, className, btnClassName, position } = props
  const dropdownRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dropdownRef.current.removeAttribute('open')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <details
      ref={dropdownRef}
      className={`shrink-0 dropdown ${position || 'dropdown-end'}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          dropdownRef.current?.removeAttribute('open')
          dropdownRef.current?.querySelector('summary')?.focus()
        }
      }}
    >
      <summary
        className={`whitespace-nowrap btn ${btnClassName || ''}`}
        onClick={onClick}
      >
        {label ?? 'Select Option'}
      </summary>
      <ul
        className={`border border-border! dropdown-content menu bg-base-200 text-base-content rounded-box z-50 mt-0 w-52 p-2 shadow-sm ${className || ''}`}
        onClick={(event) => {
          const option = (event.target as HTMLElement).closest(
            'a, button, [role="menuitem"]',
          )
          if (
            option &&
            !option.hasAttribute('disabled') &&
            option.getAttribute('aria-disabled') !== 'true'
          ) {
            dropdownRef.current?.removeAttribute('open')
            dropdownRef.current?.querySelector('summary')?.focus()
          }
        }}
      >
        {children}
      </ul>
    </details>
  )
}
