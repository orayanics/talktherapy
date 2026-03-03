import { t } from "elysia";

export namespace AuthModel {
  const EmailField = t.String({
    format: "email",
    error: "Valid email is required",
  });

  const StrongPassword = (error?: string) =>
    t.String({
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$",
      error:
        error ??
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    });

  export const MessageResponse = t.Object({ message: t.String() });
  export type MessageResponse = typeof MessageResponse.static;

  export const InvalidInput = t.Literal("Invalid input data");
  export type InvalidInput = typeof InvalidInput.static;

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

  export const signUpPatientBody = t.Object({
    name: t.String({
      minLength: 2,
      maxLength: 100,
      error: "Name must be between 2 and 100 characters long",
    }),
    email: EmailField,
    password: StrongPassword(),
    consent: t.Literal(true, { error: "Consent must be true to continue" }),
    diagnosis_id: t.String({ minLength: 1, error: "Diagnosis is required" }),
  });
  export type signUpPatientBody = typeof signUpPatientBody.static;

  export const signUpClinicianBody = t.Object({
    email: EmailField,
    diagnosis_id: t.Optional(t.String({ error: "Diagnosis is required" })),
  });
  export type signUpClinicianBody = typeof signUpClinicianBody.static;

  export const signUpAdminBody = t.Object({
    email: EmailField,
    account_permissions: t.Optional(t.String({ default: "content:read" })),
  });
  export type signUpAdminBody = typeof signUpAdminBody.static;

  export const updateProfileBody = t.Object({
    name: t.Optional(
      t.String({
        minLength: 2,
        maxLength: 100,
        error: "Name must be between 2 and 100 characters long",
      }),
    ),
  });
  export type updateProfileBody = typeof updateProfileBody.static;

  export const changePasswordBody = t.Object({
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
}
