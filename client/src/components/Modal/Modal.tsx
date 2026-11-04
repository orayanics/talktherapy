import { useEffect, useRef } from 'react'

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export default function Modal(props: ModalBodyProps) {
  const { children, onClose, className, isOpen } = props
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !isOpen || dialog.open) return

    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal-open modal-middle backdrop-blur-[1px] border-0! ${className || ''}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-box p-0">{children}</div>
      <button type="button" className="modal-backdrop" onClick={onClose}>
        Close
      </button>
    </dialog>
  )
}
