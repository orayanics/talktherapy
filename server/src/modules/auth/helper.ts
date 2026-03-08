import { prisma } from "prisma/db";
import { JWT_CONFIG, parseExpiryMs } from "@/utils/jwt";
import { addMs, nowUtc } from "@/utils/date";

const REFRESH_TOKEN_TTL_MS = parseExpiryMs(JWT_CONFIG.refreshExpiry as string);

export async function createRefreshToken(userId: string, rawToken: string) {
  const token_hash = await Bun.password.hash(rawToken);
  await prisma.refreshToken.create({
    data: {
      user_id: userId,
      token_hash,
      expires_at: addMs(nowUtc(), REFRESH_TOKEN_TTL_MS),
    },
  });
}

export async function findAndMatchRefreshToken(
  userId: string,
  rawToken: string,
) {
  const tokens = await prisma.refreshToken.findMany({
    where: { user_id: userId, revoked_at: null },
  });

  return Promise.any(
    tokens.map(async (t) => {
      const valid = await Bun.password.verify(rawToken, t.token_hash);
      if (!valid) throw new Error();
      return t;
    }),
  ).catch(() => null);
}

export async function revokeRefreshToken(tokenId: string) {
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revoked_at: nowUtc() },
  });
}

export async function revokeExpiredTokensForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      user_id: userId,
      expires_at: { lt: nowUtc() },
      revoked_at: null,
    },
    data: { revoked_at: nowUtc() },
  });
}

export async function rotateRefreshToken(
  tokenId: string,
  userId: string,
  newRawToken: string,
) {
  const token_hash = await Bun.password.hash(newRawToken);
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revoked_at: nowUtc() },
    }),
    prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash,
        expires_at: addMs(nowUtc(), REFRESH_TOKEN_TTL_MS),
      },
    }),
  ]);
}

// ─── OTP helpers ─────────────────────────────────────────────────────────────

const OTP_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const OTP_PURPOSE_ACTIVATION = "account_activation";

function generateOtpCode(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

export async function createActivationOtp(userId: string): Promise<string> {
  // Clear any stale activation OTPs before issuing a new one
  await prisma.otp.deleteMany({
    where: { user_id: userId, purpose: OTP_PURPOSE_ACTIVATION },
  });

  const plainCode = generateOtpCode();
  const otp_code = await Bun.password.hash(plainCode);

  await prisma.otp.create({
    data: {
      user_id: userId,
      otp_code,
      purpose: OTP_PURPOSE_ACTIVATION,
      expires_at: addMs(nowUtc(), OTP_TTL_MS),
    },
  });

  return plainCode;
}

export async function verifyActivationOtp(
  userId: string,
  code: string,
): Promise<boolean> {
  const otps = await prisma.otp.findMany({
    where: {
      user_id: userId,
      purpose: OTP_PURPOSE_ACTIVATION,
      expires_at: { gt: nowUtc() },
    },
  });

  const verified = await Promise.any(
    otps.map(async (otp) => {
      const valid = await Bun.password.verify(code, otp.otp_code);
      if (!valid) throw new Error();
      return true;
    }),
  ).catch(() => false);

  if (verified) {
    // Consume — delete all activation OTPs for this user
    await prisma.otp.deleteMany({
      where: { user_id: userId, purpose: OTP_PURPOSE_ACTIVATION },
    });
  }

  return verified;
}

/** Check OTP validity without consuming it. Used for the pre-check step. */
export async function checkActivationOtp(
  userId: string,
  code: string,
): Promise<boolean> {
  const otps = await prisma.otp.findMany({
    where: {
      user_id: userId,
      purpose: OTP_PURPOSE_ACTIVATION,
      expires_at: { gt: nowUtc() },
    },
  });

  return Promise.any(
    otps.map(async (otp) => {
      const valid = await Bun.password.verify(code, otp.otp_code);
      if (!valid) throw new Error();
      return true;
    }),
  ).catch(() => false);
}
