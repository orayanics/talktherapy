// routes/clinicians.ts
import { Elysia, t } from "elysia";
import { UserModel, ClinicianModel } from "../models";

export const clinicianRoutes = new Elysia({ name: "clinician-routes" }).group(
  "/api/clinicians",
  (app) =>
    app.guard(
      {
        isAuth: true,
        detail: {
          tags: ["Clinicians"],
        },
      },
      (app) =>
        app
          // Create clinician
          .post(
            "/",
            ({ body, user, error }) => {
              // Only admins and sudo can create clinicians
              if (
                user.account_role !== "admin" &&
                user.account_role !== "sudo"
              ) {
                return error(403, {
                  error: "Forbidden",
                  message: "Only admins can create clinicians",
                });
              }

              // Create user first
              const newUser = UserModel.create({
                email: body.email,
                name: body.name,
                account_type: "clinician",
                account_role: "clinician",
                account_status: "active",
                created_by: user.id,
              });

              // Create clinician record
              const clinician = ClinicianModel.create({
                user_id: newUser.id,
                diagnosis_id: body.diagnosis_id,
              });

              return {
                user: newUser,
                clinician,
              };
            },
            {
              body: t.Object({
                name: t.String(),
                email: t.String({ format: "email" }),
                diagnosis_id: t.Optional(t.String()),
              }),
              detail: {
                summary: "Create new clinician",
              },
            },
          )

          // Get clinician by ID
          .get(
            "/:id",
            ({ params: { id }, error }) => {
              const clinician = ClinicianModel.findById(id);

              if (!clinician) {
                return error(404, {
                  error: "Not Found",
                  message: "Clinician not found",
                });
              }

              const user = UserModel.findById(clinician.user_id);

              return {
                clinician,
                user,
              };
            },
            {
              params: t.Object({
                id: t.String(),
              }),
              detail: {
                summary: "Get clinician by ID",
              },
            },
          )

          // List all clinicians
          .get(
            "/",
            ({ query }) => {
              const clinicians = ClinicianModel.findAll();

              // Enrich with user data
              let result = clinicians.map((clinician) => {
                const user = UserModel.findById(clinician.user_id);
                return {
                  ...clinician,
                  user,
                };
              });

              // Filter by diagnosis if provided
              if (query.diagnosis_id) {
                result = result.filter(
                  (c) => c.diagnosis_id === query.diagnosis_id,
                );
              }

              return result;
            },
            {
              query: t.Object({
                diagnosis_id: t.Optional(t.String()),
              }),
              detail: {
                summary: "List all clinicians",
              },
            },
          )

          // Update clinician
          .patch(
            "/:id",
            ({ params: { id }, body, error }) => {
              const clinician = ClinicianModel.update(id, body);

              if (!clinician) {
                return error(404, {
                  error: "Not Found",
                  message: "Clinician not found",
                });
              }

              return clinician;
            },
            {
              params: t.Object({
                id: t.String(),
              }),
              body: t.Object({
                diagnosis_id: t.Optional(t.String()),
              }),
              detail: {
                summary: "Update clinician",
              },
            },
          ),
    ),
);
