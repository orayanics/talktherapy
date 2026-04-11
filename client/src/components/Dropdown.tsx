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
    <>
      <details
        ref={dropdownRef}
        className={`dropdown ${position || 'dropdown-end'}`}
      >
        <summary
          role="button"
          className={`btn ${btnClassName || ''}`}
          onClick={onClick}
        >
          {label || 'Select Option'}
        </summary>
        <ul
          className={`mt-2 dropdown-content menu bg-white rounded-lg z-1 p-2 shadow-md border border-slate ${className}`}
        >
          {children}
        </ul>
      </details>
    </>
  )
}
