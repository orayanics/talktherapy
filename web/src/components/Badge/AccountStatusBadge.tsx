import type { ACCOUNT_STATUS } from '~/models/account'
import type { StatusProps } from '~/models/components'
import {
  ACCOUNT_STATUS_BADGE_STYLES,
  ACCOUNT_STATUS_LABEL,
} from '~/config/accountStatus'

export default function AccountStatusBadge(props: StatusProps<ACCOUNT_STATUS>) {
  const { status } = props
  const style = ACCOUNT_STATUS_BADGE_STYLES[status]
  const label = ACCOUNT_STATUS_LABEL[status]
  return <div className={style}>{label}</div>
}
