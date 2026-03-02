import { t } from "elysia";

const _tagShape = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
});

const _diagnosisShape = t.Object({
  id: t.String(),
  value: t.String(),
  label: t.String(),
});

const _authorShape = t.Object({
  id: t.String(),
  name: t.Nullable(t.String()),
  email: t.String(),
});

const _contentShape = t.Object({
  id: t.String(),
  author_id: t.String(),
  diagnosis_id: t.String(),
  title: t.String(),
  description: t.String(),
  body: t.String(),
  created_at: t.String(),
  updated_at: t.String(),
  author: _authorShape,
  diagnosis: _diagnosisShape,
  tags: t.Array(
    t.Object({
      tag: _tagShape,
    }),
  ),
});

export namespace ContentModel {
  export const contentParams = t.Object({ content_id: t.String() });
  export type contentParams = typeof contentParams.static;

  export const createBody = t.Object({
    title: t.String({ minLength: 1 }),
    description: t.String({ minLength: 1 }),
    body: t.String({ minLength: 1 }),
    diagnosis_id: t.String({ minLength: 1 }),
    tag_names: t.Optional(t.Array(t.String())),
  });
  export type createBody = typeof createBody.static;

  export const updateBody = t.Object({
    title: t.Optional(t.String({ minLength: 1 })),
    description: t.Optional(t.String({ minLength: 1 })),
    body: t.Optional(t.String({ minLength: 1 })),
    diagnosis_id: t.Optional(t.String({ minLength: 1 })),
    tag_names: t.Optional(t.Array(t.String())),
  });
  export type updateBody = typeof updateBody.static;

  export const listQuery = t.Object({
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    per_page: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String()),
    diagnosis_id: t.Optional(t.Array(t.String())),
  });
  export type listQuery = typeof listQuery.static;

  export const content = _contentShape;
  export type content = typeof content.static;

  export const contentList = t.Object({
    data: t.Array(_contentShape),
    meta: t.Object({
      total: t.Number(),
      page: t.Number(),
      per_page: t.Number(),
      last_page: t.Number(),
      from: t.Number(),
      to: t.Number(),
    }),
  });
  export type contentList = typeof contentList.static;

  export const notFound = t.Literal("Content not found");
  export type notFound = typeof notFound.static;

  export const invalid = t.Literal("Invalid content data");
  export type invalid = typeof invalid.static;
}
