import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'

import { MessageCircleMore } from 'lucide-react'
import type { ChatEntry } from '~/models/session'

export interface ChatPanelProps {
  messages: Array<ChatEntry>
  onSend: (text: string) => void
}

export default function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the message list scrolled to the bottom as new messages arrive.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <div className="drawer drawer-end">
      <input id="chat-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="indicator">
          {messages.length > 0 && (
            <span className="indicator-item badge badge-primary badge-xs">
              {messages.length}
            </span>
          )}
          <label
            htmlFor="chat-drawer"
            className="drawer-button btn btn-neutral"
          >
            <MessageCircleMore size={16} />
          </label>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="chat-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu bg-base-200 min-h-full w-80">
          {/* header */}
          <div className="py-3 border-b">
            <span className="text-gray-700 font-semibold text-sm">
              Session Chat
            </span>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 text-xs">
                No messages yet. Say hello!
              </p>
            )}

            {messages.map((msg) => (
              <div
                className={`chat ${msg.isSelf ? 'chat-end' : 'chat-start'}`}
                key={msg.id}
              >
                <div
                  className={`chat-bubble ${msg.isSelf ? 'chat-bubble-primary' : ''}`}
                >
                  {msg.text}
                </div>
                <div className="chat-footer opacity-50">
                  {format(new Date(msg.timestamp), 'p')}
                </div>
              </div>
            ))}

            <div ref={endRef} />
          </div>

          {/* compose */}
          <div className="border-t">
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Type a message…"
                className="input input-sm flex-1 text-xs"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSend}
                disabled={!draft.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
