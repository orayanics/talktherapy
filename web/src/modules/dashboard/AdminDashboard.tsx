import { useQuery } from '@tanstack/react-query'
import { dashboardDataQueryOptions } from '~/api/dashboard'
import UserCount from '~/modules/dashboard/UserCount'

export default function AdminDashboard() {
  const { data: adminData } = useQuery({
    ...dashboardDataQueryOptions,
  })

  return <UserCount {...adminData.data} />
}
