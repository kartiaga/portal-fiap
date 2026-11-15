import type { UserRole } from '@/lib/jwt';

/** Ver as listas de professores e estudantes (a API também libera só para esses perfis). */
export function canViewPeople(role: UserRole | undefined): boolean {
  return role === 'TEACHER' || role === 'ADMIN';
}

/** Cadastrar, editar e excluir contas é atribuição só do administrador (a API também exige). */
export function canManagePeople(role: UserRole | undefined): boolean {
  return role === 'ADMIN';
}
