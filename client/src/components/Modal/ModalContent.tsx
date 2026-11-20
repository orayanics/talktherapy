interface ModalContentProps {
  text: string | React.ReactNode
}

export default function ModalContent(props: ModalContentProps) {
  const { text } = props
  return (
    <div className="text-center">
      <span className="leading-relaxed">{text}</span>
    </div>
  )
}
