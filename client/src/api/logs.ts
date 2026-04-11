import { queryOptions } from '@tanstack/react-query'

import { api } from './client'
import type { Meta, QueryParams, LogParams } from '@/types/params'

export interface LogEntry {
  id: string
  actor_id: string
  actor_email: string
  actor_role: string
  action: string
  entity: string
  entity_id: string
  details: {
    [key: string]: unknown
  }
  created_at: string
}

export interface LogsResponse {
  data: LogEntry[]
  meta: Meta
}

export const fetchLogs = (
  params: QueryParams = {},
  searchParams: LogParams = {},
) => {
  const query = {
    page: params.page,
    per_page: searchParams.per_page,

    search: searchParams.search,
    action: searchParams.action,
    entity: searchParams.entity,
    actor_email: searchParams.actor_email,
    actor_id: searchParams.actor_id,
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
    sort: searchParams.sort,
  }

  return queryOptions<LogsResponse>({
    queryKey: ['logs', query],
    queryFn: async () => {
      const data = await api('/logs', {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export const exportLogs = async (
  params: Partial<LogParams> = {},
  fmt: 'csv' | 'json' = 'csv',
) => {
  const backendFormat = fmt === 'json' ? 'jsonl' : 'csv'

  const query = {
    format: backendFormat,
    batch_size: 1000,
    ...params,
  }
  // strip empty string / null / undefined values so backend "sometimes" validation
  // does not treat present-but-empty params as invalid
  const normalizedParams = Object.fromEntries(
    Object.entries(query as Record<string, any>).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined,
    ),
  )

  // use existing axios `api` wrapper to get a blob response
  const blob = await api<Blob>('/logs/export', {
    method: 'GET',
    params: normalizedParams,
    responseType: 'blob',
  })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  if (fmt === 'json') {
    const text = await blob.text()

    const items = text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean)

    return {
      blob: new Blob([JSON.stringify(items, null, 2)], {
        type: 'application/json',
      }),
      filename: `audit_logs_${timestamp}.json`,
    }
  }

  return {
    blob,
    filename: `audit_logs_${timestamp}.csv`,
  }
}
