import { prisma } from "@/lib/client";
import { buildMeta } from "@/lib/paginate";
import { TStoreContent } from "./model";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 15;

const toSlug = (name: string) =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const listContent = async (opts: any, userId?: string) => {
  const page = Number(opts.page ?? DEFAULT_PAGE);
  const per_page = Number(DEFAULT_PER_PAGE);

  const where: any = {};

  if (opts.search) {
    where.AND = [
      ...(where.AND ?? []),
      {
        OR: [
          { title: { contains: opts.search } },
          { description: { contains: opts.search } },
        ],
      },
    ];
  }

  if (opts.diagnosis_id && Array.isArray(opts.diagnosis_id)) {
    where.AND = [
      ...(where.AND ?? []),
      { diagnosis: { value: { in: opts.diagnosis_id } } },
    ];
  }

  if (opts.is_bookmarked !== undefined && opts.is_bookmarked !== null) {
    if (!userId) {
      // if filter requested but no user, return empty
      return { items: [], meta: buildMeta(0, page, per_page, 0) };
    }
    if (opts.is_bookmarked) {
      where.AND = [...(where.AND ?? []), { bookmarks: { some: { userId } } }];
    } else {
      where.AND = [...(where.AND ?? []), { bookmarks: { none: { userId } } }];
    }
  }

  const orderBy = {
    createdAt: opts.sort === "asc" ? ("asc" as const) : ("desc" as const),
  };

  const [total, data] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      orderBy,
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        author: { select: { id: true, name: true, email: true } },
        diagnosis: { select: { id: true, value: true, label: true } },
        tags: true,
        bookmarks: userId ? { where: { userId } } : undefined,
      },
    }),
  ]);

  return { data, meta: buildMeta(total, page, per_page, data.length) };
};

export const getContent = async (id: string, userId?: string) => {
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      diagnosis: { select: { id: true, value: true, label: true } },
      tags: true,
      bookmarks: userId ? { where: { userId } } : undefined,
    },
  });
  return content;
};

export const createContent = async (data: TStoreContent, userId: string) => {
  return prisma.$transaction(async (tx) => {
    const createData: any = {
      author: { connect: { id: userId } },
      title: data.title,
      description: data.description,
      body: data.body,
    };

    createData.diagnosis = { connect: { id: data.diagnosis_id } };

    const created = await tx.content.create({ data: createData });

    const tagNames: string[] = data.tag_names ?? [];
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const slug = toSlug(name);
      if (!slug) continue;
      const existing = await tx.tag.findFirst({
        where: { authorId: userId, slug },
      });
      if (existing) {
        tagIds.push(existing.id);
      } else {
        const createdTag = await tx.tag.create({
          data: {
            name: name.trim(),
            slug,
            author: { connect: { id: userId } },
          },
        });
        tagIds.push(createdTag.id);
      }
    }

    if (tagIds.length > 0) {
      await tx.content.update({
        where: { id: created.id },
        data: { tags: { connect: tagIds.map((tagId) => ({ id: tagId })) } },
      });
    }

    const loads = await tx.content.findUnique({
      where: { id: created.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        diagnosis: { select: { id: true, value: true, label: true } },
        tags: true,
        bookmarks: { where: { userId } },
      },
    });

    return loads;
  });
};

export const updateContent = async (id: string, data: any, userId?: string) => {
  return prisma.$transaction(async (tx) => {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.diagnosis_id !== undefined)
      updateData.diagnosis = data.diagnosis_id
        ? { connect: { id: data.diagnosis_id } }
        : { disconnect: true };

    if (Object.keys(updateData).length > 0) {
      await tx.content.update({ where: { id }, data: updateData });
    }

    if (Object.prototype.hasOwnProperty.call(data, "tag_names")) {
      const tagNames: string[] = data.tag_names ?? [];
      const tagIds: string[] = [];
      for (const name of tagNames) {
        const slug = toSlug(name);
        if (!slug) continue;
        const existing = await tx.tag.findFirst({
          where: { authorId: userId ?? "", slug },
        });
        if (existing) {
          tagIds.push(existing.id);
        } else {
          const createdTag = await tx.tag.create({
            data: {
              name: name.trim(),
              slug,
              author: { connect: { id: userId ?? "" } },
            },
          });
          tagIds.push(createdTag.id);
        }
      }

      await tx.content.update({
        where: { id },
        data: { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } },
      });
    }

    const loads = await tx.content.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        diagnosis: { select: { id: true, value: true, label: true } },
        tags: true,
        bookmarks: userId ? { where: { userId } } : undefined,
      },
    });

    return loads;
  });
};

export const deleteContent = async (id: string) => {
  await prisma.content.delete({ where: { id } });
  return true;
};

export const addBookmark = async (contentId: string, userId: string) => {
  const exists = await prisma.bookmark.findFirst({
    where: { userId, contentId },
  });
  if (exists) throw new Error("Content already bookmarked");

  const bookmark = await prisma.bookmark.create({
    data: {
      user: { connect: { id: userId } },
      content: { connect: { id: contentId } },
    },
  });

  const loaded = await prisma.bookmark.findUnique({
    where: { id: bookmark.id },
    include: {
      content: {
        include: {
          author: { select: { id: true, name: true, email: true } },
          diagnosis: { select: { id: true, value: true, label: true } },
          tags: true,
          bookmarks: { where: { userId } },
        },
      },
    },
  });

  return loaded;
};

export const removeBookmark = async (contentId: string, userId: string) => {
  const bookmark = await prisma.bookmark.findFirst({
    where: { userId, contentId },
  });
  if (!bookmark) throw new Error("Bookmark not found");
  await prisma.bookmark.delete({ where: { id: bookmark.id } });
  return true;
};

export const listBookmarks = async (opts: any, userId: string) => {
  const page = Number(opts.page ?? 1);
  const per_page = Number(opts.per_page ?? 10);

  const where: any = { userId };

  if (opts.search) {
    where.AND = [
      ...(where.AND ?? []),
      {
        OR: [
          { content: { title: { contains: opts.search } } },
          { content: { description: { contains: opts.search } } },
        ],
      },
    ];
  }

  if (opts.diagnosis_id && Array.isArray(opts.diagnosis_id)) {
    where.AND = [
      ...(where.AND ?? []),
      { content: { diagnosis: { value: { in: opts.diagnosis_id } } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.bookmark.count({ where }),
    prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        content: {
          include: {
            author: { select: { id: true, name: true, email: true } },
            diagnosis: { select: { id: true, value: true, label: true } },
            tags: true,
            bookmarks: { where: { userId } },
          },
        },
      },
    }),
  ]);

  return { items, meta: buildMeta(total, page, per_page, items.length) };
};
