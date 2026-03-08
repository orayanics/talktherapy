import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ACCOUNT_ROLE, ACCOUNT_STATUS } from '~/models/account'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import { normalizeSearchArray } from '~/utils/query'
import { usersQueryOptions } from '~/api/users'

import UserList from '~/modules/users/list/UserList'

export const Route = createFileRoute('/_private/(adm-shared)/users/')({
  validateSearch: (search: Record<string, unknown>) => {
    const status = normalizeSearchArray(search.status) as Array<ACCOUNT_STATUS>
    const role = normalizeSearchArray(search.role) as Array<ACCOUNT_ROLE>
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)
    const searchTerm =
      typeof search.search === 'string' ? search.search : undefined

    return {
      ...(status.length ? { status } : {}),
      ...(role.length ? { role } : {}),
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data, isLoading, isError } = useQuery(
    usersQueryOptions({
      search: search.search,
      account_role: search.role,
      account_status: search.status,
      page: search.page,
      perPage: search.perPage,
    }),
  )

  return (
    <>
      <PageTitle heading="Users" subheading="View all users" />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <UserList
            search={search}
            isLoading={isLoading}
            isError={isError}
            data={data}
          />
        </GridItem>
      </Grid>
    </>
  )
}
