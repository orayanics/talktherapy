import { createFileRoute } from '@tanstack/react-router'

import SessionRoom from '~/modules/session/room/SessionRoom'

export const Route = createFileRoute('/_private/(room)/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomId } = Route.useParams()
  return <SessionRoom roomId={roomId} />
}
