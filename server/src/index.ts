import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { rateLimit } from "elysia-rate-limit";

import { betterAuthPlugin } from "./plugin/better-auth";
import { OpenAPI } from "./lib/auth";

import { usersModule } from "./modules/users";
import { registerModule } from "./modules/register";
import { publicModule } from "./modules/public";
import { contentModule } from "./modules/content";
import { logsModule } from "./modules/logs";
import { adminModule } from "./modules/admin";
import { soapsModule } from "./modules/soaps";
import { appointmentsModule } from "./modules/appointments";
import { slotsModule } from "./modules/slots";
import { scheduleModule } from "./modules/schedule";
import { clinicianPatientModule } from "./modules/clinicianPatient";
import { sessionModule } from "./modules/session";
import { notificationsModule } from "./modules/notifications";
import { activateModule } from "./modules/activate";
import { authModule } from "./modules/auth";

class RateLimitError extends Error {
  status = 429;

  constructor(message: string = "Too many requests") {
    super(message);
  }
}

const generateRateLimitKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

const cert = Bun.file("../certs/localhost.pem");
const key = Bun.file("../certs/localhost-key.pem");

const publicRoutes = new Elysia()
  .use(
    rateLimit({
      scoping: "scoped",
      duration: 60_000,
      max: 10,
      generator: generateRateLimitKey,
      errorResponse: new RateLimitError(
        "Too many requests. Please try again in a minute.",
      ),
    }),
  )
  .use(publicModule)
  .use(activateModule)
  .use(registerModule)
  .use(authModule);

const authenticatedRoutes = new Elysia()
  .use(
    rateLimit({
      scoping: "scoped",
      duration: 60_000,
      max: 100,
      generator: generateRateLimitKey,
      errorResponse: new RateLimitError(
        "Too many requests. Please try again in a minute.",
      ),
    }),
  )
  .use(usersModule)
  .use(contentModule)
  .use(adminModule)
  .use(logsModule)
  .use(soapsModule)
  .use(appointmentsModule)
  .use(slotsModule)
  .use(scheduleModule)
  .use(clinicianPatientModule)
  .use(notificationsModule)
  .use(sessionModule);

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
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .error({
    RateLimitError,
  })
  .onError(({ code, error, set, path }) => {
    switch (code) {
      case "RateLimitError": {
        set.status = 429;
        return {
          success: false,
          error: error.message,
        };
      }
      case "VALIDATION": {
        set.status = 400;
        return {
          success: false,
          error: error.message,
        };
      }
      case "NOT_FOUND": {
        set.status = 404;
        return {
          success: false,
          error: `Route not found: ${path}`,
        };
      }
      default: {
        console.error("Unhandled server error", error);
        set.status =
          typeof (error as { status?: unknown })?.status === "number"
            ? (error as { status: number }).status
            : 500;
        return {
          success: false,
          error: "Internal server error",
        };
      }
    }
  })
  .use(betterAuthPlugin)
  .use(publicRoutes)
  .use(authenticatedRoutes)
  .get("/", () => "Hello Elysia")
  .listen({
    port: process.env.SERVER_PORT,
    hostname: process.env.SERVER_HOST,
    tls: {
      cert,
      key,
    },
  });

console.log(
  `🦊 Elysia is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 API docs available at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}/openapi`,
);
