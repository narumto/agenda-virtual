import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.PROFISSIONAL_JWT_SECRET || "agenda-virtual-pro-secret-2026"
);

export const COOKIE_NAME = "pro_session";
const EXPIRES_HOURS = 8;

export interface ProSession {
  id: string;
  nome: string;
  email: string;
  categoria: string;
}

export async function signProToken(payload: ProSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_HOURS}h`)
    .sign(secret);
}

export async function verifyProToken(token: string): Promise<ProSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as ProSession;
  } catch {
    return null;
  }
}
