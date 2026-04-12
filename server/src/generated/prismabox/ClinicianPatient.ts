import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ClinicianPatientPlain = t.Object(
  {
    id: t.String(),
    clinicianId: t.String(),
    patientId: t.String(),
    firstCompletedAt: __nullable__(t.Date()),
  },
  { additionalProperties: false },
);

export const ClinicianPatientRelations = t.Object(
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

export const ClinicianPatientPlainInputCreate = t.Object(
  { firstCompletedAt: t.Optional(__nullable__(t.Date())) },
  { additionalProperties: false },
);

export const ClinicianPatientPlainInputUpdate = t.Object(
  { firstCompletedAt: t.Optional(__nullable__(t.Date())) },
  { additionalProperties: false },
);

export const ClinicianPatientRelationsInputCreate = t.Object(
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

export const ClinicianPatientRelationsInputUpdate = t.Partial(
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

export const ClinicianPatientWhere = t.Partial(
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
          firstCompletedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "ClinicianPatient" },
  ),
);

export const ClinicianPatientWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              clinicianId_patientId: t.Object(
                { clinicianId: t.String(), patientId: t.String() },
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
              clinicianId_patientId: t.Object(
                { clinicianId: t.String(), patientId: t.String() },
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
              clinicianId: t.String(),
              patientId: t.String(),
              firstCompletedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ClinicianPatient" },
);

export const ClinicianPatientSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      clinicianId: t.Boolean(),
      patientId: t.Boolean(),
      firstCompletedAt: t.Boolean(),
      clinician: t.Boolean(),
      patient: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ClinicianPatientInclude = t.Partial(
  t.Object(
    { clinician: t.Boolean(), patient: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ClinicianPatientOrderBy = t.Partial(
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
      firstCompletedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ClinicianPatient = t.Composite(
  [ClinicianPatientPlain, ClinicianPatientRelations],
  { additionalProperties: false },
);

export const ClinicianPatientInputCreate = t.Composite(
  [ClinicianPatientPlainInputCreate, ClinicianPatientRelationsInputCreate],
  { additionalProperties: false },
);

export const ClinicianPatientInputUpdate = t.Composite(
  [ClinicianPatientPlainInputUpdate, ClinicianPatientRelationsInputUpdate],
  { additionalProperties: false },
);
