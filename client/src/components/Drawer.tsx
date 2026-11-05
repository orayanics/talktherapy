import { useId } from 'react'
import type { ComponentProps, ReactNode, Ref } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  label: string
  title?: ReactNode
  closeButtonRef?: Ref<HTMLButtonElement>
  headerClassName?: string
  children: ReactNode
  content?: ReactNode
  position?: 'start' | 'end'
  className?: string
  contentClassName?: string
  sideClassName?: string
  panelClassName?: string
  panelProps?: ComponentProps<'aside'>
  hideHeader?: boolean
}

export default function Drawer({
  isOpen,
  onClose,
  label,
  title = label,
  closeButtonRef,
  headerClassName = '',
  children,
  content,
  position = 'end',
  className = '',
  contentClassName = '',
  sideClassName = 'z-40',
  panelClassName = 'min-h-full w-100 max-w-full bg-base-100 text-base-content',
  panelProps,
  hideHeader = false,
}: DrawerProps) {
  const id = useId()

  return (
    <div
      className={`drawer ${position === 'end' ? 'drawer-end' : ''} ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        readOnly
      />
      <div className={`drawer-content ${contentClassName}`}>{content}</div>
      <div
        className={`drawer-side ${sideClassName}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && isOpen) onClose()
        }}
      >
        <label
          htmlFor={id}
          aria-label={`Close ${label}`}
          className="drawer-overlay pointer-events-auto"
          onClick={onClose}
        />
        <aside aria-label={label} {...panelProps} className={panelClassName}>
          {!hideHeader && (
            <div
              className={`flex shrink-0 items-center justify-between gap-4 border-b border-border p-6 ${headerClassName}`}
            >
              <p className="my-0! min-w-0 font-medium">{title}</p>
              <button
                ref={closeButtonRef}
                type="button"
                className="btn btn-xs btn-square btn-neutral"
                aria-label={`Close ${label}`}
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {children}
        </aside>
      </div>
    </div>
  )
}
