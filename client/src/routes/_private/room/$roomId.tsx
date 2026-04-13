import { createFileRoute } from '@tanstack/react-router'

import RoomSession from '../../../modules/session/room/RoomSession'

export const Route = createFileRoute('/_private/room/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
  const roomId = Route.useParams().roomId
  return <RoomSession roomId={roomId} />
}
