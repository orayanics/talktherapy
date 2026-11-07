import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAlert } from '#/context/AlertContext'
import { mutateCreateSoap, mutateUpdateSoap } from '../api/soaps'
import type { Soap } from '../types/soap'

export const useCreateSoap = (patientId: string) => {
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
      navigate({ to: '/patients/$patientId', params: { patientId } })
    },
  })
}
export const useUpdateSoap = (soapId: string, patientId: string) => {
  const navigate = useNavigate()
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
      navigate({ to: '/patients/$patientId', params: { patientId } })
    },
  })
}
