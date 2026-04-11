import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TagPlain = t.Object(
  { id: t.String(), name: t.String(), slug: t.String(), authorId: t.String() },
  { additionalProperties: false },
);

export const TagRelations = t.Object(
  {
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
    contents: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const TagPlainInputCreate = t.Object(
  { name: t.String(), slug: t.String() },
  { additionalProperties: false },
);

export const TagPlainInputUpdate = t.Object(
  { name: t.Optional(t.String()), slug: t.Optional(t.String()) },
  { additionalProperties: false },
);

export const TagRelationsInputCreate = t.Object(
  {
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
    contents: t.Optional(
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

export const TagRelationsInputUpdate = t.Partial(
  t.Object(
    {
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
      contents: t.Partial(
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

export const TagWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          name: t.String(),
          slug: t.String(),
          authorId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Tag" },
  ),
);

export const TagWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              authorId_slug: t.Object(
                { authorId: t.String(), slug: t.String() },
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
              authorId_slug: t.Object(
                { authorId: t.String(), slug: t.String() },
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
              name: t.String(),
              slug: t.String(),
              authorId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Tag" },
);

export const TagSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      slug: t.Boolean(),
      authorId: t.Boolean(),
      author: t.Boolean(),
      contents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TagInclude = t.Partial(
  t.Object(
    { author: t.Boolean(), contents: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const TagOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      slug: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      authorId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Tag = t.Composite([TagPlain, TagRelations], {
  additionalProperties: false,
});

export const TagInputCreate = t.Composite(
  [TagPlainInputCreate, TagRelationsInputCreate],
  { additionalProperties: false },
);

export const TagInputUpdate = t.Composite(
  [TagPlainInputUpdate, TagRelationsInputUpdate],
  { additionalProperties: false },
);
