import type { ReactNode } from 'react'
import Modal from './Modal'
import ModalContent from './ModalContent'

interface ModalConfirmProps {
  title: ReactNode
  description: ReactNode
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
  }
  isOpen: boolean
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
    isOpen,
  } = props

  const { isLoading } = states

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description="Action Required"
      variant="error"
      onSubmit={() => onConfirm()}
      submitLabel={confirmText}
      closeLabel={cancelText}
      isDisabled={isLoading}
    >
      <ModalContent text={description} />
    </Modal>
  )
}
