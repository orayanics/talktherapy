import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const NotificationPlain = t.Object(
  {
    id: t.String(),
    userId: t.String(),
    type: t.String(),
    title: t.String(),
    message: t.String(),
    entityType: __nullable__(t.String()),
    entityId: __nullable__(t.String()),
    readAt: __nullable__(t.Date()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const NotificationRelations = t.Object(
  {
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

export const NotificationPlainInputCreate = t.Object(
  {
    type: t.String(),
    title: t.String(),
    message: t.String(),
    entityType: t.Optional(__nullable__(t.String())),
    readAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const NotificationPlainInputUpdate = t.Object(
  {
    type: t.Optional(t.String()),
    title: t.Optional(t.String()),
    message: t.Optional(t.String()),
    entityType: t.Optional(__nullable__(t.String())),
    readAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const NotificationRelationsInputCreate = t.Object(
  {
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

export const NotificationRelationsInputUpdate = t.Partial(
  t.Object(
    {
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

export const NotificationWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          userId: t.String(),
          type: t.String(),
          title: t.String(),
          message: t.String(),
          entityType: t.String(),
          entityId: t.String(),
          readAt: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Notification" },
  ),
);

export const NotificationWhereUnique = t.Recursive(
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
              userId: t.String(),
              type: t.String(),
              title: t.String(),
              message: t.String(),
              entityType: t.String(),
              entityId: t.String(),
              readAt: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Notification" },
);

export const NotificationSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      type: t.Boolean(),
      title: t.Boolean(),
      message: t.Boolean(),
      entityType: t.Boolean(),
      entityId: t.Boolean(),
      readAt: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const NotificationInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const NotificationOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      type: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      title: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      message: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      entityType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      entityId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      readAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Notification = t.Composite(
  [NotificationPlain, NotificationRelations],
  { additionalProperties: false },
);

export const NotificationInputCreate = t.Composite(
  [NotificationPlainInputCreate, NotificationRelationsInputCreate],
  { additionalProperties: false },
);

export const NotificationInputUpdate = t.Composite(
  [NotificationPlainInputUpdate, NotificationRelationsInputUpdate],
  { additionalProperties: false },
);
