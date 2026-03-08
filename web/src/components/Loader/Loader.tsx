interface LoaderProps {
  className?: string
}

export default function Loader({ className }: LoaderProps) {
  return (
    <span
      className={`loading loading-spinner loading-md text-primary ${className || ''}`}
    ></span>
  )
}
