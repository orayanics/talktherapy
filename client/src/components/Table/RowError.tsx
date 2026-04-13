export default function RowError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-error text-xs mt-2">{message}</p>
}
