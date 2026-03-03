export function parseExpiryMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multipliers[unit];
}

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
  maxAge: Math.floor(parseExpiryMs(JWT_CONFIG.refreshExpiry) / 1000),
});
