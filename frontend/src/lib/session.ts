import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";

export type SessionUser = {
  sub: string; // id do usuário (claim "sub" do JWT)
  role: "STUDENT" | "TEACHER" | "ADMIN";
  iat: number; // timestamp de criação do JWT
  exp: number; // timestamp de expiração do JWT
};

const FIFTEEN_DAYS_IN_SECONDS = 15 * 24 * 60 * 60;

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // JS do navegador nunca lê este cookie
    secure: process.env.NODE_ENV === "production", // em dev local (http) precisa ser false
    sameSite: "lax", // mais restritivo: evita CSRF
    path: "/", // cookie válido em todas as rotas
    maxAge: FIFTEEN_DAYS_IN_SECONDS, // expira em 15 dias
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Decodifica o payload do JWT sem verificar a assinatura. Isso é aceitável
 * aqui porque o cookie é httpOnly (o navegador não pode adulterá-lo) e toda
 * chamada sensível de verdade sempre reenvia o token para o backend, que
 * é quem valida a assinatura. Serve só para exibir dados (ex: role) na UI
 * sem uma chamada de rede extra.
 */
function decodeJwtPayload(token: string): SessionUser | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  const session = decodeJwtPayload(token);
  if (!session) return null;

  const isExpired = session.exp * 1000 < Date.now();
  if (isExpired) return null;

  return session;
}
