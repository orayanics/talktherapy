import { queryOptions } from '@tanstack/react-query'

import { api } from '#/lib/api/client'
import type { Meta, QueryParams } from '#/types/api'
import type { LogParams } from '#/modules/logs/types/params'

export interface LogEntry {
  id: string
  actorId: string | null
  actorEmail: string
  actorRole: string
  action: string
  details: {
    [key: string]: unknown
  }
  createdAt: string
}

export interface LogsResponse {
  data: LogEntry[]
  meta: Meta
}

interface RawLogEntry {
  id: string
  actor_id: string | null
  actor_email?: string | null
  actor_role?: string | null
  action: string
  details: Record<string, unknown>
  created_at: string
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
    actor_role: searchParams.actor_role,
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
    sort: searchParams.sort,
  }

  return queryOptions<LogsResponse>({
    queryKey: ['logs', query],
    queryFn: async () => {
      const response = await api<{ data: RawLogEntry[]; meta: Meta }>('/api/v1/logs', {
        method: 'GET',
        params: query,
      })
      return {
        ...response,
        data: response.data.map((row) => ({
          id: row.id,
          actorId: row.actor_id,
          actorEmail: row.actor_email ?? '',
          actorRole: row.actor_role ?? '',
          action: row.action,
          details: row.details,
          createdAt: row.created_at,
        })),
      }
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
  const blob = await api<Blob>('/api/v1/logs/export', {
    method: 'GET',
    params: normalizedParams,
    responseType: 'blob',
  })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  if (fmt === 'json') {
    return {
      blob,
      filename: `audit_logs_${timestamp}.jsonl`,
    }
  }

  return {
    blob,
    filename: `audit_logs_${timestamp}.csv`,
  }
}

export const queueLogsExport = async (params: Partial<LogParams> = {}) => {
  const response = await api<{ data: { id: string; status: string } }>('/api/v1/logs/exports', {
    method: 'POST',
    data: { format: 'jsonl', ...params },
  })
  return response.data
}

export const downloadQueuedLogsExport = (id: string) =>
  api<Blob>(`/api/v1/logs/exports/${id}/download`, { method: 'GET', responseType: 'blob' })
