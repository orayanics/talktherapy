import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAlert } from '#/context/AlertContext'
import { mutateCreateSoap, mutateUpdateSoap } from '../api/soaps'
import type { Soap } from '../types/soap'

export const useCreateSoap = (patientId: string, onSuccess?: () => void) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Soap>) =>
      mutateCreateSoap(patientId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['soaps'] }),
        queryClient.invalidateQueries({ queryKey: ['soap'] }),
      ])
      showAlert('SOAP created successfully', 'success')
      if (onSuccess) onSuccess()
      else navigate({ to: '/patients/$patientId', params: { patientId } })
    },
  })
}
export const useUpdateSoap = (soapId: string, onSuccess?: () => void) => {
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Soap>) => mutateUpdateSoap(soapId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['soaps'] }),
        queryClient.invalidateQueries({ queryKey: ['soap'] }),
      ])
      showAlert('SOAP updated', 'success')
      onSuccess?.()
    },
  })
}
