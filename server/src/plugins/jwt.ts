import { Elysia, status } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { JWT_CONFIG, type JwtPayload } from "@/utils/jwt";

const jwtSecret = JWT_CONFIG.secret ?? "default_secret";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
      exp: JWT_CONFIG.accessExpiry,
    }),
  )
  .use(
    jwt({
      name: "jwtRefresh",
      secret: jwtSecret,
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

    const verify = async (token: string, source: "bearer" | "cookie") => {
      let payload: unknown = null;
      try {
        payload = await jwt.verify(token);
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
    };

    if (!bearerToken && !sessionToken) {
      console.warn("JWT: missing token");
      return { auth: null };
    }

    let data: Record<string, unknown> | null = null;
    if (bearerToken) {
      data = await verify(bearerToken, "bearer");
    }
    if (!data && sessionToken && sessionToken !== bearerToken) {
      data = await verify(sessionToken, "cookie");
    }
    if (!data) {
      return { auth: null };
    }

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
  });

export type JwtPlugin = typeof jwtPlugin;
