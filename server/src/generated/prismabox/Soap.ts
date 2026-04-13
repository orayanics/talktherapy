import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SoapPlain = t.Object(
  {
    id: t.String(),
    clinicianId: t.String(),
    patientId: t.String(),
    activity_plan: t.String(),
    session_type: __nullable__(t.String()),
    subjective_notes: __nullable__(t.String()),
    objective_notes: __nullable__(t.String()),
    assessment: __nullable__(t.String()),
    recommendation: __nullable__(t.String()),
    comments: __nullable__(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const SoapRelations = t.Object(
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
          [t.Literal("pending"), t.Literal("active"), t.Literal("suspended")],
          { additionalProperties: false },
        ),
        diagnosis_id: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const SoapPlainInputCreate = t.Object(
  {
    activity_plan: t.String(),
    session_type: t.Optional(__nullable__(t.String())),
    subjective_notes: t.Optional(__nullable__(t.String())),
    objective_notes: t.Optional(__nullable__(t.String())),
    assessment: t.Optional(__nullable__(t.String())),
    recommendation: t.Optional(__nullable__(t.String())),
    comments: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const SoapPlainInputUpdate = t.Object(
  {
    activity_plan: t.Optional(t.String()),
    session_type: t.Optional(__nullable__(t.String())),
    subjective_notes: t.Optional(__nullable__(t.String())),
    objective_notes: t.Optional(__nullable__(t.String())),
    assessment: t.Optional(__nullable__(t.String())),
    recommendation: t.Optional(__nullable__(t.String())),
    comments: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const SoapRelationsInputCreate = t.Object(
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
  },
  { additionalProperties: false },
);

export const SoapRelationsInputUpdate = t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const SoapWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          clinicianId: t.String(),
          patientId: t.String(),
          activity_plan: t.String(),
          session_type: t.String(),
          subjective_notes: t.String(),
          objective_notes: t.String(),
          assessment: t.String(),
          recommendation: t.String(),
          comments: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Soap" },
  ),
);

export const SoapWhereUnique = t.Recursive(
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
              patientId: t.String(),
              activity_plan: t.String(),
              session_type: t.String(),
              subjective_notes: t.String(),
              objective_notes: t.String(),
              assessment: t.String(),
              recommendation: t.String(),
              comments: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Soap" },
);

export const SoapSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      clinicianId: t.Boolean(),
      patientId: t.Boolean(),
      activity_plan: t.Boolean(),
      session_type: t.Boolean(),
      subjective_notes: t.Boolean(),
      objective_notes: t.Boolean(),
      assessment: t.Boolean(),
      recommendation: t.Boolean(),
      comments: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      clinician: t.Boolean(),
      patient: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SoapInclude = t.Partial(
  t.Object(
    { clinician: t.Boolean(), patient: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const SoapOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      clinicianId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      patientId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      activity_plan: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      session_type: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      subjective_notes: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      objective_notes: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      assessment: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      recommendation: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      comments: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Soap = t.Composite([SoapPlain, SoapRelations], {
  additionalProperties: false,
});

export const SoapInputCreate = t.Composite(
  [SoapPlainInputCreate, SoapRelationsInputCreate],
  { additionalProperties: false },
);

export const SoapInputUpdate = t.Composite(
  [SoapPlainInputUpdate, SoapRelationsInputUpdate],
  { additionalProperties: false },
);
