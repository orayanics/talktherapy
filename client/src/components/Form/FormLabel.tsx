interface FormLabelProps {
  title?: React.ReactNode
  htmlFor?: string
}

export default function FormLabel({ title, htmlFor }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="text-neutral-700 text-xs font-bold tracking-wider uppercase">
      {title}
    </label>
  )
}
