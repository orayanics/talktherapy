import { betterAuth } from "better-auth";
import { admin as adminPlugin, openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  ac,
  superadmin,
  admin,
  patient,
  clinician,
} from "./better-auth/permissions";

import { prisma } from "./client";

export const auth = betterAuth({
  basePath: "/api",
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
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
