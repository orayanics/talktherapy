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
  const StrongPassword = (error?: string) =>
    t.String({
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$",
      error:
        error ??
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    });

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
    password: StrongPassword(),
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

  // Change Password
  export const changePasswordBody = t.Object({
    id: t.Optional(t.String()),
    current_password: t.String({
      minLength: 1,
      error: "Password is required",
    }),
    new_password: StrongPassword(),
    new_password_confirmation: StrongPassword(
      "Confirmation must meet password requirements",
    ),
  });

  export type changePasswordBody = typeof changePasswordBody.static;
  export const changePasswordResponse = MessageResponse;
  export type changePasswordResponse = typeof changePasswordResponse.static;
  export const changePasswordInvalid = InvalidInput;
  export type changePasswordInvalid = typeof changePasswordInvalid.static;
}
