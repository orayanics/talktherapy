// routes/patients.ts
import { Elysia, t } from "elysia";
import { UserModel, PatientModel } from "../models";

export const patientRoutes = new Elysia({ name: "patient-routes" }).group(
  "/api/patients",
  (app) =>
    app
      // Guard all patient routes with authentication
      .guard(
        {
          isAuth: true,
          detail: {
            tags: ["Patients"],
          },
        },
        (app) =>
          app
            // Create patient
            .post(
              "/",
              ({ body, user, error }) => {
                // Only admins and sudo can create patients
                if (
                  user.account_role !== "admin" &&
                  user.account_role !== "sudo"
                ) {
                  return error(403, {
                    error: "Forbidden",
                    message: "Only admins can create patients",
                  });
                }

                // Create user first
                const newUser = UserModel.create({
                  email: body.email,
                  name: body.name,
                  account_type: "patient",
                  account_role: "patient",
                  account_status: "active",
                  created_by: user.id,
                });

                // Create patient record
                const patient = PatientModel.create({
                  user_id: newUser.id,
                  diagnosis_id: body.diagnosis_id,
                  consent: body.consent,
                });

                return {
                  user: newUser,
                  patient,
                };
              },
              {
                body: t.Object({
                  name: t.String(),
                  email: t.String({ format: "email" }),
                  diagnosis_id: t.Optional(t.String()),
                  consent: t.Optional(t.String()),
                }),
                detail: {
                  summary: "Create new patient",
                },
              },
            )

            // Get patient by ID
            .get(
              "/:id",
              ({ params: { id }, error }) => {
                const patient = PatientModel.findById(id);

                if (!patient) {
                  return error(404, {
                    error: "Not Found",
                    message: "Patient not found",
                  });
                }

                const user = UserModel.findById(patient.user_id);

                return {
                  patient,
                  user,
                };
              },
              {
                params: t.Object({
                  id: t.String(),
                }),
                detail: {
                  summary: "Get patient by ID",
                },
              },
            )

            // List all patients
            .get(
              "/",
              () => {
                const patients = PatientModel.findAll();

                // Enrich with user data
                return patients.map((patient) => {
                  const user = UserModel.findById(patient.user_id);
                  return {
                    ...patient,
                    user,
                  };
                });
              },
              {
                detail: {
                  summary: "List all patients",
                },
              },
            )

            // Update patient
            .patch(
              "/:id",
              ({ params: { id }, body, error }) => {
                const patient = PatientModel.update(id, body);

                if (!patient) {
                  return error(404, {
                    error: "Not Found",
                    message: "Patient not found",
                  });
                }

                return patient;
              },
              {
                params: t.Object({
                  id: t.String(),
                }),
                body: t.Object({
                  diagnosis_id: t.Optional(t.String()),
                  consent: t.Optional(t.String()),
                }),
                detail: {
                  summary: "Update patient",
                },
              },
            ),
      ),
);
