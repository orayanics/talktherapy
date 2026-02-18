import { prisma } from "prisma/db";

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
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
}
