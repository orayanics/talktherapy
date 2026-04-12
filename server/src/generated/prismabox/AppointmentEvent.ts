import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AppointmentEventPlain = t.Object(
  {
    id: t.String(),
    appointmentId: t.String(),
    type: __nullable__(t.String()),
    actorType: __nullable__(t.String()),
    actorId: __nullable__(t.String()),
    reason: __nullable__(t.String()),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const AppointmentEventRelations = t.Object(
  {
    appointment: t.Object(
      {
        id: t.String(),
        slotId: __nullable__(t.String()),
        patientId: t.String(),
        clinicianId: __nullable__(t.String()),
        status: __nullable__(t.String()),
        bookedAt: __nullable__(t.Date()),
        confirmedAt: __nullable__(t.Date()),
        cancelledAt: __nullable__(t.Date()),
        completedAt: __nullable__(t.Date()),
        rescheduledAt: __nullable__(t.Date()),
        roomId: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AppointmentEventPlainInputCreate = t.Object(
  {
    type: t.Optional(__nullable__(t.String())),
    actorType: t.Optional(__nullable__(t.String())),
    reason: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AppointmentEventPlainInputUpdate = t.Object(
  {
    type: t.Optional(__nullable__(t.String())),
    actorType: t.Optional(__nullable__(t.String())),
    reason: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AppointmentEventRelationsInputCreate = t.Object(
  {
    appointment: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AppointmentEventRelationsInputUpdate = t.Partial(
  t.Object(
    {
      appointment: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const AppointmentEventWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          appointmentId: t.String(),
          type: t.String(),
          actorType: t.String(),
          actorId: t.String(),
          reason: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "AppointmentEvent" },
  ),
);

export const AppointmentEventWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              appointmentId: t.String(),
              type: t.String(),
              actorType: t.String(),
              actorId: t.String(),
              reason: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AppointmentEvent" },
);

export const AppointmentEventSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      appointmentId: t.Boolean(),
      type: t.Boolean(),
      actorType: t.Boolean(),
      actorId: t.Boolean(),
      reason: t.Boolean(),
      createdAt: t.Boolean(),
      appointment: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AppointmentEventInclude = t.Partial(
  t.Object(
    { appointment: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AppointmentEventOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      appointmentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      type: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reason: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const AppointmentEvent = t.Composite(
  [AppointmentEventPlain, AppointmentEventRelations],
  { additionalProperties: false },
);

export const AppointmentEventInputCreate = t.Composite(
  [AppointmentEventPlainInputCreate, AppointmentEventRelationsInputCreate],
  { additionalProperties: false },
);

export const AppointmentEventInputUpdate = t.Composite(
  [AppointmentEventPlainInputUpdate, AppointmentEventRelationsInputUpdate],
  { additionalProperties: false },
);
