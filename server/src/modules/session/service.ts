import { prisma } from "@/lib/client";
import type {
  ExistingPeer,
  OutboundMessage,
  Participant,
  WSSender,
} from "./model";

const rooms = new Map<string, Map<string, Participant>>();

export abstract class SessionService {
  static getRoom(roomId: string): Map<string, Participant> {
    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    return rooms.get(roomId)!;
  }

  static join(
    roomId: string,
    participant: Participant,
  ): { existingPeers: ExistingPeer[] } {
    const room = SessionService.getRoom(roomId);
    const existingPeers = Array.from(room.values()).map((peer) => ({
      peerId: peer.peerId,
      user: peer.user,
    }));
    room.set(participant.peerId, participant);
    return { existingPeers };
  }

  static leave(roomId: string, peerId: string): void {
    const room = rooms.get(roomId);
    if (!room) return;
    room.delete(peerId);
    if (room.size === 0) rooms.delete(roomId);
  }

  static getPeer(
    roomId: string,
    excludePeerId: string,
  ): Participant | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;
    for (const [peerId, participant] of room) {
      if (peerId !== excludePeerId) return participant;
    }
    return undefined;
  }

  static send(ws: WSSender, msg: OutboundMessage): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      // no-op for closing sockets
    }
  }

  static broadcast(roomId: string, msg: OutboundMessage): void {
    const room = rooms.get(roomId);
    if (!room) return;
    const payload = JSON.stringify(msg);
    for (const { ws } of room.values()) {
      try {
        ws.send(payload);
      } catch {
        // skip disconnected sockets
      }
    }
  }

  static broadcastExcept(
    roomId: string,
    excludePeerId: string,
    msg: OutboundMessage,
  ): void {
    const room = rooms.get(roomId);
    if (!room) return;
    const payload = JSON.stringify(msg);
    for (const [peerId, { ws }] of room) {
      if (peerId === excludePeerId) continue;
      try {
        ws.send(payload);
      } catch {
        // skip disconnected sockets
      }
    }
  }

  static async authorizeRoom(roomId: string, userId: string): Promise<boolean> {
    const appointment = await prisma.appointment.findFirst({
      where: {
        roomId,
        status: "ACCEPTED",
        OR: [{ patientId: userId }, { clinicianId: userId }],
      },
      select: { id: true },
    });
    return Boolean(appointment);
  }
}
