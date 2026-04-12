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
import { soapsModule } from "./modules/soaps";
import { appointmentsModule } from "./modules/appointments";
import { slotsModule } from "./modules/slots";
import { scheduleModule } from "./modules/schedule";
import { clinicianPatientModule } from "./modules/clinicianPatient";
import { sessionModule } from "./modules/session";
const cert = Bun.file("../certs/localhost.pem");
const key = Bun.file("../certs/localhost-key.pem");

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
  .use(betterAuthPlugin)
  .use(publicModule)
  .use(registerModule)
  .use(usersModule)
  .use(contentModule)
  .use(logsModule)
  .use(soapsModule)
  .use(appointmentsModule)
  .use(slotsModule)
  .use(scheduleModule)
  .use(clinicianPatientModule)
  .use(sessionModule)
  .get("/", () => "Hello Elysia")
  .listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    hostname: process.env.HOSTNAME ? process.env.HOSTNAME : "0.0.0.0",
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
