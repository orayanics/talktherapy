import { z } from "zod";

export const ListNotificationsSchema = z.object({
  limit: z.number().optional(),
  unreadOnly: z.boolean().optional(),
  cursor: z.string().optional(),
});

export const CreateNotificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
