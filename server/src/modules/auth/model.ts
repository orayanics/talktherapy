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

  export const MessageResponse = t.Object({
    message: t.String(),
    account_role: t.Optional(t.String()),
  });
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
    // account_permissions
    abilities: t.Optional(t.Array(t.String(), { default: ["content:read"] })),
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

  export const verifyOtpBody = t.Object({
    email: EmailField,
    otp_code: t.String({
      minLength: 6,
      maxLength: 6,
      error: "OTP must be 6 digits",
    }),
  });
  export type verifyOtpBody = typeof verifyOtpBody.static;

  export const verifyOtpInvalid = t.Union([
    t.Literal("Invalid request"),
    t.Literal("Invalid or expired OTP"),
    t.Literal("Invalid email or OTP"),
  ]);
  export type verifyOtpInvalid = typeof verifyOtpInvalid.static;

  export const resendOtpBody = t.Object({
    id: t.String({ minLength: 1, error: "User ID is required" }),
  });
  export type resendOtpBody = typeof resendOtpBody.static;

  export const resendOtpInvalid = t.Literal("Invalid request");
  export type resendOtpInvalid = typeof resendOtpInvalid.static;

  export const activateBody = t.Object({
    name: t.String({
      minLength: 2,
      maxLength: 100,
      error: "Name must be between 2 and 100 characters long",
    }),
    email: EmailField,
    otp_code: t.String({
      minLength: 6,
      maxLength: 6,
      error: "OTP must be 6 digits",
    }),
    password: StrongPassword(),
    password_confirmation: StrongPassword(
      "Confirmation must meet password requirements",
    ),
    diagnosis_id: t.Optional(
      t.String({ minLength: 1, error: "Diagnosis is required" }),
    ),
  });
  export type activateBody = typeof activateBody.static;

  export const activateInvalid = t.Union([
    t.Literal("Invalid request"),
    t.Literal("Invalid or expired OTP"),
    t.Literal("Passwords do not match"),
  ]);
  export type activateInvalid = typeof activateInvalid.static;

  export const accountPending = t.Literal("Account is pending activation");
  export type accountPending = typeof accountPending.static;

  export const deactivateBody = t.Object({
    id: t.String({ minLength: 1, error: "User ID is required" }),
  });

  export type deactivateBody = typeof deactivateBody.static;

  export const deactivateInvalid = t.Literal(
    "Account is not valid for deactivation",
  );
  export type deactivateInvalid = typeof deactivateInvalid.static;

  export const reactivateBody = t.Object({
    id: t.String({ minLength: 1, error: "User ID is required" }),
  });
  export type reactivateBody = typeof reactivateBody.static;

  export const reactivateInvalid = t.Literal(
    "Account is not valid for reactivation",
  );
  export type reactivateInvalid = typeof reactivateInvalid.static;

  export const suspendBody = t.Object({
    id: t.String({ minLength: 1, error: "User ID is required" }),
  });
  export type suspendBody = typeof suspendBody.static;

  export const suspendInvalid = t.Literal(
    "Account is not valid for suspension",
  );
  export type suspendInvalid = typeof suspendInvalid.static;

  export const accountInactive = t.Literal(
    "Account is not active. Contact support for assistance",
  );
  export type accountInactive = typeof accountInactive.static;
}
