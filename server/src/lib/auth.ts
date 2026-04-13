import { betterAuth } from "better-auth";
import { admin as adminPlugin, openAPI, emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  ac,
  superadmin,
  admin,
  patient,
  clinician,
} from "./better-auth/permissions";

import { prisma } from "./client";
import { TRUSTED_ORIGINS } from "@/constant";
import {
  sendResetPasswordEmail,
  sendVerificationLinkEmail,
  sendVerificationOtpEmail,
} from "./mail";

const EMAIL_OTP_TTL_SECONDS = 60 * 10;
const EMAIL_OTP_NAMESPACE = "email-verification";

const getEmailOtpIdentifier = (email: string) =>
  `${EMAIL_OTP_NAMESPACE}:${email.toLowerCase()}`;

const createOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export async function issueEmailVerificationOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = createOtpCode();
  const expiresAt = new Date(Date.now() + EMAIL_OTP_TTL_SECONDS * 1000);
  const identifier = getEmailOtpIdentifier(normalizedEmail);

  await prisma.verification.deleteMany({
    where: { identifier },
  });

  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier,
      value: otp,
      expiresAt,
    },
  });

  await sendVerificationOtpEmail({
    email: normalizedEmail,
    otp,
  });

  return { expiresAt };
}

export async function verifyEmailVerificationOtp(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const identifier = getEmailOtpIdentifier(normalizedEmail);

  const verification = await prisma.verification.findFirst({
    where: {
      identifier,
      value: otp,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!verification) {
    throw new Error("Invalid or expired OTP code");
  }

  return verification;
}

export async function consumeEmailVerificationOtp(email: string, otp: string) {
  const verification = await verifyEmailVerificationOtp(email, otp);
  await prisma.verification.delete({ where: { id: verification.id } });
  return verification;
}

export const auth = betterAuth({
  basePath: "/api",
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationLinkEmail({
        email: user.email,
        url,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        email: user.email,
        url,
      });
    },
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  trustedOrigins: TRUSTED_ORIGINS,
  session: {
    expiresIn: 60 * 60 * 24,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    cookieCache: {
      enabled: true,
      options: {
        maxAge: 60 * 60 * 24,
      },
    },
  },

  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  plugins: [
    openAPI(),
    adminPlugin({
      ac,
      defaultRole: "patient",
      roles: {
        superadmin,
        admin,
        clinician,
        patient,
      },
      adminRoles: ["admin", "superadmin"],
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendVerificationOtpEmail({
          email,
          otp,
        });

        console.info(`[auth] OTP type=${type} sent to ${email}`);
      },
    }),
  ],
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());
export const OpenAPI = {
  getPaths: (prefix = "/auth/api") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);
      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];
        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];
          operation.tags = ["Better Auth"];
        }
      }
      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
