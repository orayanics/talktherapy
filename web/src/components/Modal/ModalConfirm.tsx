import ModalBody from './ModalBody'
import ModalHeader from './ModalHeader'
import type { ParsedError } from '~/utils/errors'
import { hasOnlyMessage } from '~/utils/errors'

interface ModalConfirmProps {
  title: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

export default function ModalConfirm(props: ModalConfirmProps) {
  const {
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    states,
  } = props

  const { isLoading, errors } = states

  return (
    <ModalBody isOpen={true} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
      >
        {hasOnlyMessage(errors) && (
          <p className="text-error text-center text-sm mt-1">
            {errors!.message}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <ModalHeader>{title}</ModalHeader>
          <p>{description}</p>
          <div className="flex flex-row gap-2 justify-end">
            <button type="button" className="btn" onClick={onCancel}>
              {cancelText}
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={isLoading}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
