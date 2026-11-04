type Variant = 'default' | 'error' | 'success' | 'warning'

interface ModalFooterProps {
  onClose: () => void
  onSubmit: () => void
  variant?: Variant
  isDisabled?: boolean
  label?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'btn-neutral',
  error: 'btn-error',
  success: 'btn-success',
  warning: 'btn-warning',
}

export default function ModalFooter({
  onClose,
  onSubmit,
  variant = 'default',
  isDisabled = false,
  label = 'Submit',
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
          Close
        </button>
        <button
          type="button"
          className={`btn ${VARIANT_CLASS[variant]}`}
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {label}
        </button>
      </div>
    </div>
  )
}
