interface ModalHeaderProps {
  children: React.ReactNode
}
export default function ModalHeader(props: ModalHeaderProps) {
  const { children } = props
  return <h3 className="font-bold text-lg">{children}</h3>
}
