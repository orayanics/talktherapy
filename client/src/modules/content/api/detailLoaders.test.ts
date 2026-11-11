import { QueryClient } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import { Route as ContentRoute } from '#/routes/_private/(shared)/content/$contentId'
import { Route as ContentEditRoute } from '#/routes/_private/(shared)/content/_adm/$contentId.edit'
import { Route as PatientSoapRoute } from '#/routes/_private/(patient)/records.$soapId'
import { Route as ClinicianSoapRoute } from '#/routes/_private/(clinician)/patients/$patientId.soap.$soapId.index'
import { Route as SoapEditRoute } from '#/routes/_private/(clinician)/patients/$patientId.soap.$soapId.update'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
afterEach(() => vi.clearAllMocks())

const routes = [
  ['content detail', ContentRoute, 'content'],
  ['content editor', ContentEditRoute, 'content'],
  ['patient SOAP', PatientSoapRoute, 'soap'],
  ['clinician SOAP', ClinicianSoapRoute, 'soap'],
  ['SOAP editor', SoapEditRoute, 'soap'],
] as const

it.each(routes)(
  'loads critical %s data into the same Query cache before rendering',
  async (_name, route, key) => {
    const queryClient = new QueryClient()
    const record = { id: 'record' }
    vi.mocked(api).mockResolvedValue({ data: record })
    const loader = route.options.loader
    expect(typeof loader).toBe('function')
    if (typeof loader !== 'function')
      throw new Error('Detail route requires a loader')
    await loader({
      context: { queryClient },
      params: { contentId: 'record', soapId: 'record', patientId: 'patient' },
    } as never)
    expect(queryClient.getQueryData([key, 'record'])).toEqual(record)
    await loader({
      context: { queryClient },
      params: { contentId: 'record', soapId: 'record', patientId: 'patient' },
    } as never)
    expect(api).toHaveBeenCalledOnce()
    queryClient.clear()
  },
)
