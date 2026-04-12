import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SlotPlain = t.Object(
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
);

export const SlotRelations = t.Object(
  {
    availabilityRule: __nullable__(
      t.Object(
        {
          id: t.String(),
          clinicianId: t.String(),
          startAt: t.Date(),
          endAt: t.Date(),
          recurrenceRule: __nullable__(t.String()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
    appointments: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
    user: t.Object(
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
  },
  { additionalProperties: false },
);

export const SlotPlainInputCreate = t.Object(
  {
    startAt: t.Date(),
    endAt: t.Date(),
    status: t.Optional(
      t.Union(
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
    ),
    isHidden: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const SlotPlainInputUpdate = t.Object(
  {
    startAt: t.Optional(t.Date()),
    endAt: t.Optional(t.Date()),
    status: t.Optional(
      t.Union(
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
    ),
    isHidden: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const SlotRelationsInputCreate = t.Object(
  {
    availabilityRule: t.Optional(
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
    appointments: t.Optional(
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
    user: t.Object(
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

export const SlotRelationsInputUpdate = t.Partial(
  t.Object(
    {
      availabilityRule: t.Partial(
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
      appointments: t.Partial(
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
      user: t.Object(
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

export const SlotWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          availabilityRuleId: t.String(),
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
    { $id: "Slot" },
  ),
);

export const SlotWhereUnique = t.Recursive(
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
              availabilityRuleId: t.String(),
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
      ],
      { additionalProperties: false },
    ),
  { $id: "Slot" },
);

export const SlotSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      availabilityRuleId: t.Boolean(),
      clinicianId: t.Boolean(),
      startAt: t.Boolean(),
      endAt: t.Boolean(),
      status: t.Boolean(),
      isHidden: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      availabilityRule: t.Boolean(),
      appointments: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SlotInclude = t.Partial(
  t.Object(
    {
      status: t.Boolean(),
      availabilityRule: t.Boolean(),
      appointments: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SlotOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      availabilityRuleId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      clinicianId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      startAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      endAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isHidden: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Slot = t.Composite([SlotPlain, SlotRelations], {
  additionalProperties: false,
});

export const SlotInputCreate = t.Composite(
  [SlotPlainInputCreate, SlotRelationsInputCreate],
  { additionalProperties: false },
);

export const SlotInputUpdate = t.Composite(
  [SlotPlainInputUpdate, SlotRelationsInputUpdate],
  { additionalProperties: false },
);
