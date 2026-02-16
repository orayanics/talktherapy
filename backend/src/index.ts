// import { Elysia } from "elysia";

// const app = new Elysia()
//   .get("/", () => "Hello Elysia")
//   .get("/hello/:name", ({ params }) => `Hello ${params.name}!`)
//   .listen(8000);

// console.log(
//   `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} ${process.env.APP_JWT_SECRET}`,
// );
// index.ts
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { initDb } from "./database/database";
import { AuthPlugin } from "../plugins/auth";
import { userRoutes } from "./routes/users";
import { patientRoutes } from "./routes/patients";
import { clinicianRoutes } from "./routes/clinicians";
import { appointmentRoutes } from "./routes/appointments";
import { scheduleRoutes } from "./routes/schedules";
import { diagnosisRoutes } from "./routes/diagnoses";

// Initialize database
initDB();

export const app = new Elysia()
  .use(cors())

  // Global error handler
  .onError(({ code, error, set }) => {
    console.error("Error:", error);

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "Validation Error",
        message: error.message,
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
        process.env.NODE_ENV === "production"
          ? "An error occurred"
          : error.message,
    };
  })

  // Health check
  .get("/", () => ({
    message: "Healthcare Appointment System API",
    version: "1.0.0",
    status: "healthy",
  }))

  .get("/api/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
  }))

  // Mount plugins and routes
  .use(authPlugin)
  .use(userRoutes)
  .use(diagnosisRoutes)
  .use(patientRoutes)
  .use(clinicianRoutes)
  .use(appointmentRoutes)
  .use(scheduleRoutes)

  .listen(3000);

console.log(
  `🦊 Healthcare API running at ${app.server?.hostname}:${app.server?.port}`,
);

// Export type for Eden Treaty
export type App = typeof app;
