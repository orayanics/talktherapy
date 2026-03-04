import type { DashboardCount } from '~/models/dashboard'
import UserCount from '~/modules/dashboard/UserCount'

export default function Index(props: DashboardCount) {
  const { data } = props
  return <UserCount {...data} />
}
