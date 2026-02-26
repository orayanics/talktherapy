interface AccountStatusBadgeProps {
  status: string
}

const ACCOUNT_STATUS_BADGE_STYLES: Record<string, string> = {
  active:
    'rounded-lg badge badge-outline bg-green-50 text-green-800 border-green-200',
  deactivated:
    'rounded-lg badge badge-outline bg-sky-50 text-sky-800 border-sky-200',
  pending:
    'rounded-lg badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
  suspended:
    'rounded-lg badge badge-outline bg-red-50 text-red-800 border-red-200',
  default:
    'rounded-lg badge badge-outline bg-gray-50 text-gray-800 border-gray-200',
}

const ACCOUNT_STATUS_LABEL: Record<string, string> = {
  suspended: 'Suspended',
  active: 'Active',
  pending: 'Pending',
  deactivated: 'Deactivated',
  default: 'N/A',
}

export default function AccountStatusBadge(props: AccountStatusBadgeProps) {
  const { status } = props
  const style =
    ACCOUNT_STATUS_BADGE_STYLES[status] ?? ACCOUNT_STATUS_BADGE_STYLES.default
  const label = ACCOUNT_STATUS_LABEL[status] ?? ACCOUNT_STATUS_LABEL.default
  return <div className={style}>{label}</div>
}
