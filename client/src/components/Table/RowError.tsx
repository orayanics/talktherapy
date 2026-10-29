export default function RowError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return <p id={id} className="text-error text-xs mt-2">{message}</p>
}
