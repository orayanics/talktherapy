import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BookmarkPlain = t.Object(
  {
    id: t.String(),
    userId: t.String(),
    contentId: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const BookmarkRelations = t.Object(
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
          [t.Literal("pending"), t.Literal("active"), t.Literal("suspended")],
          { additionalProperties: false },
        ),
        diagnosis_id: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
    content: t.Object(
      {
        id: t.String(),
        authorId: t.String(),
        diagnosisId: __nullable__(t.String()),
        title: t.String(),
        description: t.String(),
        body: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const BookmarkPlainInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const BookmarkPlainInputUpdate = t.Object(
  {},
  { additionalProperties: false },
);

export const BookmarkRelationsInputCreate = t.Object(
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
    content: t.Object(
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

export const BookmarkRelationsInputUpdate = t.Partial(
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
      content: t.Object(
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

export const BookmarkWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          userId: t.String(),
          contentId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Bookmark" },
  ),
);

export const BookmarkWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              userId_contentId: t.Object(
                { userId: t.String(), contentId: t.String() },
                { additionalProperties: false },
              ),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({
              userId_contentId: t.Object(
                { userId: t.String(), contentId: t.String() },
                { additionalProperties: false },
              ),
            }),
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
              userId: t.String(),
              contentId: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Bookmark" },
);

export const BookmarkSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      contentId: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      user: t.Boolean(),
      content: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const BookmarkInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), content: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const BookmarkOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      contentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Bookmark = t.Composite([BookmarkPlain, BookmarkRelations], {
  additionalProperties: false,
});

export const BookmarkInputCreate = t.Composite(
  [BookmarkPlainInputCreate, BookmarkRelationsInputCreate],
  { additionalProperties: false },
);

export const BookmarkInputUpdate = t.Composite(
  [BookmarkPlainInputUpdate, BookmarkRelationsInputUpdate],
  { additionalProperties: false },
);
