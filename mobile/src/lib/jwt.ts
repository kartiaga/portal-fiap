export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type SessionUser = {
  id: string;
  role: UserRole;
  expiresAt: number; // em milissegundos
};

const ROLES: readonly string[] = ['STUDENT', 'TEACHER', 'ADMIN'];

/**
 * Lê os dados do JWT sem verificar a assinatura: serve apenas para decidir o que
 * mostrar na interface. Quem valida o token de verdade é a API, em toda chamada.
 * Retorna null se o token for malformado ou estiver expirado.
 */
export function parseSessionToken(token: string, now = Date.now()): SessionUser | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const { sub, role, exp } = JSON.parse(atob(padded));

    if (typeof sub !== 'string' || !ROLES.includes(role) || typeof exp !== 'number') {
      return null;
    }

    const expiresAt = exp * 1000;
    return expiresAt > now ? { id: sub, role, expiresAt } : null;
  } catch {
    return null;
  }
}
