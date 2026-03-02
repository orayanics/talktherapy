import { status } from "elysia";
import { prisma } from "prisma/db";
import { Prisma } from "prisma/generated/browser";
import type { ContentModel } from "./model";

const contentInclude = {
  author: { select: { id: true, name: true, email: true } },
  diagnosis: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ContentInclude;

function formatContent(content: {
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown;
}) {
  return {
    ...content,
    created_at: content.created_at.toISOString(),
    updated_at: content.updated_at.toISOString(),
  };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function upsertTags(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const slug = toSlug(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: name.trim(), slug },
    });
    ids.push(tag.id);
  }
  return ids;
}

export abstract class ContentService {
  static async listContent(params: ContentModel.listQuery) {
    const {
      page = 1,
      per_page = 10,
      search,
      diagnosis_id,
    } = params as ContentModel.listQuery;

    const where: Prisma.ContentWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(diagnosis_id?.length && {
        diagnosis: { value: { in: diagnosis_id } },
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.content.findMany({
        where,
        include: contentInclude,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { created_at: "desc" },
      }),
      prisma.content.count({ where }),
    ]);

    const last_page = Math.ceil(total / per_page);

    return {
      data: items.map(formatContent),
      meta: {
        total,
        page,
        per_page,
        last_page,
        from: total === 0 ? 0 : (page - 1) * per_page + 1,
        to: Math.min(page * per_page, total),
      },
    };
  }

  static async getContentById(content_id: string) {
    const content = await prisma.content.findUnique({
      where: { id: content_id },
      include: contentInclude,
    });
    if (!content) throw status(404, "Content not found");
    return formatContent(content);
  }

  static async createContent(author_id: string, body: ContentModel.createBody) {
    const {
      title,
      description,
      body: contentBody,
      diagnosis_id,
      tag_names,
    } = body;
    const tagIds = tag_names?.length ? await upsertTags(tag_names) : [];

    const content = await prisma.content.create({
      data: {
        author_id,
        diagnosis_id,
        title,
        description,
        body: contentBody,
        ...(tagIds.length && {
          tags: {
            create: tagIds.map((tag_id) => ({ tag_id })),
          },
        }),
      },
      include: contentInclude,
    });

    return formatContent(content);
  }

  static async updateContent(
    content_id: string,
    body: ContentModel.updateBody,
  ) {
    const existing = await prisma.content.findUnique({
      where: { id: content_id },
    });
    if (!existing) throw status(404, "Content not found");

    const {
      title,
      description,
      body: contentBody,
      diagnosis_id,
      tag_names,
    } = body;
    const tagIds =
      tag_names !== undefined ? await upsertTags(tag_names) : undefined;

    const content = await prisma.content.update({
      where: { id: content_id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(contentBody && { body: contentBody }),
        ...(diagnosis_id && { diagnosis_id }),
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tag_id) => ({ tag_id })),
          },
        }),
      },
      include: contentInclude,
    });

    return formatContent(content);
  }

  static async deleteContent(content_id: string) {
    const existing = await prisma.content.findUnique({
      where: { id: content_id },
    });
    if (!existing) throw status(404, "Content not found");

    await prisma.content.delete({ where: { id: content_id } });
    return { message: "Content deleted successfully" };
  }
}
