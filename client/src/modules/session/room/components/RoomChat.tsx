import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface ChatProps {
  messages: string[]
  onSend: (text: string) => void
}

export default function RoomChat({ messages, onSend }: ChatProps) {
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
    <div className="flex flex-col h-full bg-base-100/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-end">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-800 space-y-4">
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
      <div className="p-4 bg-base-200/50 border-t border-base-300 mt-auto">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Type a message..."
            className="input input-bordered input-sm flex-1 bg-base-100 shadow-inner min-w-0"
          />
          <button
            onClick={submit}
            className="btn btn-neutral btn-sm shadow-sm px-4"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
