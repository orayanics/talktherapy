import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const EncounterPlain = t.Object(
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
);

export const EncounterRelations = t.Object(
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

export const EncounterPlainInputCreate = t.Object(
  {
    diagnosis: t.Optional(__nullable__(t.String())),
    chiefComplaint: t.Optional(__nullable__(t.String())),
    referralSource: t.Optional(__nullable__(t.String())),
    referralUrl: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const EncounterPlainInputUpdate = t.Object(
  {
    diagnosis: t.Optional(__nullable__(t.String())),
    chiefComplaint: t.Optional(__nullable__(t.String())),
    referralSource: t.Optional(__nullable__(t.String())),
    referralUrl: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const EncounterRelationsInputCreate = t.Object(
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

export const EncounterRelationsInputUpdate = t.Partial(
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

export const EncounterWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          appointmentId: t.String(),
          diagnosis: t.String(),
          chiefComplaint: t.String(),
          referralSource: t.String(),
          referralUrl: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Encounter" },
  ),
);

export const EncounterWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), appointmentId: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ appointmentId: t.String() }),
          ],
          { additionalProperties: false },
        ),
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
              diagnosis: t.String(),
              chiefComplaint: t.String(),
              referralSource: t.String(),
              referralUrl: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Encounter" },
);

export const EncounterSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      appointmentId: t.Boolean(),
      diagnosis: t.Boolean(),
      chiefComplaint: t.Boolean(),
      referralSource: t.Boolean(),
      referralUrl: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      appointment: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const EncounterInclude = t.Partial(
  t.Object(
    { appointment: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const EncounterOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      appointmentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      diagnosis: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      chiefComplaint: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      referralSource: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      referralUrl: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Encounter = t.Composite([EncounterPlain, EncounterRelations], {
  additionalProperties: false,
});

export const EncounterInputCreate = t.Composite(
  [EncounterPlainInputCreate, EncounterRelationsInputCreate],
  { additionalProperties: false },
);

export const EncounterInputUpdate = t.Composite(
  [EncounterPlainInputUpdate, EncounterRelationsInputUpdate],
  { additionalProperties: false },
);
