import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { saveAs } from 'file-saver'

import { exportLogs } from '#/modules/logs/api/logs'
import type { LogParams } from '#/modules/logs/types/params'
import { errMsg } from '#/lib/errorMessage'

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

  return {
    onSubmit,
    apiError,
    isLoading: exportMutation.isPending,
  }
}
