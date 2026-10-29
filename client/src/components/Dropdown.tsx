import { useEffect, useRef } from 'react'

interface DropdownProps {
  label?: string
  onClick?: () => void
  children?: React.ReactNode
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
  }, [dropdownRef])

  return (
    <details
      ref={dropdownRef}
      className={`dropdown ${position || 'dropdown-end'}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          dropdownRef.current?.removeAttribute('open')
          dropdownRef.current?.querySelector('summary')?.focus()
        }
      }}
    >
      <summary
        aria-haspopup="menu"
        className={`btn ${btnClassName || ''}`}
        onClick={onClick}
      >
        {label || 'Select Option'}
      </summary>
      <ul
        className={`mt-2 dropdown-content menu bg-white rounded-lg z-50 p-2 shadow-md border border-slate ${className || ''}`}
        onClick={(event) => {
          const option = (event.target as HTMLElement).closest(
            'a, button, [role="menuitem"]',
          )
          if (option && !option.hasAttribute('disabled')) {
            dropdownRef.current?.removeAttribute('open')
          }
        }}
      >
        {children}
      </ul>
    </details>
  )
}
