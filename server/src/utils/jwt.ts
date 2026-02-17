export const JWT_CONFIG = {
  secret: process.env.APP_JWT_SECRET,
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
