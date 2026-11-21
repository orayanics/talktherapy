export default function NotificationChannelOption({
  channel,
  checked,
  onChange,
}: {
  channel: 'in_app' | 'email'
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="label cursor-pointer gap-2">
      <input
        type="checkbox"
        aria-label={`Send by ${channel === 'in_app' ? 'in-app' : 'email'}`}
        className="checkbox checkbox-sm"
        checked={checked}
        onChange={onChange}
      />
      <span>{channel === 'in_app' ? 'In-app' : 'Email'}</span>
    </label>
  )
}
