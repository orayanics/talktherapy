import type { ModalFooterProps } from '~/models/components'

export default function ModalFooter(props: ModalFooterProps) {
  const { children } = props
  return <div className="modal-action">{children}</div>
}
