import { t } from "elysia";

const EmailField = t.String({
  format: "email",
  error: "Valid email is required",
});

const accountFields = (role: string) => ({
  account_status: t.Optional(t.String({ default: "active" })),
  account_role: t.Optional(t.String({ default: role })),
  account_permissions: t.Optional(t.String({ default: "content:read" })),
});

const MessageResponse = t.Object({ message: t.String() });
const InvalidInput = t.Literal("Invalid input data");

export namespace AuthModel {
  // SignIn
  export const signInBody = t.Object({
    email: EmailField,
    password: t.String({ minLength: 1, error: "Password is required" }),
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
    email: EmailField,
    password: t.String({
      minLength: 6,
      error: "Password must be at least 6 characters long",
    }),
    ...accountFields("patient"),
    consent: t.Literal(true, { error: "Consent must be true to continue" }),
    diagnosis_id: t.String({ minLength: 1, error: "Diagnosis is required" }),
  });
  export type signUpPatientBody = typeof signUpPatientBody.static;
  export const signUpPatientResponse = MessageResponse;
  export type signUpPatientResponse = typeof signUpPatientResponse.static;
  export const signUpPatientInvalid = InvalidInput;
  export type signUpPatientInvalid = typeof signUpPatientInvalid.static;

  // SignUp: Clinician
  export const signUpClinicianBody = t.Object({
    email: EmailField,
    ...accountFields("clinician"),
    diagnosis_id: t.Optional(t.String({ error: "Diagnosis is required" })),
    created_by: t.String(),
  });
  export type signUpClinicianBody = typeof signUpClinicianBody.static;
  export const signUpClinicianResponse = MessageResponse;
  export type signUpClinicianResponse = typeof signUpClinicianResponse.static;
  export const signUpClinicianInvalid = InvalidInput;
  export type signUpClinicianInvalid = typeof signUpClinicianInvalid.static;

  // SignUp: Admin
  export const signUpAdminBody = t.Object({
    email: EmailField,
    ...accountFields("admin"),
    created_by: t.String(),
  });
  export type signUpAdminBody = typeof signUpAdminBody.static;
  export const signUpAdminResponse = MessageResponse;
  export type signUpAdminResponse = typeof signUpAdminResponse.static;
  export const signUpAdminInvalid = InvalidInput;
  export type signUpAdminInvalid = typeof signUpAdminInvalid.static;

  // Update Profile
  export const updateProfileBody = t.Object({
    id: t.Optional(t.String()),
    name: t.Optional(
      t.String({
        minLength: 2,
        maxLength: 100,
        error: "Name must be between 2 and 100 characters long",
      }),
    ),
  });
  export type updateProfileBody = typeof updateProfileBody.static;
  export const updateProfileResponse = MessageResponse;
  export type updateProfileResponse = typeof updateProfileResponse.static;
  export const updateProfileInvalid = InvalidInput;
  export type updateProfileInvalid = typeof updateProfileInvalid.static;
}
