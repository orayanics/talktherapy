import Elysia from "elysia";
import { betterAuthPlugin } from "@/plugin/better-auth";
import { z } from "zod";
import { ApiError, ApiSuccess, ok, tryOk } from "@/lib/response";
import { auth } from "@/lib/auth";
import {
  ListContentSchema,
  StoreContentSchema,
  UpdateContentSchema,
  ListBookmarksSchema,
} from "./model";
import {
  listContent,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  addBookmark,
  removeBookmark,
  listBookmarks,
} from "./service";
import { logAudit } from "@/lib/audit";

export const contentModule = new Elysia({ prefix: "/content" })
  .use(betterAuthPlugin)
  .get(
    "/",
    async ({ query, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      const userId = session?.user?.id;
      const result = await tryOk(() => listContent(query, userId));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      query: ListContentSchema,
      response: { 200: ApiSuccess(), 400: ApiError },
    },
  )
  .get(
    "/:id",
    async ({ params, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      const userId = session?.user?.id;
      const result = await tryOk(() => getContent(params.id, userId));
      if (!result.success) return status(404, result);
      return status(200, ok(result.data));
    },
    {
      params: z.object({ id: z.string() }),
      response: { 200: ApiSuccess(), 404: ApiError },
    },
  )
  .post(
    "/",
    async ({ user, body, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session)
        return status(401, { success: false, error: "Unauthorized" });
      const userId = session.user.id;
      const result = await tryOk(() => createContent(body, userId));
      if (!result.success) return status(400, result);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "content.create",
        details: {
          title: body.title,
        },
      });

      return status(201, ok(result.data));
    },
    {
      auth: true,
      body: StoreContentSchema,
      response: { 201: ApiSuccess(), 400: ApiError, 401: ApiError },
    },
  )
  .patch(
    "/:id",
    async ({ user, params, body, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session)
        return status(401, { success: false, error: "Unauthorized" });
      const userId = session.user.id;
      const result = await tryOk(() => updateContent(params.id, body, userId));
      if (!result.success) return status(400, result);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "content.update",
        details: {
          title: body.title,
        },
      });
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      body: UpdateContentSchema,
      response: { 200: ApiSuccess(), 400: ApiError, 401: ApiError },
    },
  )
  .delete(
    "/:id",
    async ({ user, params, status, request }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session)
        return status(401, { success: false, error: "Unauthorized" });
      await deleteContent(params.id);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user?.role ?? "unknown",
        action: "content.delete",
        details: {
          id: params.id,
        },
      });
      return status(200, ok({ message: "Content deleted" }));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      response: { 200: ApiSuccess(), 401: ApiError },
    },
  )
  .post(
    "/:id/bookmark",
    async ({ params, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session)
        return status(401, { success: false, error: "Unauthorized" });
      const userId = session.user.id;
      const result = await tryOk(() => addBookmark(params.id, userId));
      if (!result.success) {
        if ((result as any).error === "Content already bookmarked")
          return status(409, result);
        return status(400, result);
      }
      return status(201, ok(result.data));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      response: {
        201: ApiSuccess(),
        400: ApiError,
        401: ApiError,
        409: ApiError,
      },
    },
  )
  .delete(
    "/:id/bookmark",
    async ({ params, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session)
        return status(401, { success: false, error: "Unauthorized" });
      const userId = session.user.id;
      const result = await tryOk(() => removeBookmark(params.id, userId));
      if (!result.success) return status(404, result);
      return status(200, ok({ message: "Bookmark removed" }));
    },
    {
      auth: true,
      params: z.object({ id: z.string() }),
      response: { 200: ApiSuccess(), 401: ApiError, 404: ApiError },
    },
  )
  .get(
    "/bookmarks",
    async ({ query, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session)
        return status(401, { success: false, error: "Unauthorized" });
      const userId = session.user.id;
      const result = await tryOk(() => listBookmarks(query, userId));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      query: ListBookmarksSchema,
      response: { 200: ApiSuccess(), 400: ApiError, 401: ApiError },
    },
  );
