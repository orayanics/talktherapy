import ModalBody from './ModalBody'
import ModalHeader from './ModalHeader'
import type { ModalConfirmProps } from '~/models/components'
import { hasOnlyMessage } from '~/utils/errors'

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
