import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AppointmentPlain = t.Object(
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
);

export const AppointmentRelations = t.Object(
  {
    patient: t.Object(
      {
        id: t.String(),
        name: t.String(),
        email: t.String(),
        emailVerified: t.Boolean(),
        image: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        role: t.Union(
          [
            t.Literal("superadmin"),
            t.Literal("admin"),
            t.Literal("clinician"),
            t.Literal("patient"),
          ],
          { additionalProperties: false },
        ),
        banned: __nullable__(t.Boolean()),
        banReason: __nullable__(t.String()),
        banExpires: __nullable__(t.Date()),
        status: t.Union(
          [
            t.Literal("pending"),
            t.Literal("active"),
            t.Literal("suspended"),
            t.Literal("inactive"),
          ],
          { additionalProperties: false },
        ),
        diagnosis_id: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
    clinician: __nullable__(
      t.Object(
        {
          id: t.String(),
          name: t.String(),
          email: t.String(),
          emailVerified: t.Boolean(),
          image: __nullable__(t.String()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          role: t.Union(
            [
              t.Literal("superadmin"),
              t.Literal("admin"),
              t.Literal("clinician"),
              t.Literal("patient"),
            ],
            { additionalProperties: false },
          ),
          banned: __nullable__(t.Boolean()),
          banReason: __nullable__(t.String()),
          banExpires: __nullable__(t.Date()),
          status: t.Union(
            [
              t.Literal("pending"),
              t.Literal("active"),
              t.Literal("suspended"),
              t.Literal("inactive"),
            ],
            { additionalProperties: false },
          ),
          diagnosis_id: __nullable__(t.String()),
        },
        { additionalProperties: false },
      ),
    ),
    slot: __nullable__(
      t.Object(
        {
          id: t.String(),
          availabilityRuleId: __nullable__(t.String()),
          clinicianId: t.String(),
          startAt: t.Date(),
          endAt: t.Date(),
          status: t.Union(
            [
              t.Literal("FREE"),
              t.Literal("PENDING"),
              t.Literal("ACCEPTED"),
              t.Literal("REJECT"),
              t.Literal("CANCELLED"),
              t.Literal("COMPLETED"),
            ],
            { additionalProperties: false },
          ),
          isHidden: t.Boolean(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
    events: t.Array(
      t.Object(
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
      ),
      { additionalProperties: false },
    ),
    encounter: __nullable__(
      t.Object(
        {
          id: t.String(),
          appointmentId: t.String(),
          diagnosis: __nullable__(t.String()),
          chiefComplaint: __nullable__(t.String()),
          referralSource: __nullable__(t.String()),
          referralUrl: __nullable__(t.String()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const AppointmentPlainInputCreate = t.Object(
  {
    status: t.Optional(__nullable__(t.String())),
    bookedAt: t.Optional(__nullable__(t.Date())),
    confirmedAt: t.Optional(__nullable__(t.Date())),
    cancelledAt: t.Optional(__nullable__(t.Date())),
    completedAt: t.Optional(__nullable__(t.Date())),
    rescheduledAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const AppointmentPlainInputUpdate = t.Object(
  {
    status: t.Optional(__nullable__(t.String())),
    bookedAt: t.Optional(__nullable__(t.Date())),
    confirmedAt: t.Optional(__nullable__(t.Date())),
    cancelledAt: t.Optional(__nullable__(t.Date())),
    completedAt: t.Optional(__nullable__(t.Date())),
    rescheduledAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const AppointmentRelationsInputCreate = t.Object(
  {
    patient: t.Object(
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
    clinician: t.Optional(
      t.Object(
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
    ),
    slot: t.Optional(
      t.Object(
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
    ),
    events: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    encounter: t.Optional(
      t.Object(
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
    ),
  },
  { additionalProperties: false },
);

export const AppointmentRelationsInputUpdate = t.Partial(
  t.Object(
    {
      patient: t.Object(
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
      clinician: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      slot: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      events: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      encounter: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const AppointmentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          slotId: t.String(),
          patientId: t.String(),
          clinicianId: t.String(),
          status: t.String(),
          bookedAt: t.Date(),
          confirmedAt: t.Date(),
          cancelledAt: t.Date(),
          completedAt: t.Date(),
          rescheduledAt: t.Date(),
          roomId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Appointment" },
  ),
);

export const AppointmentWhereUnique = t.Recursive(
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
              slotId: t.String(),
              patientId: t.String(),
              clinicianId: t.String(),
              status: t.String(),
              bookedAt: t.Date(),
              confirmedAt: t.Date(),
              cancelledAt: t.Date(),
              completedAt: t.Date(),
              rescheduledAt: t.Date(),
              roomId: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Appointment" },
);

export const AppointmentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      slotId: t.Boolean(),
      patientId: t.Boolean(),
      clinicianId: t.Boolean(),
      status: t.Boolean(),
      bookedAt: t.Boolean(),
      confirmedAt: t.Boolean(),
      cancelledAt: t.Boolean(),
      completedAt: t.Boolean(),
      rescheduledAt: t.Boolean(),
      roomId: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      patient: t.Boolean(),
      clinician: t.Boolean(),
      slot: t.Boolean(),
      events: t.Boolean(),
      encounter: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AppointmentInclude = t.Partial(
  t.Object(
    {
      patient: t.Boolean(),
      clinician: t.Boolean(),
      slot: t.Boolean(),
      events: t.Boolean(),
      encounter: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AppointmentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      slotId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      patientId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      clinicianId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      status: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      bookedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      confirmedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      cancelledAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      completedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      rescheduledAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      roomId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Appointment = t.Composite(
  [AppointmentPlain, AppointmentRelations],
  { additionalProperties: false },
);

export const AppointmentInputCreate = t.Composite(
  [AppointmentPlainInputCreate, AppointmentRelationsInputCreate],
  { additionalProperties: false },
);

export const AppointmentInputUpdate = t.Composite(
  [AppointmentPlainInputUpdate, AppointmentRelationsInputUpdate],
  { additionalProperties: false },
);
