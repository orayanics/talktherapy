import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import { betterAuthPlugin } from "./plugin/better-auth";
import { OpenAPI } from "./lib/auth";

import { usersModule } from "./modules/users";
import { registerModule } from "./modules/register";
import { publicModule } from "./modules/public";
import { contentModule } from "./modules/content";
import { logsModule } from "./modules/logs";
import { appointmentsModule } from "./modules/appointments";
import { slotsModule } from "./modules/slots";
import { scheduleModule } from "./modules/schedule";
import { clinicianPatientModule } from "./modules/clinicianPatient";

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
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(betterAuthPlugin)
  .use(publicModule)
  .use(registerModule)
  .use(usersModule)
  .use(contentModule)
  .use(logsModule)
  .use(appointmentsModule)
  .use(slotsModule)
  .use(scheduleModule)
  .use(clinicianPatientModule)
  .get("/", () => "Hello Elysia")
  .listen(process.env.SERVER_PORT || 8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 API docs available at http://${app.server?.hostname}:${app.server?.port}/openapi`,
);
