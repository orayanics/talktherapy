import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ContentPlain = t.Object(
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
);

export const ContentRelations = t.Object(
  {
    diagnosis: __nullable__(
      t.Object(
        {
          id: t.String(),
          label: t.String(),
          value: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
    author: t.Object(
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
    tags: t.Array(
      t.Object(
        {
          id: t.String(),
          name: t.String(),
          slug: t.String(),
          authorId: t.String(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    bookmarks: t.Array(
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
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ContentPlainInputCreate = t.Object(
  { title: t.String(), description: t.String(), body: t.String() },
  { additionalProperties: false },
);

export const ContentPlainInputUpdate = t.Object(
  {
    title: t.Optional(t.String()),
    description: t.Optional(t.String()),
    body: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const ContentRelationsInputCreate = t.Object(
  {
    diagnosis: t.Optional(
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
    author: t.Object(
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
    tags: t.Optional(
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
    bookmarks: t.Optional(
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

export const ContentRelationsInputUpdate = t.Partial(
  t.Object(
    {
      diagnosis: t.Partial(
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
      author: t.Object(
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
      tags: t.Partial(
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
      bookmarks: t.Partial(
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

export const ContentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          authorId: t.String(),
          diagnosisId: t.String(),
          title: t.String(),
          description: t.String(),
          body: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Content" },
  ),
);

export const ContentWhereUnique = t.Recursive(
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
              authorId: t.String(),
              diagnosisId: t.String(),
              title: t.String(),
              description: t.String(),
              body: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Content" },
);

export const ContentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      authorId: t.Boolean(),
      diagnosisId: t.Boolean(),
      title: t.Boolean(),
      description: t.Boolean(),
      body: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      diagnosis: t.Boolean(),
      author: t.Boolean(),
      tags: t.Boolean(),
      bookmarks: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ContentInclude = t.Partial(
  t.Object(
    {
      diagnosis: t.Boolean(),
      author: t.Boolean(),
      tags: t.Boolean(),
      bookmarks: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ContentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      authorId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      diagnosisId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      title: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      description: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      body: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Content = t.Composite([ContentPlain, ContentRelations], {
  additionalProperties: false,
});

export const ContentInputCreate = t.Composite(
  [ContentPlainInputCreate, ContentRelationsInputCreate],
  { additionalProperties: false },
);

export const ContentInputUpdate = t.Composite(
  [ContentPlainInputUpdate, ContentRelationsInputUpdate],
  { additionalProperties: false },
);
