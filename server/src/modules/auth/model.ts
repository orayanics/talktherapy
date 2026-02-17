// Model define the data structure and validation for the request and response
import { t } from "elysia";

// DTO, Define as TypeScript type
export namespace AuthModel {
  // SignIn
  export const signInBody = t.Object({
    email: t.String({
      format: "email",
      error: "Valid email is required",
    }),
    password: t.String({
      minLength: 1,
      error: "Password is required",
    }),
  });

  export type signInBody = typeof signInBody.static;

  export const signInResponse = t.Object({
    email: t.String(),
    token: t.String(),
  });

  export type signInResponse = typeof signInResponse.static;

  export const signInInvalid = t.Literal("Invalid email or password");
  export type signInInvalid = typeof signInInvalid.static;

  // SignUp: Patient
  export const signUpPatientBody = t.Object({
    name: t.String({
      minLength: 2,
      maxLength: 100,
      error: "Name must be between 2 and 100 characters long",
    }),
    email: t.String({
      format: "email",
      error: "Valid email is required",
    }),
    password: t.String({
      minLength: 6,
      error: "Password must be at least 6 characters long",
    }),
    account_status: t.Optional(t.String({ default: "active" })),
    account_role: t.Optional(t.String({ default: "patient" })),
    account_permissions: t.Optional(t.String({ default: "content:read" })),
    consent: t.Boolean({
      error: "Consent must be true to continue",
    }),
    diagnosis_id: t.String({
      error: "Diagnosis is required",
    }),
  });
  export type signUpPatientBody = typeof signUpPatientBody.static;
  export const signUpPatientResponse = t.Object({
    message: t.String(),
  });
  export type signUpPatientResponse = typeof signUpPatientResponse.static;
  export const signUpPatientInvalid = t.Literal("Invalid input data");
  export type signUpPatientInvalid = typeof signUpPatientInvalid.static;

  // SignUp: Clinician
  export const signUpClinicianBody = t.Object({
    email: t.String({
      format: "email",
    }),
    account_status: t.Optional(t.String({ default: "active" })),
    account_role: t.Optional(t.String({ default: "clinician" })),
    account_permissions: t.Optional(t.String({ default: "content:read" })),
    diagnosis_id: t.Optional(t.String({ error: "Diagnosis is required" })), // will be set by clinician after account activation
    created_by: t.String(), // should be user ID of the creator
  });
  export type signUpClinicianBody = typeof signUpClinicianBody.static;
  export const signUpClinicianResponse = t.Object({
    message: t.String(),
  });
  export type signUpClinicianResponse = typeof signUpClinicianResponse.static;
  export const signUpClinicianInvalid = t.Literal("Invalid input data");
  export type signUpClinicianInvalid = typeof signUpClinicianInvalid.static;

  // SignUp: Admin
  export const signUpAdminBody = t.Object({
    email: t.String({
      format: "email",
    }),
    account_status: t.Optional(t.String({ default: "active" })),
    account_role: t.Optional(t.String({ default: "admin" })),
    account_permissions: t.Optional(t.String({ default: "content:read" })),
    created_by: t.String(), // should be user ID of the creator
  });
  export type signUpAdminBody = typeof signUpAdminBody.static;
  export const signUpAdminResponse = t.Object({
    message: t.String(),
  });
  export type signUpAdminResponse = typeof signUpAdminResponse.static;
  export const signUpAdminInvalid = t.Literal("Invalid input data");
  export type signUpAdminInvalid = typeof signUpAdminInvalid.static;
}
