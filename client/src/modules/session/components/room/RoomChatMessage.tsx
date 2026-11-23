export default function RoomChatMessage({
  from,
  text,
}: {
  from: 'local' | 'peer'
  text: string
}) {
  const isLocal = from === 'local'

  return (
    <div
      className={`chat ${isLocal ? 'chat-end' : 'chat-start'} animate-fade-in w-full`}
    >
      <div className="chat-header text-xs text-base-content/50">
        {isLocal ? 'You' : 'Peer'}
      </div>
      <div
        className={`chat-bubble text-sm  ${isLocal ? 'chat-bubble-primary' : 'chat-bubble-neutral'}`}
      >
        {text}
      </div>
    </div>
  )
}
