import type { UserRole } from './jwt';

export const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: 'Estudante',
  TEACHER: 'Professor',
  ADMIN: 'Administrador',
};
