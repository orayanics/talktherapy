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

export const getCookieOptions = (_isProd: boolean) => ({
  httpOnly: true,
  // SameSite=None + Secure required for cross-origin cookies (frontend on
  // port 3000, backend on port 8000 = different origins). Both servers run
  // HTTPS in dev (self-signed cert) and prod, so Secure=true is always safe.
  sameSite: "none" as const,
  secure: true,
  path: "/",
  maxAge: Math.floor(parseExpiryMs(JWT_CONFIG.refreshExpiry) / 1000),
});
