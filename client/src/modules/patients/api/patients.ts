import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import type { QueryParams } from '#/types/api'
import type { ClinicianPatientsParams } from '#/modules/patients/types/params'
import type { ClinicianPatientsResponse } from '#/modules/patients/types/patients'

export const fetchClinicianPatients = (
  params: QueryParams = {},
  searchParams: ClinicianPatientsParams = {},
) => {
  const query = {
    page: params.page,
    search: searchParams.search,
    sort: searchParams.sort,
  }
  return queryOptions<ClinicianPatientsResponse>({
    queryKey: ['clinician-patients', query],
    queryFn: async () =>
      api<ClinicianPatientsResponse>('/api/v1/patients', {
        method: 'GET',
        params: query,
      }),
    staleTime: 1000 * 60 * 5,
  })
}
