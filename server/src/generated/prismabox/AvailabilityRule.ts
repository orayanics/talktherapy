import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AvailabilityRulePlain = t.Object(
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
);

export const AvailabilityRuleRelations = t.Object(
  {
    clinician: t.Object(
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
          [t.Literal("pending"), t.Literal("active"), t.Literal("suspended")],
          { additionalProperties: false },
        ),
        diagnosis_id: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
    slots: t.Array(
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
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AvailabilityRulePlainInputCreate = t.Object(
  {
    startAt: t.Date(),
    endAt: t.Date(),
    recurrenceRule: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AvailabilityRulePlainInputUpdate = t.Object(
  {
    startAt: t.Optional(t.Date()),
    endAt: t.Optional(t.Date()),
    recurrenceRule: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AvailabilityRuleRelationsInputCreate = t.Object(
  {
    clinician: t.Object(
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
    slots: t.Optional(
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
  },
  { additionalProperties: false },
);

export const AvailabilityRuleRelationsInputUpdate = t.Partial(
  t.Object(
    {
      clinician: t.Object(
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
      slots: t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const AvailabilityRuleWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          clinicianId: t.String(),
          startAt: t.Date(),
          endAt: t.Date(),
          recurrenceRule: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "AvailabilityRule" },
  ),
);

export const AvailabilityRuleWhereUnique = t.Recursive(
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
              clinicianId: t.String(),
              startAt: t.Date(),
              endAt: t.Date(),
              recurrenceRule: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AvailabilityRule" },
);

export const AvailabilityRuleSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      clinicianId: t.Boolean(),
      startAt: t.Boolean(),
      endAt: t.Boolean(),
      recurrenceRule: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      clinician: t.Boolean(),
      slots: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AvailabilityRuleInclude = t.Partial(
  t.Object(
    { clinician: t.Boolean(), slots: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AvailabilityRuleOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      recurrenceRule: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const AvailabilityRule = t.Composite(
  [AvailabilityRulePlain, AvailabilityRuleRelations],
  { additionalProperties: false },
);

export const AvailabilityRuleInputCreate = t.Composite(
  [AvailabilityRulePlainInputCreate, AvailabilityRuleRelationsInputCreate],
  { additionalProperties: false },
);

export const AvailabilityRuleInputUpdate = t.Composite(
  [AvailabilityRulePlainInputUpdate, AvailabilityRuleRelationsInputUpdate],
  { additionalProperties: false },
);
