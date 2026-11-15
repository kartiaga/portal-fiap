import type { ListedRole, PersonRole } from './api';

/** Nomes de cada perfil nas listas, mensagens e botões. */
export const peopleConfig: Record<ListedRole, { plural: string; singular: string }> = {
  TEACHER: { plural: 'Professores', singular: 'professor' },
  STUDENT: { plural: 'Estudantes', singular: 'estudante' },
  ADMIN: { plural: 'Administradores', singular: 'administrador' },
};

/**
 * Perfis do campo "Perfil" no cadastro, do menor para o maior acesso, com o que cada um pode fazer
 * (mesmas regras da API). O padrão é o primeiro, o de menor acesso.
 */
export const CREATABLE_ROLES: readonly { value: PersonRole; description: string }[] = [
  { value: 'STUDENT', description: 'Lê, curte e comenta as postagens.' },
  { value: 'TEACHER', description: 'Também publica e gerencia as próprias postagens.' },
  { value: 'ADMIN', description: 'Acesso total: cadastra contas e gerencia todas as postagens.' },
];

/** Lê o perfil de um parâmetro de rota; qualquer outro valor (ou ausência) é "todos". */
export function parseListedRole(value: string | string[] | undefined): ListedRole | undefined {
  const role = Array.isArray(value) ? value[0] : value;
  return role === 'TEACHER' || role === 'STUDENT' || role === 'ADMIN' ? role : undefined;
}
