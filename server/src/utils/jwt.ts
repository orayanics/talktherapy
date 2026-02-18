export const JWT_CONFIG = {
  secret: process.env.APP_JWT_SECRET,
  refreshSecret: process.env.APP_JWT_REFRESH_SECRET,
  accessExpiry: process.env.APP_JWT_ACCESS_EXPIRY || "15m",
  refreshExpiry: process.env.APP_JWT_REFRESH_EXPIRY || "7d",
};

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
export type JwtSignPayload = Pick<JwtPayload, "userId" | "email" | "role">;

export const getCookieOptions = (isProd: boolean) => ({
  httpOnly: true,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
