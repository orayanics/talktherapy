import { useEffect, useId, useRef } from 'react'
import type { FormEventHandler, ReactNode } from 'react'
import ModalHeader from './ModalHeader'
import type { GeneralVariant } from './ModalHeader'
import ModalFooter from './ModalFooter'

export interface ModalProps {
  children: ReactNode
  title: ReactNode
  description?: ReactNode
  variant?: GeneralVariant
  showIcon?: boolean
  className?: string
  isOpen: boolean
  onClose: () => void
  onSubmit?: FormEventHandler<HTMLFormElement>
  submitLabel?: string
  closeLabel?: string
  submitVariant?: GeneralVariant
  isDisabled?: boolean
}

export default function Modal({
  children,
  title,
  description,
  variant = 'default',
  showIcon,
  className,
  isOpen,
  onClose,
  onSubmit,
  submitLabel,
  closeLabel,
  submitVariant = variant,
  isDisabled = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !isOpen || dialog.open) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    return () => {
      if (typeof dialog.close === 'function') dialog.close()
    }
  }, [isOpen])

  if (!isOpen) return null

  const close = () => {
    if (!isDisabled) onClose()
  }
  const content = (
    <>
      <ModalHeader
        title={title}
        description={description}
        variant={variant}
        showIcon={showIcon}
        titleId={`${id}-title`}
        descriptionId={`${id}-description`}
      />
      <div className="p-8 space-y-6">{children}</div>
      <ModalFooter
        onClose={close}
        hasSubmit={Boolean(onSubmit)}
        variant={submitVariant}
        isDisabled={isDisabled}
        label={submitLabel}
        closeLabel={closeLabel}
      />
    </>
  )

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={`modal modal-open modal-middle backdrop-blur-[1px] border-0! ${className || ''}`}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
    >
      <div className="modal-box p-0">
        {onSubmit ? (
          <form
            aria-busy={isDisabled}
            onSubmit={(event) => {
              event.preventDefault()
              if (!isDisabled) void onSubmit(event)
            }}
          >
            {content}
          </form>
        ) : (
          content
        )}
      </div>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close dialog"
        disabled={isDisabled}
        onClick={close}
      >
        Close
      </button>
    </dialog>
  )
}
