import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwtPlugin } from "@/plugins/jwt";

import { authModule } from "@/modules/auth";
import { publicModule } from "@/modules/public";
import { usersModule } from "@/modules/users";
import { schedulingModule } from "./modules/scheduling";
import { contentModule } from "./modules/content";
import { sessionModule } from "./modules/session";
import { logsModule } from "./modules/logs";

import { customMessages } from "./utils/errors";

const corsOrigins = (process.env.APP_CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";

export const app = new Elysia()
  .use(
    cors({
      // In dev with no explicit origins set, allow any origin so LAN / network
      // access works without having to hardcode IPs.  In production, always
      // require APP_CORS_ORIGINS to be set explicitly.
      origin: corsOrigins.length ? corsOrigins : isDev ? true : false,
      credentials: true,
      allowedHeaders: ["authorization", "content-type"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )

  // Global error handler
  .onError(({ code, error, set }) => {
    console.error("Error:", error);

    if (code === "VALIDATION") {
      set.status = 400;
      const errors: Record<string, string[]> = {};
      for (const err of error.all) {
        const field = err.path?.replace(/^\//, "") ?? "unknown";
        if (!errors[field]) errors[field] = [];

        if (!errors[field].length) {
          errors[field].push(
            customMessages[field] ?? err.message ?? "Invalid value",
          );
        }
      }
      return {
        message: "Validation failed.",
        errors,
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        error: "Not Found",
        message: "The requested resource was not found",
      };
    }

    // Internal server error
    set.status = 500;
    return {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production" ? "An error occurred" : error,
    };
  })

  // Health check
  .get("/", () => ({
    message: "Healthcare Appointment System API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  }))

  .group("/api/v1", (app) =>
    app
      .use(jwtPlugin)
      .use(authModule)
      .use(publicModule)
      .use(usersModule)
      .use(schedulingModule)
      .use(contentModule)
      .use(sessionModule)
      .use(logsModule),
  )

  .listen({
    port: 8000,
    hostname: "0.0.0.0",
    tls: {
      // Self-signed cert at monorepo root — generated once for dev.
      // Both Vite (3000) and Elysia (8000) use the same cert so the browser
      // only needs to accept the untrusted cert once per host.
      cert: Bun.file(new URL("../../certs/cert.pem", import.meta.url)),
      key: Bun.file(new URL("../../certs/key.pem", import.meta.url)),
    },
  });

console.log(
  `🦊 Healthcare API running at ${app.server?.hostname}:${app.server?.port}`,
);

// Export type for Eden Treaty
export type App = typeof app;
