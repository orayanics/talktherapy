interface ModalFooterProps {
  children: React.ReactNode
}
export default function ModalFooter(props: ModalFooterProps) {
  const { children } = props
  return <div className="modal-action">{children}</div>
}
