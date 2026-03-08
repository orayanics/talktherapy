import { status } from "elysia";
import { prisma } from "prisma/db";
import type { OutboundMessage } from "./model";

// ── Minimal interface for a WebSocket sender ─────────────────────────────────
// Using a structural interface avoids generics issues with Elysia's WS type.
export interface WSSender {
  send: (data: string | ArrayBuffer | Uint8Array) => void;
}

// ── Participant types ────────────────────────────────────────────────────────

export interface Participant {
  ws: WSSender;
  userId: string;
  role: "clinician" | "patient";
}

// ── In-memory room registry ──────────────────────────────────────────────────
// roomId → Map<userId, Participant>
const rooms = new Map<string, Map<string, Participant>>();

// ── Session Service ──────────────────────────────────────────────────────────

export abstract class SessionService {
  /**
   * Resolves the room_id to an appointment and verifies the requesting user is
   * either the clinician or patient for that appointment.
   *
   * Returns `{ role }` on success, throws an Elysia status on failure.
   */
  static async authorizeRoom(
    roomId: string,
    userId: string,
  ): Promise<{ role: "clinician" | "patient" }> {
    const appointment = await prisma.appointments.findFirst({
      where: { room_id: roomId },
      include: {
        patient: { select: { user_id: true } },
        slot: {
          include: {
            clinician: { select: { user_id: true } },
          },
        },
      },
    });

    if (!appointment) {
      throw status(404, "Room not found");
    }

    if (appointment.status !== "CONFIRMED") {
      throw status(403, "Session room is not open");
    }

    const patientUserId = appointment.patient.user_id;
    const clinicianUserId = appointment.slot.clinician.user_id;

    if (userId === patientUserId) return { role: "patient" };
    if (userId === clinicianUserId) return { role: "clinician" };

    throw status(403, "You are not a participant of this session");
  }

  // ── Room participant management ────────────────────────────────────────────

  static getRoom(roomId: string): Map<string, Participant> {
    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    return rooms.get(roomId)!;
  }

  static join(
    roomId: string,
    ws: WSSender,
    userId: string,
    role: "clinician" | "patient",
  ): void {
    const room = SessionService.getRoom(roomId);
    room.set(userId, { ws, userId, role });
  }

  static leave(roomId: string, userId: string): void {
    const room = rooms.get(roomId);
    if (!room) return;
    room.delete(userId);
    if (room.size === 0) rooms.delete(roomId);
  }

  static getParticipants(
    roomId: string,
  ): Array<{ userId: string; role: "clinician" | "patient" }> {
    const room = rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.values()).map(({ userId, role }) => ({
      userId,
      role,
    }));
  }

  static getPeer(
    roomId: string,
    excludeUserId: string,
  ): Participant | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;
    for (const [uid, participant] of room) {
      if (uid !== excludeUserId) return participant;
    }
    return undefined;
  }

  // ── Broadcast helpers ──────────────────────────────────────────────────────

  /** Send a structured message to a single WebSocket */
  static send(ws: WSSender, msg: OutboundMessage): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      // socket may already be closing
    }
  }

  /** Broadcast a message to every participant in the room */
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

  /** Broadcast a message to everyone in the room except the sender */
  static broadcastExcept(
    roomId: string,
    excludeUserId: string,
    msg: OutboundMessage,
  ): void {
    const room = rooms.get(roomId);
    if (!room) return;
    const payload = JSON.stringify(msg);
    for (const [uid, { ws }] of room) {
      if (uid === excludeUserId) continue;
      try {
        ws.send(payload);
      } catch {
        // skip disconnected sockets
      }
    }
  }
}
