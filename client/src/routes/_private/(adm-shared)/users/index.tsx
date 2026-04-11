import { z } from 'zod'

import { createFileRoute } from '@tanstack/react-router'
import UsersList from '@/modules/users/UsersList'

import { toArray } from '@/utils/query'
import { ROLE_VALUES, STATUS_VALUES } from '@/constants/account'

const roleSchema = z
  .any()
  .transform((v) => toArray(v))
  .transform((arr) =>
    arr
      .map((v) => String(v))
      .filter((v) => ROLE_VALUES.includes(v as (typeof ROLE_VALUES)[number])),
  )

const statusSchema = z
  .any()
  .transform((v) => toArray(v))
  .transform((arr) =>
    arr
      .map((v) => String(v))
      .filter((v) =>
        STATUS_VALUES.includes(v as (typeof STATUS_VALUES)[number]),
      ),
  )

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : '')),

    role: roleSchema,

    account_status: statusSchema,

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.search ? { search: data.search } : {}),
    ...(data.role.length ? { role: data.role } : {}),
    ...(data.account_status.length
      ? { account_status: data.account_status }
      : {}),
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(adm-shared)/users/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  return <UsersList />
}
