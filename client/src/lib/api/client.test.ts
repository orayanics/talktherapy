/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from 'vitest'
import { api } from './client'

class CapturingXMLHttpRequest {
  static instance: CapturingXMLHttpRequest

  readonly upload = { addEventListener: vi.fn() }
  readonly headers: Record<string, string> = {}
  readonly onloadend: (() => void) | null = null
  readyState = 0
  status = 200
  statusText = 'OK'
  responseText = '{"ok":true}'
  response = ''
  timeout = 0
  withCredentials = false
  body: Document | XMLHttpRequestBodyInit | null = null

  constructor() {
    CapturingXMLHttpRequest.instance = this
  }

  open(): void {}

  setRequestHeader(name: string, value: string): void {
    this.headers[name.toLowerCase()] = value
  }

  getAllResponseHeaders(): string {
    return 'content-type: application/json\r\n'
  }

  addEventListener(): void {}

  send(body: Document | XMLHttpRequestBodyInit | null): void {
    this.body = body
    this.readyState = 4
    this.onloadend?.()
  }

  abort(): void {}
}

afterEach(() => vi.unstubAllGlobals())

it('sends FormData intact so the browser can add the multipart boundary', async () => {
  vi.stubGlobal('XMLHttpRequest', CapturingXMLHttpRequest)
  const formData = new FormData()
  formData.append('audio', new Blob(['recording'], { type: 'audio/webm' }), 'recording.webm')
  formData.append('reference_text', 'practice text')

  await api('/api/v1/slp/assess', { method: 'POST', data: formData })

  expect(CapturingXMLHttpRequest.instance.body).toBe(formData)
  expect(CapturingXMLHttpRequest.instance.headers['content-type']).toBeUndefined()
})
