import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import { betterAuthPlugin } from "./plugin/better-auth";
import { OpenAPI } from "./lib/auth";

import { usersModule } from "./modules/users";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(betterAuthPlugin)
  .use(usersModule)
  .get("/", () => "Hello Elysia")
  .listen(process.env.SERVER_PORT || 8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 API docs available at http://${app.server?.hostname}:${app.server?.port}/openapi`,
);
