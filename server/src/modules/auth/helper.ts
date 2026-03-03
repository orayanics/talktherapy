import { prisma } from "prisma/db";
import { JWT_CONFIG, parseExpiryMs } from "@/utils/jwt";

const REFRESH_TOKEN_TTL_MS = parseExpiryMs(JWT_CONFIG.refreshExpiry as string);

export async function createRefreshToken(userId: string, rawToken: string) {
  const token_hash = await Bun.password.hash(rawToken);
  await prisma.refreshToken.create({
    data: {
      user_id: userId,
      token_hash,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
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
    data: { revoked_at: new Date() },
  });
}

export async function revokeExpiredTokensForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      user_id: userId,
      expires_at: { lt: new Date() },
      revoked_at: null,
    },
    data: { revoked_at: new Date() },
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
      data: { revoked_at: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    }),
  ]);
}
