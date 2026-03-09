import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { ContentModel } from "./model";
import { ContentService } from "./service";
import { logAction, AUDIT_ACTION, AUDIT_ENTITY } from "@/utils/audit";
import { globalRateLimit } from "@/plugins/rateLimit";

export const contentModule = new Elysia({ prefix: "/content" })
  .use(jwtPlugin)
  .use(globalRateLimit)
  .guard({ isAuth: true }, (app) =>
    app
      // GET: /content
      .get("/", ({ query }) => ContentService.listContent(query), {
        query: ContentModel.listQuery,
        response: {
          200: ContentModel.contentList,
        },
      })
      // GET: /content/:content_id
      .get(
        "/:content_id",
        ({ params }) => ContentService.getContentById(params.content_id),
        {
          params: ContentModel.contentParams,
          response: {
            200: ContentModel.content,
            404: ContentModel.notFound,
          },
        },
      ),
  )
  .guard({ isAuth: true, hasRole: ["admin", "sudo"] }, (app) =>
    app
      // POST: /content
      .post(
        "/",
        async ({ auth, body }) => {
          const content = await ContentService.createContent(
            auth!.userId,
            body,
          );
          logAction({
            actorId: auth!.userId,
            actorRole: auth!.role,
            action: AUDIT_ACTION.CONTENT_CREATED,
            entity: AUDIT_ENTITY.CONTENT,
            entityId: content.id,
            details: `Content created: ${body.title}`,
          });
          return content;
        },
        {
          body: ContentModel.createBody,
          response: {
            200: ContentModel.content,
          },
        },
      )
      // PATCH: /content/:content_id
      .patch(
        "/:content_id",
        ({ params, body }) =>
          ContentService.updateContent(params.content_id, body),
        {
          params: ContentModel.contentParams,
          body: ContentModel.updateBody,
          response: {
            200: ContentModel.content,
            404: ContentModel.notFound,
          },
        },
      )
      // DELETE: /content/:content_id
      .delete(
        "/:content_id",
        async ({ auth, params }) => {
          const result = await ContentService.deleteContent(params.content_id);
          logAction({
            actorId: auth!.userId,
            actorRole: auth!.role,
            action: AUDIT_ACTION.CONTENT_DELETED,
            entity: AUDIT_ENTITY.CONTENT,
            entityId: params.content_id,
            details: `Content deleted: ${params.content_id}`,
          });
          return result;
        },
        {
          params: ContentModel.contentParams,
          response: {
            200: ContentModel.deleteResponse,
            404: ContentModel.notFound,
          },
        },
      ),
  )
  .guard({ isAuth: true }, (app) =>
    app
      // GET: /content/bookmarks
      .get(
        "/bookmarks",
        ({ auth, query }) => ContentService.listBookmarks(auth!.userId, query),
        {
          query: ContentModel.bookmarkListQuery,
          response: {
            200: ContentModel.bookmarkList,
          },
        },
      )
      // POST: /content/:content_id/bookmark
      .post(
        "/:content_id/bookmark",
        ({ auth, params }) =>
          ContentService.addBookmark(auth!.userId, params.content_id),
        {
          params: ContentModel.bookmarkParams,
          response: {
            200: ContentModel.bookmarkResponse,
            404: ContentModel.notFound,
            409: ContentModel.bookmarkAlreadyExists,
          },
        },
      )
      // DELETE: /content/:content_id/bookmark
      .delete(
        "/:content_id/bookmark",
        ({ auth, params }) =>
          ContentService.removeBookmark(auth!.userId, params.content_id),
        {
          params: ContentModel.bookmarkParams,
          response: {
            200: ContentModel.unbookmarkResponse,
            404: ContentModel.bookmarkNotFound,
          },
        },
      ),
  );
