import { prisma } from "prisma/db";
import {
  buildMessage,
  NOTIFICATION_TEMPLATES,
  type NotificationType,
} from "@/config/notifications";
import type { WSSender } from "@/modules/session/service";
import { format } from "date-fns";

const connections = new Map<string, WSSender>();

export interface NotifyContext {
  starts_at?: string;
  entity_id?: string;
  [key: string]: string | undefined;
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export abstract class NotificationService {
  static register(userId: string, ws: WSSender): void {
    connections.set(userId, ws);
  }

  static unregister(userId: string): void {
    connections.delete(userId);
  }

  static unregisterByWs(ws: WSSender): void {
    for (const [uid, sock] of connections) {
      if (sock === ws) {
        connections.delete(uid);
        break;
      }
    }
  }

  static isConnected(userId: string): boolean {
    return connections.has(userId);
  }

  /**
   * Creates a persisted notification for `userId` and pushes it via WS if
   * the user has an active connection.
   */
  static async notify(
    userId: string,
    type: NotificationType,
    context: NotifyContext = {},
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[type];

    // Build context tokens
    const tokenCtx: Record<string, string> = {};
    if (context.starts_at) {
      const d = new Date(context.starts_at);
      tokenCtx.date = format(d, "MMM d, yyyy");
      tokenCtx.time = format(d, "h:mm a");
    }
    // Pass through any extra string tokens
    for (const [k, v] of Object.entries(context)) {
      if (k !== "starts_at" && k !== "entity_id" && v !== undefined) {
        tokenCtx[k] = v;
      }
    }

    const message = buildMessage(template.message, tokenCtx);

    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        type,
        title: template.title,
        message,
        entity_type: template.entity_type,
        entity_id: context.entity_id ?? null,
      },
    });

    // Push over WS if the user is currently connected
    const ws = connections.get(userId);
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "notification",
          payload: NotificationService.toPayload(notification),
        }),
      );
    }
  }

  static async notifyMany(
    userIds: Array<string>,
    type: NotificationType,
    context: NotifyContext = {},
  ): Promise<void> {
    await Promise.all(
      userIds.map((userId) =>
        NotificationService.notify(userId, type, context),
      ),
    );
  }

  static async list(userId: string, page: number, per_page: number) {
    const skip = (page - 1) * per_page;
    const [data, total, unread] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        skip,
        take: per_page,
      }),
      prisma.notification.count({ where: { user_id: userId } }),
      prisma.notification.count({ where: { user_id: userId, read_at: null } }),
    ]);

    return {
      data: data.map(NotificationService.toPayload),
      meta: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
        unread,
      },
    };
  }

  static async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { user_id: userId, read_at: null },
    });
  }

  static async markAllRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { user_id: userId, read_at: null },
      data: { read_at: new Date() },
    });
  }

  static async markRead(userId: string, notificationId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { read_at: new Date() },
    });
  }

  private static toPayload(n: {
    id: string;
    type: string;
    title: string;
    message: string;
    entity_type: string | null;
    entity_id: string | null;
    read_at: Date | null;
    created_at: Date;
  }): NotificationPayload {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      entity_type: n.entity_type,
      entity_id: n.entity_id,
      read_at: n.read_at?.toISOString() ?? null,
      created_at: n.created_at.toISOString(),
    };
  }
}
