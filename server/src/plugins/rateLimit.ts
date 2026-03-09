import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";

const ipPathGenerator = (
  request: Request,
  server: Elysia["server"],
): string => {
  const ip =
    server?.requestIP(request)?.address ??
    (request as Request & { headers: Headers }).headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ??
    "unknown";
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
};

export const strictRateLimit = new Elysia({ name: "rate-limit:strict" }).use(
  rateLimit({
    duration: 60_000, // 1 minute
    max: 5,
    scoping: "scoped",
    generator: ipPathGenerator,
    errorResponse: new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Too many attempts. Please wait a moment and try again.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    ),
  }),
);

export const otpRateLimit = new Elysia({ name: "rate-limit:otp" }).use(
  rateLimit({
    duration: 5 * 60_000, // 5 minutes
    max: 3,
    scoping: "scoped",
    generator: ipPathGenerator,
    errorResponse: new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Too many OTP attempts. Please wait 5 minutes and try again.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    ),
  }),
);

export const globalRateLimit = new Elysia({ name: "rate-limit:global" }).use(
  rateLimit({
    duration: 60_000, // 1 minute
    max: 100,
    generator: ipPathGenerator,
    errorResponse: new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message:
          "Server is receiving too many requests. Please wait a moment and try again.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    ),
  }),
);
