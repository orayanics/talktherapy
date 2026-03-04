import type { APPOINTMENT_STATUS } from '~/models/appointment'
import type { StatusProps } from '~/models/components'

import {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_STYLES,
} from '~/config/appointmentStatus'

export default function AppointmentStatusBadge(
  props: StatusProps<APPOINTMENT_STATUS>,
) {
  const { status } = props
  const style =
    APPOINTMENT_STATUS_STYLES[status] || APPOINTMENT_STATUS_STYLES.pending
  return <div className={style}>{APPOINTMENT_STATUS_LABEL[status]}</div>
}
