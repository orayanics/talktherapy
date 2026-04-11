import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { saveAs } from 'file-saver'
import { isAxiosError } from 'axios'

import { exportLogs } from '@/api/logs'
import type { LogParams } from '@/types/params'

export default function useExport() {
  const [apiError, setApiError] = useState<string | null>(null)

  const exportMutation = useMutation({
    mutationFn: async ({
      fmt,
      params,
    }: {
      fmt: 'csv' | 'json'
      params?: Partial<LogParams>
    }) => exportLogs(params ?? {}, fmt),

    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.message ?? err.message ?? 'Export failed'
        setApiError(msg)
        return
      }

      setApiError(err instanceof Error ? err.message : 'Export failed')
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
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ?? err.message ?? 'Export failed',
        )
      } else {
        setApiError(err instanceof Error ? err.message : 'Export failed')
      }
    }
  }

  return {
    onSubmit,
    apiError,
    isLoading: exportMutation.isPending,
  }
}
