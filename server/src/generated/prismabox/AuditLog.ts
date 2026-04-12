import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AuditLogPlain = t.Object(
  {
    id: t.String(),
    actorId: __nullable__(t.String()),
    actorEmail: __nullable__(t.String()),
    actorRole: __nullable__(t.String()),
    action: t.String(),
    details: __nullable__(t.String()),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const AuditLogRelations = t.Object(
  {
    actor: __nullable__(
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
  },
  { additionalProperties: false },
);

export const AuditLogPlainInputCreate = t.Object(
  {
    actorEmail: t.Optional(__nullable__(t.String())),
    actorRole: t.Optional(__nullable__(t.String())),
    action: t.String(),
    details: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AuditLogPlainInputUpdate = t.Object(
  {
    actorEmail: t.Optional(__nullable__(t.String())),
    actorRole: t.Optional(__nullable__(t.String())),
    action: t.Optional(t.String()),
    details: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AuditLogRelationsInputCreate = t.Object(
  {
    actor: t.Optional(
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

export const AuditLogRelationsInputUpdate = t.Partial(
  t.Object(
    {
      actor: t.Partial(
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

export const AuditLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          actorId: t.String(),
          actorEmail: t.String(),
          actorRole: t.String(),
          action: t.String(),
          details: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "AuditLog" },
  ),
);

export const AuditLogWhereUnique = t.Recursive(
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
              actorId: t.String(),
              actorEmail: t.String(),
              actorRole: t.String(),
              action: t.String(),
              details: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AuditLog" },
);

export const AuditLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      actorId: t.Boolean(),
      actorEmail: t.Boolean(),
      actorRole: t.Boolean(),
      action: t.Boolean(),
      details: t.Boolean(),
      createdAt: t.Boolean(),
      actor: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AuditLogInclude = t.Partial(
  t.Object(
    { actor: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AuditLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorEmail: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorRole: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      action: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      details: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const AuditLog = t.Composite([AuditLogPlain, AuditLogRelations], {
  additionalProperties: false,
});

export const AuditLogInputCreate = t.Composite(
  [AuditLogPlainInputCreate, AuditLogRelationsInputCreate],
  { additionalProperties: false },
);

export const AuditLogInputUpdate = t.Composite(
  [AuditLogPlainInputUpdate, AuditLogRelationsInputUpdate],
  { additionalProperties: false },
);
