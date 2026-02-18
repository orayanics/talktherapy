import { Elysia, status } from "elysia";

import { Auth } from "./service";
import { AuthModel } from "./model";
import { jwtPlugin } from "@/plugins/jwt";
import { prisma } from "prisma/db";
import {
  findAndMatchRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from "./helper";
import { JWT_CONFIG, type JwtSignPayload } from "@/utils/jwt";
import { getCookieOptions } from "@/utils/jwt";

export const auth = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .decorate({
    isProd: process.env.NODE_ENV === "production",
  })
  .post(
    "/login",
    async ({ body, cookie: { session, refresh }, jwt, jwtRefresh, isProd }) => {
      const response = await Auth.signIn(body);
      const signPayload: JwtSignPayload = {
        userId: response.payload.userId,
        email: response.payload.email,
        role: response.payload.role,
      };

      const accessToken = await jwt.sign(signPayload);
      const refreshToken = await jwtRefresh.sign(signPayload);
      const sameSite = isProd ? "none" : "lax";

      session.set({
        ...getCookieOptions(isProd),
        value: accessToken,
      });

      refresh.set({
        ...getCookieOptions(isProd),
        value: refreshToken,
      });

      const tokenHash = await Bun.password.hash(refreshToken);
      await prisma.refreshToken.create({
        data: {
          user_id: response.payload.userId,
          token_hash: tokenHash,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        email: response.email,
        token: accessToken,
      };
    },
    {
      body: AuthModel.signInBody,
      response: {
        200: AuthModel.signInResponse,
        400: AuthModel.signInInvalid,
      },
    },
  )
  .post("/logout", async ({ jwtRefresh, cookie: { session, refresh } }) => {
    const rawToken = typeof refresh?.value === "string" ? refresh.value : null;

    if (rawToken) {
      const payload = await jwtRefresh.verify(rawToken);
      if (
        payload &&
        typeof payload === "object" &&
        typeof payload.userId === "string"
      ) {
        const matched = await findAndMatchRefreshToken(
          payload.userId,
          rawToken,
        );
        if (matched) await revokeRefreshToken(matched.id);
      }
    }

    session.remove();
    refresh.remove();

    return { message: "Logged out successfully" };
  })
  .post(
    "/refresh",
    async ({ jwt, jwtRefresh, cookie: { session, refresh }, isProd }) => {
      const rawToken =
        typeof refresh?.value === "string" ? refresh.value : null;
      if (!rawToken) return status(401, "Unauthorized");

      const payload = await jwtRefresh.verify(rawToken);
      if (!payload || typeof payload !== "object")
        return status(401, "Unauthorized");

      const data = payload as {
        userId?: string;
        email?: string;
        role?: string;
      };
      if (
        typeof data.userId !== "string" ||
        typeof data.email !== "string" ||
        typeof data.role !== "string"
      ) {
        return status(401, "Unauthorized");
      }

      const matched = await findAndMatchRefreshToken(data.userId, rawToken);
      if (!matched) return status(401, "Unauthorized");

      const nextPayload = {
        userId: data.userId,
        email: data.email,
        role: data.role,
      };
      const accessToken = await jwt.sign(nextPayload as any);
      const nextRefreshToken = await jwtRefresh.sign(nextPayload as any);

      await rotateRefreshToken(matched.id, data.userId, nextRefreshToken);

      session.set({
        ...getCookieOptions(isProd),
        value: accessToken,
      });

      refresh.set({
        ...getCookieOptions(isProd),
        value: nextRefreshToken,
      });

      return { token: accessToken };
    },
  )
  .post(
    "/signup/patient",
    async ({ body }) => {
      const response = await Auth.signUpPatient(body);
      return response;
    },
    {
      body: AuthModel.signUpPatientBody,
      response: {
        200: AuthModel.signUpPatientResponse,
        400: AuthModel.signUpPatientInvalid,
      },
    },
  )
  .post(
    "/signup/clinician",
    async ({ body }) => {
      const response = await Auth.signUpClinician(body);
      return response;
    },
    {
      body: AuthModel.signUpClinicianBody,
      response: {
        200: AuthModel.signUpClinicianResponse,
        400: AuthModel.signUpClinicianInvalid,
      },
      isAuth: true,
      hasRole: ["admin", "sudo"],
    },
  )
  .post(
    "/signup/admin",
    async ({ body }) => {
      const response = await Auth.signUpAdmin(body);
      return response;
    },
    {
      body: AuthModel.signUpAdminBody,
      response: {
        200: AuthModel.signUpAdminResponse,
        400: AuthModel.signUpAdminInvalid,
      },
      isAuth: true,
      hasRole: ["sudo"],
    },
  )
  .get(
    "/session",
    async ({ auth }) => {
      const response = await Auth.getSession(auth!);
      return response;
    },
    {
      isAuth: true,
    },
  );
