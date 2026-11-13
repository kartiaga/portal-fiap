import type { UserRole } from '@/lib/jwt';

export function canManagePeople(role: UserRole | undefined): boolean {
  return role === 'TEACHER' || role === 'ADMIN';
}
