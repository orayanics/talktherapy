import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { saveAs } from 'file-saver'

import { downloadQueuedLogsExport, exportLogs, queueLogsExport } from '#/modules/logs/api/logs'
import type { LogParams } from '#/modules/logs/types/params'
import { errMsg } from '#/lib/errorMessage'
import { api } from '#/lib/api/client'

export default function useExport() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isQueueing, setIsQueueing] = useState(false)

  const exportMutation = useMutation({
    mutationFn: async ({
      fmt,
      params,
    }: {
      fmt: 'csv' | 'json'
      params?: Partial<LogParams>
    }) => exportLogs(params ?? {}, fmt),

    onError: (error: unknown) => {
      setApiError(errMsg(error, 'Export failed'))
    },
  })

  const onSubmit = async (params: Partial<LogParams>, fmt: 'csv' | 'json') => {
    setApiError(null)
    try {
      const { blob, filename } = await exportMutation.mutateAsync({
        fmt,
        params,
      })

      saveAs(blob, filename)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Export failed'))
    }
  }

  const onQueue = async (params: Partial<LogParams>) => {
    setApiError(null)
    setIsQueueing(true)
    try {
      const queued = await queueLogsExport(params)
      let status = 'queued'
      let attempts = 0
      while (status !== 'completed' && attempts++ < 120) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const result = await api<{ data: { status: string; download_url: string | null } }>(`/api/v1/logs/exports/${queued.id}`)
        status = result.data.status
        if (status === 'failed') throw new Error('Queued export failed')
        if (status === 'completed' && result.data.download_url) {
          const blob = await downloadQueuedLogsExport(queued.id)
          saveAs(blob, `audit_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`)
        }
      }
      if (status !== 'completed') throw new Error('Export timed out')
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Export failed'))
    } finally {
      setIsQueueing(false)
    }
  }

  return {
    onSubmit,
    onQueue,
    apiError,
    isLoading: exportMutation.isPending || isQueueing,
  }
}
