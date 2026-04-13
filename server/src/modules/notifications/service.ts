import { prisma } from "@/lib/client";
import { NotificationHub } from "./ws";
import type { CreateNotification } from "./model";

export const createNotification = async (payload: CreateNotification) => {
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
    },
  });

  try {
    NotificationHub.broadcastToUser(notification.userId, {
      type: "notification",
      notification,
    });
  } catch (e) {
    // best-effort broadcast
  }

  return notification;
};

export const notifySafe = async (payload: CreateNotification) => {
  try {
    await createNotification(payload);
  } catch (e) {
    // swallow errors - best-effort notify
  }
};

export const notifyManySafe = async (items: CreateNotification[]) => {
  await Promise.all(items.map((it) => notifySafe(it)));
};

export const NotificationTemplates = {
  appointmentAcceptedPatient: ({ userId, clinicianName, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "Appointment accepted",
    message: `Your appointment has been accepted by ${clinicianName ?? "clinician"} for ${when}`,
    entityType: "appointment",
    entityId: id,
  }),

  appointmentAcceptedClinician: ({ userId, patientName, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "You accepted an appointment",
    message: `You accepted an appointment with ${patientName ?? "patient"} for ${when}`,
    entityType: "appointment",
    entityId: id,
  }),

  appointmentRejectedPatient: ({ userId, clinicianName, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "Appointment rejected",
    message: `Your appointment scheduled for ${when} was rejected by ${clinicianName ?? "clinician"}`,
    entityType: "appointment",
    entityId: id,
  }),

  appointmentCancelledClinician: ({ userId, patientName, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "Appointment cancelled",
    message: `Appointment for ${when} was cancelled by ${patientName ?? "patient"}`,
    entityType: "appointment",
    entityId: id,
  }),

  appointmentCancelledPatient: ({ userId, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "Appointment cancelled",
    message: `Your appointment for ${when} was cancelled.`,
    entityType: "appointment",
    entityId: id,
  }),

  appointmentCompletedPatient: ({ userId, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "Appointment completed",
    message: `Your appointment on ${when} was marked as completed.`,
    entityType: "appointment",
    entityId: id,
  }),

  appointmentCompletedClinician: ({ userId, patientName, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "You completed an appointment",
    message: `You marked the appointment with ${patientName ?? "patient"} as completed.`,
    entityType: "appointment",
    entityId: id,
  }),

  bookingCreatedClinician: ({ userId, patientName, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "New booking",
    message: `A new appointment was booked by ${patientName ?? "patient"} for ${when}`,
    entityType: "appointment",
    entityId: id,
  }),

  bookingCreatedPatient: ({ userId, when, id }: any) => ({
    userId,
    type: "appointment",
    title: "Booking created",
    message: `Your appointment request was created for ${when}`,
    entityType: "appointment",
    entityId: id,
  }),

  soapCreatedPatient: ({ userId, clinicianName, id }: any) => ({
    userId,
    type: "soap",
    title: "New session notes",
    message: `New session notes were added by ${clinicianName ?? "clinician"}.`,
    entityType: "soap",
    entityId: id,
  }),

  soapUpdatedPatient: ({ userId, clinicianName, id }: any) => ({
    userId,
    type: "soap",
    title: "Session notes updated",
    message: `Session notes were updated by ${clinicianName ?? "clinician"}.`,
    entityType: "soap",
    entityId: id,
  }),
} as const;

export const listNotifications = async (
  userId: string,
  opts: { limit?: number; unreadOnly?: boolean } = {},
) => {
  const where: any = { userId };
  if (opts.unreadOnly) where.readAt = null;
  // Ensure `take` is an integer Prisma expects (JS number -> Int)
  const take = Number.isFinite(opts.limit)
    ? Math.max(1, Math.trunc(opts.limit!))
    : 50;
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take,
  });
};

export const markAsRead = async (id: string, userId: string) => {
  const res = await prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
  return res.count > 0;
};
