import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const DiagnosisPlain = t.Object(
  { id: t.String(), label: t.String(), value: t.String(), createdAt: t.Date() },
  { additionalProperties: false },
);

export const DiagnosisRelations = t.Object(
  {
    users: t.Array(
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
      { additionalProperties: false },
    ),
    diagnosisContents: t.Array(
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

export const DiagnosisPlainInputCreate = t.Object(
  { label: t.String(), value: t.String() },
  { additionalProperties: false },
);

export const DiagnosisPlainInputUpdate = t.Object(
  { label: t.Optional(t.String()), value: t.Optional(t.String()) },
  { additionalProperties: false },
);

export const DiagnosisRelationsInputCreate = t.Object(
  {
    users: t.Optional(
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
    diagnosisContents: t.Optional(
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

export const DiagnosisRelationsInputUpdate = t.Partial(
  t.Object(
    {
      users: t.Partial(
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
      diagnosisContents: t.Partial(
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

export const DiagnosisWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          label: t.String(),
          value: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Diagnosis" },
  ),
);

export const DiagnosisWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), label: t.String(), value: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ label: t.String() }),
            t.Object({ value: t.String() }),
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
              label: t.String(),
              value: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Diagnosis" },
);

export const DiagnosisSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      label: t.Boolean(),
      value: t.Boolean(),
      createdAt: t.Boolean(),
      users: t.Boolean(),
      diagnosisContents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const DiagnosisInclude = t.Partial(
  t.Object(
    { users: t.Boolean(), diagnosisContents: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const DiagnosisOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      label: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      value: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Diagnosis = t.Composite([DiagnosisPlain, DiagnosisRelations], {
  additionalProperties: false,
});

export const DiagnosisInputCreate = t.Composite(
  [DiagnosisPlainInputCreate, DiagnosisRelationsInputCreate],
  { additionalProperties: false },
);

export const DiagnosisInputUpdate = t.Composite(
  [DiagnosisPlainInputUpdate, DiagnosisRelationsInputUpdate],
  { additionalProperties: false },
);
