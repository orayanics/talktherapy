import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwtPlugin } from "@/plugins/jwt";

import { auth } from "@/modules/auth";
import { publicModule } from "@/modules/public";
import { users } from "@/modules/users";
import { schedulingModule } from "./modules/scheduling";
import { contentModule } from "./modules/content";

import { customMessages } from "./utils/errors";

const corsOrigins = (process.env.APP_CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = new Elysia()
  .use(
    cors({
      origin: corsOrigins.length
        ? corsOrigins
        : ["http://localhost:3000", "http://localhost:5173"],
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
      .use(auth)
      .use(publicModule)
      .use(users)
      .use(schedulingModule)
      .use(contentModule),
  )

  .listen(8000);

console.log(
  `🦊 Healthcare API running at ${app.server?.hostname}:${app.server?.port}`,
);

// Export type for Eden Treaty
export type App = typeof app;
