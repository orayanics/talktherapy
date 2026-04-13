import type { ReactNode } from 'react'
import ModalBody from './ModalBody'
import { XCircle } from 'lucide-react'

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
    <ModalBody isOpen={isOpen} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
        className="bg-white overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="bg-rose-100 p-8 space-y-2 text-center">
          <XCircle size={42} className="text-rose-600 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
            {title}
          </h1>
          <p className="text-rose-700 text-xs font-semibold uppercase tracking-widest mt-1">
            Action Required
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="p-2 flex justify-end gap-2">
          <button type="button" className="btn btn-neutral" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="submit" disabled={isLoading} className="btn btn-error">
            {confirmText}
          </button>
        </div>
      </form>
    </ModalBody>
  )
}
