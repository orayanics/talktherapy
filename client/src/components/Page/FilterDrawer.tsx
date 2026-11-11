import { useState } from 'react'
import type { ReactNode } from 'react'
import { Filter } from 'lucide-react'
import Drawer from '#/components/Drawer'

export default function FilterDrawer({
  children,
  label = 'Filters',
  showIcon = true,
}: {
  children: ReactNode
  label?: string
  showIcon?: boolean
}) {
  const [isOpen, setOpen] = useState(false)
  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      label={label}
      className="w-fit"
      contentClassName="w-fit"
      panelClassName="min-h-full w-100 max-w-md bg-base-100 text-base-content"
      content={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-flat"
          aria-label={`Open ${label}`}
        >
          {showIcon && <Filter size={16} />}
          {label}
        </button>
      }
    >
      <div className="p-6">{children}</div>
    </Drawer>
  )
}
