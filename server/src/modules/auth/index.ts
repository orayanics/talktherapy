import { Elysia, status } from "elysia";
import { Auth } from "./service";
import { AuthModel } from "./model";
import { jwtPlugin } from "@/plugins/jwt";
import { strictRateLimit, otpRateLimit } from "@/plugins/rateLimit";
import {
  createRefreshToken,
  findAndMatchRefreshToken,
  revokeExpiredTokensForUser,
  revokeRefreshToken,
  rotateRefreshToken,
} from "./helper";
import { type JwtSignPayload, getCookieOptions } from "@/utils/jwt";

export const authModule = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .decorate("isProd", process.env.NODE_ENV === "production")
  // ── Strict-limited routes: 5 req / 60 s per IP (login, logout, refresh, signup) ─
  .guard({}, (app) =>
    app
      .use(strictRateLimit)
      // POST: /auth/login
      .post(
        "/login",
        async ({
          body,
          cookie: { session, refresh },
          jwt,
          jwtRefresh,
          isProd,
        }) => {
          const response = await Auth.signIn(body);
          const signPayload: JwtSignPayload = {
            userId: response.payload.userId,
            email: response.payload.email,
            role: response.payload.role,
          };

          const [accessToken, refreshToken] = await Promise.all([
            jwt.sign(signPayload),
            jwtRefresh.sign(signPayload),
          ]);

          const cookieOpts = getCookieOptions(isProd);
          session.set({ ...cookieOpts, value: accessToken });
          refresh.set({ ...cookieOpts, value: refreshToken });

          await createRefreshToken(response.payload.userId, refreshToken);

          return { email: response.email, token: accessToken };
        },
        {
          body: AuthModel.signInBody,
          response: {
            200: AuthModel.signInResponse,
            400: AuthModel.signInInvalid,
            403: AuthModel.accountPending,
          },
        },
      )
      // POST: /auth/logout
      .post("/logout", async ({ jwtRefresh, cookie: { session, refresh } }) => {
        const rawToken =
          typeof refresh?.value === "string" ? refresh.value : null;

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
      // POST: /auth/refresh
      .post(
        "/refresh",
        async ({ jwt, jwtRefresh, cookie: { session, refresh }, isProd }) => {
          const rawToken =
            typeof refresh?.value === "string" ? refresh.value : null;
          if (!rawToken) return status(401, "Unauthorized");

          const payload = await jwtRefresh.verify(rawToken);
          if (!payload || typeof payload !== "object") {
            // token expired or invalid — clear cookies so frontend redirects
            session.remove();
            refresh.remove();
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

          // remove stale tokens without blocking the response
          revokeExpiredTokensForUser(data.userId);

          const matched = await findAndMatchRefreshToken(data.userId, rawToken);
          if (!matched) {
            session.remove();
            refresh.remove();
            return status(401, "Unauthorized");
          }

          const nextPayload: JwtSignPayload = {
            userId: data.userId,
            email: data.email,
            role: data.role,
          };

          const [accessToken, nextRefreshToken] = await Promise.all([
            jwt.sign(nextPayload),
            jwtRefresh.sign(nextPayload),
          ]);

          await rotateRefreshToken(matched.id, data.userId, nextRefreshToken);

          const cookieOpts = getCookieOptions(isProd);
          session.set({ ...cookieOpts, value: accessToken });
          refresh.set({ ...cookieOpts, value: nextRefreshToken });

          return { token: accessToken };
        },
      )
      // POST: /auth/signup/patient
      .post("/signup/patient", async ({ body }) => Auth.signUpPatient(body), {
        body: AuthModel.signUpPatientBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.InvalidInput,
        },
      }),
  )
  // ── OTP-limited routes: 3 req / 5 min per IP (resend-otp, verify-otp, activate) ─
  .guard({}, (app) =>
    app
      .use(otpRateLimit)
      // POST: /auth/resend-otp
      // For: sudo and admin only route
      .post("/resend-otp", ({ body }) => Auth.resendOtp(body), {
        isAuth: true,
        hasRole: ["sudo", "admin"],
        hasPermission: ["users:create"],
        body: AuthModel.resendOtpBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.resendOtpInvalid,
        },
      })
      // POST: /auth/verify-otp
      // For: clinician, admin signup
      .post("/verify-otp", ({ body }) => Auth.verifyOtp(body), {
        body: AuthModel.verifyOtpBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.verifyOtpInvalid,
        },
      })
      // POST: /auth/activate
      // For: clinician, admin sign up
      .post("/activate", ({ body }) => Auth.activateAccount(body), {
        body: AuthModel.activateBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.activateInvalid,
        },
      }),
  )
  // PROTECTED ROUTES: admin & sudo only
  .guard(
    {
      isAuth: true,
      hasRole: ["admin", "sudo"],
      hasPermission: ["user:create"],
    },
    (app) =>
      // POST: /auth/signup/clinician
      app.post(
        "/signup/clinician",
        async ({ body, auth }) => Auth.signUpClinician(body, auth!.userId),
        {
          body: AuthModel.signUpClinicianBody,
          response: {
            200: AuthModel.MessageResponse,
            400: AuthModel.InvalidInput,
          },
        },
      ),
  )
  // PROTECTED ROUTES: sudo only
  .guard({ isAuth: true, hasRole: ["sudo"] }, (app) =>
    // POST: /auth/signup/admin
    app
      .post(
        "/signup/admin",
        async ({ body, auth }) => Auth.signUpAdmin(body, auth!.userId),
        {
          body: AuthModel.signUpAdminBody,
          response: {
            200: AuthModel.MessageResponse,
            400: AuthModel.InvalidInput,
          },
        },
      )
      // POST: /auth/deactivate
      .post("/deactivate", async ({ body }) => Auth.deactivateAccount(body), {
        body: AuthModel.deactivateBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.InvalidInput,
          403: AuthModel.deactivateInvalid,
        },
      })
      // POST: /auth/reactivate
      .post("/reactivate", async ({ body }) => Auth.reactivateAccount(body), {
        body: AuthModel.deactivateBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.InvalidInput,
          403: AuthModel.deactivateInvalid,
        },
      })
      // POST: /auth/suspend
      .post("/suspend", async ({ body }) => Auth.suspendAccount(body), {
        body: AuthModel.suspendBody,
        response: {
          200: AuthModel.MessageResponse,
          400: AuthModel.InvalidInput,
          403: AuthModel.suspendInvalid,
        },
      }),
  )
  // PROTECTED ROUTES: any auth user
  .guard({ isAuth: true }, (app) =>
    app
      // GET: /auth/session
      .get("/session", async ({ auth }) => Auth.getSession(auth!))
      // PUT: /auth/profile/update
      .put(
        "/profile/update",
        async ({ body, auth }) => Auth.updateUserInfo(auth!.userId, body),
        {
          body: AuthModel.updateProfileBody,
          response: {
            200: AuthModel.MessageResponse,
            400: AuthModel.InvalidInput,
          },
        },
      )
      // PUT: /auth/profile/password
      .put(
        "/profile/password",
        async ({ body, auth }) => Auth.changePassword(auth!.userId, body),
        {
          body: AuthModel.changePasswordBody,
          response: {
            200: AuthModel.MessageResponse,
            400: AuthModel.InvalidInput,
          },
        },
      ),
  );
