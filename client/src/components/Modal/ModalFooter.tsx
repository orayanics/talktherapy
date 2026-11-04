import type { GeneralVariant } from './ModalHeader'

interface ModalFooterProps {
  onClose: () => void
  hasSubmit?: boolean
  variant?: GeneralVariant
  isDisabled?: boolean
  label?: string
  closeLabel?: string
}

const VARIANT_CLASS: Record<GeneralVariant, string> = {
  default: 'btn-neutral',
  info: 'btn-info',
  error: 'btn-error',
  success: 'btn-success',
  warning: 'btn-warning',
}

export default function ModalFooter({
  onClose,
  hasSubmit = false,
  variant = 'default',
  isDisabled = false,
  label = 'Submit',
  closeLabel = 'Close',
}: ModalFooterProps) {
  return (
    <div className="border-t border-border p-4">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={isDisabled}
        >
          {closeLabel}
        </button>
        {hasSubmit && (
          <button
            type="submit"
            className={`btn ${VARIANT_CLASS[variant]}`}
            disabled={isDisabled}
          >
            {label}
          </button>
        )}
      </div>
    </div>
  )
}
