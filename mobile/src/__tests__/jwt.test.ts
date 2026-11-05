import { parseSessionToken } from '@/lib/jwt';
import { canManagePosts } from '@/lib/permissions';

const NOW = 1_800_000_000_000;

function makeToken(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.signature`;
}

describe('parseSessionToken', () => {
  it('lê os dados de um token válido', () => {
    const exp = NOW / 1000 + 60;
    expect(parseSessionToken(makeToken({ sub: 'id-1', role: 'TEACHER', exp }), NOW)).toEqual({
      id: 'id-1',
      role: 'TEACHER',
      expiresAt: exp * 1000,
    });
  });

  it('lê payload com caracteres base64url', () => {
    const exp = NOW / 1000 + 60;
    const token = makeToken({ sub: '???>>>~~~', role: 'ADMIN', exp });
    expect(parseSessionToken(token, NOW)?.id).toBe('???>>>~~~');
  });

  it('rejeita token expirado', () => {
    const exp = NOW / 1000 - 1;
    expect(parseSessionToken(makeToken({ sub: 'id-1', role: 'TEACHER', exp }), NOW)).toBeNull();
  });

  it('rejeita perfil desconhecido e token malformado', () => {
    const exp = NOW / 1000 + 60;
    expect(parseSessionToken(makeToken({ sub: 'id-1', role: 'ROOT', exp }), NOW)).toBeNull();
    expect(parseSessionToken('nao-e-um-jwt', NOW)).toBeNull();
  });
});

describe('canManagePosts', () => {
  it('permite professor e administrador, mas não estudante', () => {
    expect(canManagePosts('TEACHER')).toBe(true);
    expect(canManagePosts('ADMIN')).toBe(true);
    expect(canManagePosts('STUDENT')).toBe(false);
    expect(canManagePosts(undefined)).toBe(false);
  });
});
