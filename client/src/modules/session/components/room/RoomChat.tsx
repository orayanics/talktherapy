import { useState } from 'react'
import type { RefObject } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface ChatProps {
  messages: string[]
  onSend: (text: string) => void
  open: boolean
  onClose: () => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
}

export default function RoomChat({
  messages,
  onSend,
  open,
  onClose,
  closeButtonRef,
}: ChatProps) {
  const [text, setText] = useState('')
  const submit = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  const normalizeMessage = (raw: string) => {
    if (raw.startsWith('You: ')) {
      return { from: 'local' as const, text: raw.slice(5) }
    }
    if (raw.startsWith('Peer: ')) {
      return { from: 'peer' as const, text: raw.slice(6) }
    }
    return { from: 'peer' as const, text: raw }
  }

  return (
    <div className="drawer drawer-end pointer-events-none absolute inset-0 z-40">
      <input
        id="session-chat-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        readOnly
      />
      <div className="drawer-content pointer-events-none" />
      <div
        className="drawer-side"
        aria-hidden={!open}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <label
          htmlFor="session-chat-drawer"
          aria-label="Close chat"
          className="drawer-overlay pointer-events-auto"
          onClick={onClose}
        />
        <section
          id="session-chat"
          role="dialog"
          aria-modal={open}
          aria-label="Session chat"
          className="pointer-events-auto flex h-full w-80 flex-col border-l border-slate-200 bg-base-100 shadow-lg shadow-slate-200 lg:w-96"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-base-100/80 p-4 backdrop-blur">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              Chat
            </h3>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="btn btn-square btn-ghost"
              aria-label="Close chat"
            >
              <X />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col bg-base-100/50">
              <div className="flex flex-1 flex-col justify-end space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 text-slate-800">
                    <MessageCircle />
                    <span className="text-sm">No messages yet. Say hi!</span>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const msg = normalizeMessage(m)
                    const isLocal = msg.from === 'local'
                    return (
                      <div
                        key={i}
                        className={`chat ${isLocal ? 'chat-end' : 'chat-start'} animate-fade-in w-full`}
                      >
                        <div className="chat-header text-xs text-base-content/50">
                          {isLocal ? 'You' : 'Peer'}
                        </div>
                        <div
                          className={`chat-bubble text-sm shadow-sm ${isLocal ? 'chat-bubble-primary' : 'chat-bubble-neutral'}`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="mt-auto border-t border-base-300 bg-base-200/50 p-4">
                <div className="flex gap-2">
                  <input
                    id="session-chat-message"
                    aria-label="Chat message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="Type a message..."
                    className="input input-bordered input-sm min-w-0 flex-1 bg-base-100 shadow-inner"
                  />
                  <button
                    type="button"
                    aria-label="Send chat message"
                    onClick={submit}
                    className="btn btn-neutral btn-sm px-4 shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
