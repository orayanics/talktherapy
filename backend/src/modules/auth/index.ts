import { Elysia, status } from "elysia";

import { Auth } from "./service";
import { AuthModel } from "./model";
import { jwtPlugin } from "@/plugins/jwt";

export const auth = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .decorate({
    isProd: process.env.NODE_ENV === "production",
  })
  .post(
    "/login",
    async ({ body, cookie: { session, refresh }, jwt, jwtRefresh, isProd }) => {
      const response = await Auth.signIn(body);
      const accessToken = await jwt.sign(response.payload as any);
      const refreshToken = await jwtRefresh.sign(response.payload as any);
      const sameSite = isProd ? "none" : "lax";

      session.set({
        value: accessToken,
        httpOnly: true,
        sameSite,
        secure: isProd,
        path: "/",
      });

      refresh.set({
        value: refreshToken,
        httpOnly: true,
        sameSite,
        secure: isProd,
        path: "/",
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
  .post("/logout", async ({ cookie: { session, refresh } }) => {
    session.remove();
    refresh.remove();
    return {
      message: "Logged out successfully",
    };
  })
  .post(
    "/refresh",
    async ({ jwt, jwtRefresh, cookie: { session, refresh }, isProd }) => {
      const sameSite = isProd ? "none" : "lax";
      const refreshToken =
        typeof refresh?.value === "string" ? refresh.value : null;
      if (!refreshToken) {
        return status(401, "Unauthorized");
      }

      const payload = await jwtRefresh.verify(refreshToken);
      if (!payload || typeof payload !== "object") {
        return status(401, "Unauthorized");
      }

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

      const nextPayload = {
        userId: data.userId,
        email: data.email,
        role: data.role,
      };

      const accessToken = await jwt.sign(nextPayload as any);
      const nextRefreshToken = await jwtRefresh.sign(nextPayload as any);

      session.set({
        value: accessToken,
        httpOnly: true,
        sameSite,
        secure: isProd,
        path: "/",
      });

      refresh.set({
        value: nextRefreshToken,
        httpOnly: true,
        sameSite,
        secure: isProd,
        path: "/",
      });

      return {
        token: accessToken,
      };
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
      isAuth: false,
      hasRole: [],
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
