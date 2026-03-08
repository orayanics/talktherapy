import { status } from "elysia";
import { prisma } from "prisma/db";
import { Prisma } from "prisma/generated/browser";
import type { ContentModel } from "./model";

const contentInclude = {
  author: { select: { id: true, name: true, email: true } },
  diagnosis: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ContentInclude;

function formatContent<T extends { created_at: Date; updated_at: Date }>(
  content: T,
) {
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
  const entries = names
    .map((name) => ({ name: name.trim(), slug: toSlug(name) }))
    .filter((e) => e.slug);
  const tags = await Promise.all(
    entries.map((e) =>
      prisma.tag.upsert({ where: { slug: e.slug }, update: {}, create: e }),
    ),
  );
  return tags.map((tag) => tag.id);
}

export abstract class ContentService {
  static async listContent(params: ContentModel.listQuery) {
    const { page = 1, per_page = 10, search, diagnosis_id } = params;

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

  static async addBookmark(user_id: string, content_id: string) {
    const content = await prisma.content.findUnique({
      where: { id: content_id },
    });
    if (!content) throw status(404, "Content not found");

    const existing = await prisma.bookmark.findUnique({
      where: { user_id_content_id: { user_id, content_id } },
    });
    if (existing) throw status(409, "Content already bookmarked");

    const bookmark = await prisma.bookmark.create({
      data: { user_id, content_id },
    });
    return {
      ...bookmark,
      created_at: bookmark.created_at.toISOString(),
    };
  }

  static async removeBookmark(user_id: string, content_id: string) {
    const existing = await prisma.bookmark.findUnique({
      where: { user_id_content_id: { user_id, content_id } },
    });
    if (!existing) throw status(404, "Bookmark not found");

    await prisma.bookmark.delete({
      where: { user_id_content_id: { user_id, content_id } },
    });
    return { message: "Bookmark removed successfully" };
  }

  static async listBookmarks(
    user_id: string,
    params: ContentModel.bookmarkListQuery,
  ) {
    const { page = 1, per_page = 10, search, diagnosis_id } = params;

    const where: Prisma.BookmarkWhereInput = {
      user_id,
      content: {
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }),
        ...(diagnosis_id?.length && {
          diagnosis: { value: { in: diagnosis_id } },
        }),
      },
    };

    const [items, total] = await prisma.$transaction([
      prisma.bookmark.findMany({
        where,
        include: {
          content: {
            include: contentInclude,
          },
        },
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { created_at: "desc" },
      }),
      prisma.bookmark.count({ where }),
    ]);

    const last_page = Math.ceil(total / per_page);

    return {
      data: items.map((b) => ({
        ...b,
        created_at: b.created_at.toISOString(),
        content: formatContent(b.content),
      })),
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
}
