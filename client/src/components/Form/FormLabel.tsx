interface FormLabelProps {
  title?: React.ReactNode
}

export default function FormLabel({ title }: FormLabelProps) {
  return (
    <label className="text-neutral-700 text-xs font-bold tracking-wider uppercase">
      {title}
    </label>
  )
}
