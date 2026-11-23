export default function NotificationRoleOption({
  role,
  selected,
  onChange,
}: {
  role: string
  selected: boolean
  onChange: () => void
}) {
  return (
    <label className="label cursor-pointer justify-start gap-2">
      <input
        type="radio"
        name="recipient-role"
        className="radio radio-sm"
        checked={selected}
        onChange={onChange}
      />
      <span className="capitalize">{role}s</span>
    </label>
  )
}
