import { Elysia } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { ContentModel } from "./model";
import { ContentService } from "./service";

export const contentModule = new Elysia({ prefix: "/content" })
  .use(jwtPlugin)
  // list all content
  .guard({ isAuth: true }, (app) =>
    app
      .get(
        "/",
        async ({ query }) => {
          return ContentService.listContent(query);
        },
        {
          query: ContentModel.listQuery,
          detail: {
            summary: "List content with optional filters and pagination",
          },
        },
      )
      // get content by id
      .get(
        "/:content_id",
        async ({ params }) => {
          return ContentService.getContentById(params.content_id);
        },
        {
          params: ContentModel.contentParams,
          detail: { summary: "Get content details by ID" },
        },
      ),
  )
  .guard({ isAuth: true, hasRole: ["admin", "sudo"] }, (app) =>
    app
      // create content
      .post(
        "/",
        async ({ auth, body }) => {
          return ContentService.createContent(auth!.userId, body);
        },
        {
          body: ContentModel.createBody,
        },
      )
      // update content
      .patch(
        "/:content_id",
        async ({ params, body }) => {
          return ContentService.updateContent(params.content_id, body);
        },
        {
          params: ContentModel.contentParams,
          body: ContentModel.updateBody,
        },
      )
      // delete content
      .delete(
        "/:content_id",
        async ({ params }) => {
          return ContentService.deleteContent(params.content_id);
        },
        {
          params: ContentModel.contentParams,
          response: {
            404: ContentModel.notFound,
          },
        },
      ),
  );
