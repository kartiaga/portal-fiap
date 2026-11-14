import type { ListedRole, PersonRole } from './api';

/** Nomes de cada perfil nas listas, mensagens e botões. */
export const peopleConfig: Record<ListedRole, { plural: string; singular: string }> = {
  TEACHER: { plural: 'Professores', singular: 'professor' },
  STUDENT: { plural: 'Estudantes', singular: 'estudante' },
  ADMIN: { plural: 'Administradores', singular: 'administrador' },
};

/** Perfis que o app cadastra, na ordem em que aparecem no formulário. */
export const CREATABLE_ROLES: readonly PersonRole[] = ['TEACHER', 'STUDENT'];

/** Lê o perfil de um parâmetro de rota; qualquer outro valor (ou ausência) é "todos". */
export function parseListedRole(value: string | string[] | undefined): ListedRole | undefined {
  const role = Array.isArray(value) ? value[0] : value;
  return role === 'TEACHER' || role === 'STUDENT' || role === 'ADMIN' ? role : undefined;
}
