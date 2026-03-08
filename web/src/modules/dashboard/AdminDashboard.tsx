import { useQuery } from '@tanstack/react-query'
import { dashboardDataQueryOptions } from '~/api/dashboard'
import UserCount from '~/modules/dashboard/UserCount'

import Loader from '~/components/Loader/Loader'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

export default function AdminDashboard() {
  const {
    data: adminData,
    isLoading,
    isError,
  } = useQuery({
    ...dashboardDataQueryOptions,
  })

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <SkeletonError />
      ) : !adminData ? (
        <SkeletonNull />
      ) : (
        <UserCount {...adminData} />
      )}
    </>
  )
}
