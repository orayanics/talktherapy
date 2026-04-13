import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.BETTER_AUTH_SECRET || "dev_join_secret";
const DEFAULT_TTL = 60 * 5; // 5 minutes

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(s: string) {
  // convert base64url to base64
  let str = s.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  while (str.length % 4 !== 0) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

export function signJoinToken(
  payload: { appointmentId: string; roomId: string; userId: string },
  ttl = DEFAULT_TTL,
) {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const body = { ...payload, exp, n: randomBytes(6).toString("hex") };
  const b = base64url(JSON.stringify(body));
  const sig = createHmac("sha256", SECRET).update(b).digest("hex");
  return `${b}.${sig}`;
}

export function verifyJoinToken(token: string) {
  if (!token) throw new Error("Missing token");
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Invalid token format");
  const [b, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(b).digest("hex");
  if (!cryptoSafeEqual(expected, sig)) throw new Error("Invalid signature");
  const payload = JSON.parse(base64urlDecode(b));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp)
    throw new Error("Token expired");
  return payload as {
    appointmentId: string;
    roomId: string;
    userId: string;
    exp: number;
    n: string;
  };
}

function cryptoSafeEqual(a: string, b: string) {
  try {
    const A = Buffer.from(a, "hex");
    const B = Buffer.from(b, "hex");
    if (A.length !== B.length) return false;
    return (
      createHmac("sha256", SECRET).update(A).digest("hex") ===
      createHmac("sha256", SECRET).update(B).digest("hex")
    );
  } catch (e) {
    return false;
  }
}

export default { signJoinToken, verifyJoinToken };
