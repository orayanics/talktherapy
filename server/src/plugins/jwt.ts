import { Elysia, status } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { JWT_CONFIG, type JwtPayload } from "@/utils/jwt";
import { prisma } from "prisma/db";

if (!JWT_CONFIG.secret || !JWT_CONFIG.refreshSecret) {
  throw new Error("JWT secrets must be defined in environment variables");
}

type JwtVerifier = { verify: (token: string) => Promise<unknown> };

async function verifyToken(
  jwtInstance: JwtVerifier,
  token: string,
  source: "bearer" | "cookie",
): Promise<Record<string, unknown> | null> {
  let payload: unknown = null;
  try {
    payload = await jwtInstance.verify(token);
  } catch (error) {
    console.warn("JWT: verification error", {
      source,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
  if (!payload || typeof payload !== "object") {
    console.warn("JWT: verification failed", { source });
    return null;
  }
  return payload as Record<string, unknown>;
}

export const jwtPlugin = new Elysia({ name: "jwt-plugin" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: JWT_CONFIG.secret,
      exp: JWT_CONFIG.accessExpiry,
    }),
  )
  .use(
    jwt({
      name: "jwtRefresh",
      secret: JWT_CONFIG.refreshSecret,
      exp: JWT_CONFIG.refreshExpiry,
    }),
  )
  .decorate({
    auth: null as JwtPayload | null,
  })
  .derive({ as: "global" }, async ({ jwt, cookie: { session }, headers }) => {
    const header = headers.authorization;
    const bearerToken = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;
    const sessionToken =
      typeof session?.value === "string" ? session.value : null;

    let data: Record<string, unknown> | null = null;
    if (bearerToken) {
      data = await verifyToken(jwt, bearerToken, "bearer");
    }
    if (!data && sessionToken && sessionToken !== bearerToken) {
      data = await verifyToken(jwt, sessionToken, "cookie");
    }
    if (!data) return { auth: null };

    if (
      typeof data.userId !== "string" ||
      typeof data.email !== "string" ||
      typeof data.role !== "string"
    ) {
      console.warn("JWT: payload missing required fields");
      return { auth: null };
    }

    return {
      auth: {
        userId: data.userId,
        email: data.email,
        role: data.role,
        iat: typeof data.iat === "number" ? data.iat : undefined,
        exp: typeof data.exp === "number" ? data.exp : undefined,
      },
    };
  })
  .macro({
    isAuth: {
      beforeHandle({ auth }) {
        if (!auth) {
          return status(401, "Unauthorized");
        }
      },
    },
    hasRole: (roles: string[]) => ({
      beforeHandle({ auth }) {
        if (!auth) {
          return status(401, "Unauthorized");
        }
        if (!roles.includes(auth.role)) {
          return status(403, "Forbidden");
        }
      },
    }),
    hasPermission: (permissions: string[]) => ({
      async beforeHandle({ auth }) {
        if (!auth) {
          return status(401, "Unauthorized");
        }
        // skip if sudo
        if (auth.role === "sudo") {
          return;
        }
        const user = await prisma.user.findUnique({
          where: { id: auth.userId },
          select: { account_permissions: true },
        });
        if (!user) {
          return status(401, "Unauthorized");
        }
        const granted = user.account_permissions
          ? user.account_permissions.split(",").map((p) => p.trim())
          : [];
        const hasAll = permissions.every((p) => granted.includes(p));
        if (!hasAll) {
          return status(403, "Forbidden");
        }
      },
    }),
  });

export type JwtPlugin = typeof jwtPlugin;
